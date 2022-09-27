import t from '@babel/types'
import type { NodePath } from '@babel/traverse'
import { declare } from '@babel/helper-plugin-utils';

export interface DangerousAndOperatorOptions {
    sourceFilePath: string
}

const dangerousAndOperator = declare((api, options: DangerousAndOperatorOptions) => {
    api.assertVersion(7);   
    return {
        pre() {
            this.set('errors', []);
        },

        visitor: {
            LogicalExpression(path, state) {
                debugger
            },
        },

        post() {
            this.get('errors').forEach(err => {
                console.error(err, '\n');
            });
        }
    }
})

export default dangerousAndOperator