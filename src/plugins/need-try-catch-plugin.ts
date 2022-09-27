import t from '@babel/types'
import type { NodePath } from '@babel/traverse'
import { declare } from '@babel/helper-plugin-utils';


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


const needTryCatch = declare((api, options, dirname) => {
    api.assertVersion(7);   
    return {
        pre() {
            this.set('errors', []);
        },

        visitor: {
            CallExpression(path, state) {
                const { node } = path
                const errors = state.get('errors');
                if ( t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object) && t.isIdentifier(node.callee.property) ) {
                    if (node.callee.object.name === 'JSON' && node.callee.property.name === 'parse') {
                        if(!hasErrorCapture(path)) {
                            const { end: { line, column } } = (node.loc as t.SourceLocation)
                            const tmp = Error.stackTraceLimit;
                            debugger
                            Error.stackTraceLimit = 0;
                            errors.push(path.buildCodeFrameError(`${options.sourceFilePath}(${line},${column}) Should be wrapped by try-catch`, Error));
                            Error.stackTraceLimit = tmp;
                        }
                    }
                }
            },
        },

        post() {
            this.get('errors').forEach(err => {
                console.error(err, '\n');
            });
        }
    }
})

export default needTryCatch