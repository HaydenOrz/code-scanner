import { transformSync } from '@babel/core'
import { readFileSync } from 'fs';
import needTryCatch from '../plugins/need-try-catch-plugin.js';
import dangerousAndOperator from '../plugins/dangerous-and-operator.js';
import FileSearcher from '../utils/fileSearcher.js';

// const pattern = '../dt-works/dt-batch-works/src/**/*.(tsx|js)'
const pattern = './mock/**/*.(tsx|js)'

function run () {
    const fileSearcher = new FileSearcher(pattern)
    const fileMeta = fileSearcher.run()
    fileMeta.forEach(({path, plugins}) => {
        const fileContent = readFileSync(path, {
            encoding: 'utf8',
        });
        transformSync(fileContent, {
            plugins: [
                // [needTryCatch, { sourceFilePath: path }],
                [dangerousAndOperator]
            ],
            parserOpts: {
                sourceType: 'unambiguous',
                plugins: [
                    ...plugins,
                    // "decorators",
                    "decorators-legacy",
                    "decoratorAutoAccessors"
                ]
            },
            code: false,
            comments: false,
            filename: path,
            sourceFileName: path,
            highlightCode: true
        });
    })
}

run()

