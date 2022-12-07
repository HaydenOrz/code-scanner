import * as t from '@babel/types'
import { declare } from '@babel/helper-plugin-utils';
import { isReactClassComponentDeclaration } from '../utils/babelUtils'
import { ErrorType, IErrorCollector, ErrorLevel } from '../runner/codeError'
import type { BasePluginOptions } from './const'

export interface NeedHandlerInCatchOptions extends BasePluginOptions  {
    reactImportPath?: string;
}

const needHandlerInCatch = declare((api, options: NeedHandlerInCatchOptions) => {
    api.assertVersion(7);   
    return {
        /**
         * 'CatchClause｜CallExpression' is not supported in current ts definitions of babel 
         */
        visitor: {
            // try...catch...
            CatchClause (path, state) {
                const node = path.node
                const { errorCollector, level } = options

                if (t.isBlockStatement(node.body) && !node.body.body?.length) {
                    errorCollector.collect({
                        node,
                        filePath: state.filename,
                        code: state.file.code,
                    }, {
                        errorType: ErrorType.needHandlerInCatch,
                        errorLevel: level
                    })
                }
            },
            // promise.catch()
            CallExpression (path, state) {
                const node = path.node
                const { errorCollector, level } = options
                let isEmpty = false

                if (t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property) && node.callee.property.name === 'catch') {
                    if (!node.arguments.length) {
                        isEmpty = true
                    }
                    const argument = node.arguments[0]
                    if (t.isArrowFunctionExpression(argument) || t.isFunctionExpression(argument)) {
                        if(t.isBlockStatement(argument.body) && !argument.body.body.length) {
                            isEmpty = true
                        }
                    }
                }

                if (isEmpty) {
                    errorCollector.collect({
                        node,
                        filePath: state.filename,
                        code: state.file.code,
                    }, {
                        errorType: ErrorType.needHandlerInCatch,
                        errorLevel: level
                    })
                }
            },
            // componentDidCatch in react component
            ClassMethod (path, state) {
                const node = path.node
                const { errorCollector, level } = options
                const reactImportPath = options.reactImportPath ?? 'react'
                if(t.isIdentifier(node.key) &&  node.key.name === 'componentDidCatch' && !node.static) {
                    if(t.isBlockStatement(node.body) && !node.body.body.length) {
                        if(t.isClassBody(path.parentPath) && t.isClassDeclaration(path.parentPath.parent)) {
                            if(isReactClassComponentDeclaration(path.parentPath.parent, path.parentPath.parentPath.scope, reactImportPath)) {
                                errorCollector.collect({
                                    node,
                                    filePath: state.filename,
                                    code: state.file.code,
                                }, {
                                    errorType: ErrorType.needHandlerInCatch,
                                    errorLevel: level
                                })
                            }
                        }
                    }
            
                }
            }
        },
    }
})

export default needHandlerInCatch