import * as t from '@babel/types'
import { declare } from '@babel/helper-plugin-utils';
import { ErrorType, IErrorCollector } from '../runner/codeError'

export interface DangerousDefaultValueOptions {
    errorCollector: IErrorCollector;
}

const dangerousDefaultValue = declare((api, options: DangerousDefaultValueOptions) => {
    api.assertVersion(7);   
    return {
        visitor: {
            AssignmentPattern (path, state) {
                const node = path.node
                const defaultValue = node.right
                const errorCollector = options.errorCollector
                if(!t.isObjectExpression(defaultValue) && !t.isArrayExpression(defaultValue)) return; // 只处理默认值为对象或数组的情况
                errorCollector.collect(node, state.filename, state.file.code, ErrorType.dangerousDefaultValue);
            }
        },
    }
})

export default dangerousDefaultValue