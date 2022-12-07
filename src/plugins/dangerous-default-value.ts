import * as t from '@babel/types'
import { declare } from '@babel/helper-plugin-utils';
import { ErrorType } from '../runner/codeError'
import type { BasePluginOptions } from './const'

export interface DangerousDefaultValueOptions extends BasePluginOptions {
}

const dangerousDefaultValue = declare((api, options: DangerousDefaultValueOptions) => {
    api.assertVersion(7);   
    return {
        visitor: {
            AssignmentPattern (path, state) {
                const node = path.node
                const defaultValue = node.right
                const errorCollector = options.errorCollector
                const level = options.level
                if(!t.isObjectExpression(defaultValue) && !t.isArrayExpression(defaultValue)) return; // 只处理默认值为对象或数组的情况
                errorCollector.collect({
                    node,
                    filePath: state.filename,
                    code: state.file.code,
                }, {
                    errorType: ErrorType.dangerousDefaultValue,
                    errorLevel: level,
                })
            }
        },
    }
})

export default dangerousDefaultValue