import * as t from '@babel/types'
import { declare } from '@babel/helper-plugin-utils';
import { ErrorType, IErrorCollector } from '../runner/codeError'

export interface DangerousAndOperatorOptions {
    errorCollector: IErrorCollector;
}

function getRootIdentifierOfMemberExpression(node: t.MemberExpression): t.Identifier {
    let rootIdentifier: t.Identifier = null;
    let currentNode: t.Node = node;
    while (rootIdentifier === null && !!currentNode) {
        if (t.isIdentifier(currentNode)) {
            rootIdentifier = currentNode;
            break;
        } else if (t.isMemberExpression(currentNode)) {
            currentNode = currentNode.object;
        } else {
            break;
        }
        /**
         * TODO: 需要处理 foo().bar 这种情况
         */
    }
    return rootIdentifier
}

const dangerousAndOperator = declare((api, options: DangerousAndOperatorOptions) => {
    api.assertVersion(7);   
    return {
        visitor: {
            LogicalExpression(path, state) {
                const parentNode = path.parent
                const node = path.node
                const { errorCollector } = options
                let flag = false;
                if (node.operator !== '&&') return 
                if (t.isObjectProperty(parentNode)
                    || t.isVariableDeclarator(parentNode)
                    || t.isArrayExpression(parentNode)
                    || t.isReturnStatement(parentNode)
                    || t.isArrowFunctionExpression(parentNode)
                    || t.isJSXExpressionContainer(parentNode)
                ) {
                    const { left, right } = node;
                    let leftRootIdentifierName: string = null
                    let rightRootIdentifierName: string = null
                    if(t.isMemberExpression(left) && t.isJSXElement(right)) {
                        flag = t.isIdentifier(left.property) && left.property.name === 'length'
                    }

                    if(!t.isJSXExpressionContainer(parentNode)) {
                        if (t.isMemberExpression(left) && t.isIdentifier(right)) {
                            rightRootIdentifierName = right.name
                            leftRootIdentifierName = getRootIdentifierOfMemberExpression(left).name
                        }
                        if(t.isIdentifier(left) && t.isMemberExpression(right)){
                            leftRootIdentifierName = left.name;
                            rightRootIdentifierName = getRootIdentifierOfMemberExpression(right).name
                        }
                        flag = leftRootIdentifierName !== null && leftRootIdentifierName === rightRootIdentifierName
                    }
                }
                if (flag) {
                    errorCollector.collect(node, state.filename, state.file.code, ErrorType.dangerousAndOperator)
                }
            },
        },
    }
})

export default dangerousAndOperator