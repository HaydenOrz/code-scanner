import * as t from '@babel/types'
import type { Scope } from '@babel/traverse'

export function isReactClassComponentDeclaration (node: t.ClassDeclaration, scope: Scope, reactImportPath) {
    let superClassIdentifier = ''

    if(t.isMemberExpression(node.superClass) && t.isIdentifier(node.superClass.property) && (node.superClass.property.name === 'Component' || node.superClass.property.name === 'PureComponent') ) {
        superClassIdentifier = t.isIdentifier(node.superClass.object) ? node.superClass.object.name : ''
    } else if (t.isIdentifier(node.superClass)) {
        superClassIdentifier = node.superClass.name
    }

    if(scope.hasBinding(superClassIdentifier)) {
        const binding = scope.getBinding(superClassIdentifier);
        /**
         * 暂时只处理 ESM 规范引入
         * TODO: 处理 const { useState } = React 的情况
         */
        if(binding?.kind === 'module' 
            && (t.isImportSpecifier(binding.path.node)
                || t.isImportDefaultSpecifier(binding.path.node)
                || t.isImportNamespaceSpecifier(binding.path.node))
            && t.isImportDeclaration(binding.path.parent)
        ) {
            const importPath = binding.path.parent.source.value;
            if(importPath === reactImportPath) {
                return true
            }
        }
    }

    return false
}

export function isReactHookCallExpression (node: t.CallExpression, scope: Scope, reactImportPath) {
    let bindingName = ''
    let hookName = ''
    if (t.isIdentifier(node.callee)) {
        bindingName = node.callee.name;
        hookName = node.callee.name;
    } else if (t.isMemberExpression(node.callee)) {
        if(t.isIdentifier(node.callee.object) && t.isIdentifier(node.callee.property) ) {
            bindingName = node.callee.object.name;
            hookName = node.callee.property.name;
        }
    }
    console.log(bindingName, hookName);
    /**
     * 暂时只处理 ESM 规范引入
     * TODO: 
     * 1. 处理 const { useState } = React 的情况
     * 2. 处理 import { useState as xxx } from 'react' 的情况
     */
    if (scope.hasBinding(bindingName)) {
        const binding = scope.getBinding(bindingName);
        if(binding?.kind === 'module' 
            && (t.isImportSpecifier(binding.path.node)
                || t.isImportDefaultSpecifier(binding.path.node)
                || t.isImportNamespaceSpecifier(binding.path.node))
            && t.isImportDeclaration(binding.path.parent)
        ) {
            const importPath = binding.path.parent.source.value;
            console.log(importPath, 'aaa');
            if(importPath === reactImportPath && hookName.startsWith('use')) {
                return hookName
            }
        }
    }

    return false
}