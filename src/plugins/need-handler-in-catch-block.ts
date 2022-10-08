import t from '@babel/types'
import { declare } from '@babel/helper-plugin-utils';
import ErrorCollector, { ErrorType } from '../utils/errorCollector.js'

export interface NeedHandlerInCatchOptions {
    reactImportPath?: string;
    errorCollector: ErrorCollector;
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
                const { errorCollector } = options

                if (t.isBlockStatement(node.body) && !node.body.body?.length) {
                    errorCollector.buildAndSaveCodeError(node, state.filename, state.file.code, ErrorType.needHandlerInCatch)
                }
            },
            // promise.catch()
            CallExpression (path, state) {
                const node = path.node
                const { errorCollector } = options
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
                    const { end: { line, column } } = (node.loc as t.SourceLocation)
                    errorCollector.buildAndSaveCodeError(node, state.filename, state.file.code, ErrorType.needHandlerInCatch)
                }
            },
            // componentDidCatch in react component
            ClassMethod (path, state) {
                const node = path.node
                const { errorCollector } = options
                const reactImportPath = options.reactImportPath || 'react'
                if(t.isIdentifier(node.key) &&  node.key.name === 'componentDidCatch' && !node.static) {
                    if(t.isBlockStatement(node.body) && !node.body.body.length) {
                        if(t.isClassBody(path.parentPath) && t.isClassDeclaration(path.parentPath.parent)) {
                            const declaration = path.parentPath.parent;
                            let superClassIdentifier = ''
                            
                            if(t.isMemberExpression(declaration.superClass) && t.isIdentifier(declaration.superClass.property) && (declaration.superClass.property.name === 'Component' || declaration.superClass.property.name === 'PureComponent') ) {
                                superClassIdentifier = t.isIdentifier(declaration.superClass.object) ? declaration.superClass.object.name : ''
                            } else if (t.isIdentifier(declaration.superClass)) {
                                superClassIdentifier = declaration.superClass.name
                            }

                            if(path.scope.hasBinding(superClassIdentifier)) {
                                const binding = path.scope.getBinding(superClassIdentifier);
                                /**
                                 * Currently only compatible with Specification ESM
                                 */
                                if(binding?.kind === 'module' && (t.isImportSpecifier(binding.path.node) || t.isImportDefaultSpecifier(binding.path.node)) && t.isImportDeclaration(binding.path.parent)) {
                                    const importPath = binding.path.parent.source.value;
                                    if(importPath === reactImportPath) {
                                        errorCollector.buildAndSaveCodeError(node, state.filename, state.file.code, ErrorType.needHandlerInCatch)
                                    }
                                }
                            }
                        }
                    }
            
                }
            }
        },
    }
})

export default needHandlerInCatch