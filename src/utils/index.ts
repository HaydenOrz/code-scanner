import t from '@babel/types'
import type { Scope } from '@babel/traverse'

export function isReactClassComponentDeclaration (node: t.ClassDeclaration, scope: Scope, reactImportPath) {
    let superClassIdentifier = ''
    let flag = false

    if(t.isMemberExpression(node.superClass) && t.isIdentifier(node.superClass.property) && (node.superClass.property.name === 'Component' || node.superClass.property.name === 'PureComponent') ) {
        superClassIdentifier = t.isIdentifier(node.superClass.object) ? node.superClass.object.name : ''
    } else if (t.isIdentifier(node.superClass)) {
        superClassIdentifier = node.superClass.name
    }

    if(scope.hasBinding(superClassIdentifier)) {
        const binding = scope.getBinding(superClassIdentifier);
        /**
         * Currently only compatible with Specification ESM
         */
        if(binding?.kind === 'module' && (t.isImportSpecifier(binding.path.node) || t.isImportDefaultSpecifier(binding.path.node)) && t.isImportDeclaration(binding.path.parent)) {
            const importPath = binding.path.parent.source.value;
            if(importPath === reactImportPath) {
                flag = true
            }
        }
    }

    return flag
}