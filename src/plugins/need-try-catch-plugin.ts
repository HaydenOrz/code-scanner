import * as t from '@babel/types'
import type { NodePath } from '@babel/core'
import { declare } from '@babel/helper-plugin-utils';
import { ErrorType } from '../runner/codeError'
import type { BasePluginOptions } from './const'

export interface NeedTryCatchOptions extends BasePluginOptions {
}

const isBoundary = (path: NodePath<t.Node>) => {
    return (path.isFunctionDeclaration()
        || path.isClassMethod()
        || path.isArrowFunctionExpression()
        || t.isStaticBlock(path.node)
    ) 
}

const hasErrorCapture = (path: NodePath<t.CallExpression>) => {
    let currentPath: NodePath<t.Node> = path.scope.path
    let flag: boolean = false

    while (!flag && !t.isProgram(currentPath.node) && !isBoundary(currentPath)) {
        if (currentPath.parentPath?.isTryStatement()) {
            flag = true
        }
        currentPath = currentPath.scope.parent.path;
    }

    return flag
}


const needTryCatch = declare((api, options: NeedTryCatchOptions, dirname) => {
    api.assertVersion(7);   
    return {
        visitor: {
            CallExpression(path, state) {
                const { errorCollector, level } = options
                const { node } = path
                if ( t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object) && t.isIdentifier(node.callee.property) ) {
                    if (node.callee.object.name === 'JSON' && node.callee.property.name === 'parse') {
                        if(!hasErrorCapture(path)) {
                            errorCollector.collect({
                                node,
                                filePath: state.filename,
                                code: state.file.code,
                            }, {
                                errorType: ErrorType.needTryCatch,
                                errorLevel: level
                            })
                        }
                    }
                }
            },
        },
    }
})

export default needTryCatch