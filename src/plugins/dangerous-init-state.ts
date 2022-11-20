import * as t from '@babel/types'
import { declare } from '@babel/helper-plugin-utils';
import type { Scope } from '@babel/traverse'
import { isReactClassComponentDeclaration } from '../utils/babelUtils'
import { ErrorType, ErrorCollector } from '../runner/codeError'

export interface DangerousInitStateOptions {
    reactImportPath?: string;
    errorCollector: ErrorCollector;
}

interface ShouldCheckIdentifier {
    identifierName: string;
    propertyPath: string;
}

interface SuspectedIdentifier extends ShouldCheckIdentifier {
    valuePaths: string[] | null
}

function findIdentifierInObjectProperty (
    node: t.ObjectExpression | t.ArrayExpression,
    scope: Scope,
    shouldCheckIdentifiers: ShouldCheckIdentifier [],
    propertyPath: string
) {
    if (t.isObjectExpression(node)) {
        node.properties.forEach(property => {
            if (!t.isObjectProperty(property)) return;
            const propertyName = t.isIdentifier(property.key) ? property.key.name : '[expression property]'

            if (t.isIdentifier(property.value) && scope.getBinding(property.value.name)) { // 不能使用 scope.hasBinding ，因为name可能是 undefined 或者 NaN
                const propertyValueName = property.value.name
                if(!shouldCheckIdentifiers.some(id => id.identifierName === propertyValueName) ) {
                    shouldCheckIdentifiers.push({
                        identifierName: property.value.name,
                        propertyPath: `${propertyPath}.${propertyName}`
                    })
                }
            } else if (t.isObjectExpression(property.value) || t.isArrayExpression(property.value)){
                findIdentifierInObjectProperty(property.value, scope, shouldCheckIdentifiers, `${propertyPath}.${propertyName}`)
            }
        })
    } else if (t.isArrayExpression(node)) {
        node.elements.forEach((ele, index) => {
            if (t.isIdentifier(ele) && scope.getBinding(ele.name)) {
                if(!shouldCheckIdentifiers.some(id => id.identifierName === ele.name) ) {
                    shouldCheckIdentifiers.push({
                        identifierName: ele.name,
                        propertyPath: `${propertyPath}[${index}]`
                    })
                }
            } else if (t.isObjectExpression(ele) || t.isArrayExpression(ele)){
                findIdentifierInObjectProperty(ele, scope, shouldCheckIdentifiers, `${propertyPath}[${index}]`)
            }
        })
    }
}

function isDangerousNode (node: t.Node) {
    if(t.isCallExpression(node)) return true
    if(t.isMemberExpression(node) && t.isIdentifier(node.property)) {
        const propertyName = node.property.name
        if(propertyName !== 'href' && propertyName !== 'pathname' && propertyName !== 'hash' && propertyName !== 'search') {
            return false
        }
        if(t.isIdentifier(node.object) && node.object.name === 'location') {
            return true
        }
        if(t.isMemberExpression(node.object) && t.isIdentifier(node.object.property) && node.object.property.name === 'location') {
            return true
        }
    }
    return false
} 

function findPropertyInitByFunc(identifierName: string, scope: Scope) {
    const binding = scope.getBinding(identifierName)
    if(!binding) {
        return
    }
    const { path: { node } } = binding;

    function findFuncRes (node: t.ObjectExpression | t.ArrayExpression | t.ArrayExpression, valuePath: string, result: string[]) {
        if (t.isObjectExpression(node)) {
            node.properties.forEach(property => {
                if (!t.isObjectProperty(property)) return;
                const propertyName = t.isIdentifier(property.key) ? property.key.name : '[expression property]'
    
                if (isDangerousNode(property.value)) {
                    result.push(`${valuePath}.${propertyName}`)
                } else if (t.isObjectExpression(property.value) || t.isArrayExpression(property.value)){
                    findFuncRes(property.value, `${valuePath}.${propertyName}`, result)
                }
            })
        } else if (t.isArrayExpression(node)) {
            node.elements.forEach((ele, index) => {
                if (isDangerousNode(ele)) {
                    result.push(`${valuePath}[${index}]`)
                } else if (t.isObjectExpression(ele) || t.isArrayExpression(ele)){
                    findFuncRes(ele, `${valuePath}[${index}]`, result)
                }
            })
        }
    }

    /**
     * 暂时只考虑 state 初始值来源于文件内部声明变量的情况
     */
    if (t.isVariableDeclarator(node)) {
        const init = node.init;
        if (t.isArrayExpression(init) || t.isObjectExpression(init)) {
            const result: string[] = []
            findFuncRes(init, identifierName, result);
            return result
        } else {
            return null
        }
    } else {
        return null
    }
}

function generateErrMsgWithSuspectedList (suspectedIdentifiers: SuspectedIdentifier[]) {
    const res: string = suspectedIdentifiers.reduce((prev, { propertyPath, valuePaths, identifierName }) => {
        return prev + `"${propertyPath}" init by "${identifierName}"; And ${valuePaths.reduce((pre, cur) => pre + `"${cur}"、`,"").slice(0, -1)} init by function execution\n`
    },'')
    return res
}

const dangerousInitState = declare((api, options: DangerousInitStateOptions) => {
    api.assertVersion(7);   
    return {
        visitor: {
            // class state
            ClassProperty(path, state) {
                const node = path.node
                const reactImportPath = options.reactImportPath ?? 'react'
                const errorCollector = options.errorCollector

                if ((t.isIdentifier(node.key) && node.key.name === 'state' && !node.static)) {
                    if(t.isClassBody(path.parentPath) && t.isClassDeclaration(path.parentPath.parent)) {
                        const classDeclarationScope = path.parentPath.parentPath.scope
                        if(isReactClassComponentDeclaration(path.parentPath.parent, classDeclarationScope, reactImportPath)) {
                            const shouldCheckIdentifiers: ShouldCheckIdentifier [] = []
                            const initStateValue = path.node.value
                            if (t.isIdentifier(initStateValue) && classDeclarationScope.getBinding(initStateValue.name)) {
                                shouldCheckIdentifiers.push({
                                    identifierName: initStateValue.name,
                                    propertyPath: 'state'
                                })
                            } else if (t.isObjectExpression(initStateValue)) {
                                findIdentifierInObjectProperty(initStateValue, classDeclarationScope, shouldCheckIdentifiers, 'state')
                            }
                            const suspectedIdentifiers: SuspectedIdentifier[] = shouldCheckIdentifiers
                                .map((identifier) => {
                                    const res = findPropertyInitByFunc(identifier.identifierName, classDeclarationScope)
                                    return res?.length
                                        ? { ...identifier, valuePaths: res }  
                                        : null
                                })
                                .filter(Boolean)

                            suspectedIdentifiers.length && errorCollector.collect(node, state.filename, state.file.code, ErrorType.dangerousInitState, generateErrMsgWithSuspectedList(suspectedIdentifiers))
                        }
                    }
                }
            }
        },
    }
})

export default dangerousInitState