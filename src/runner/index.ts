import { transformSync } from '@babel/core'
import type { ParserPlugin } from '@babel/parser';
import { readFileSync } from 'fs';
import FileSearcher, { Includes, Excludes, FileResult } from '../utils/fileSearcher.js';
import needTryCatch, { NeedTryCatchOptions } from '../plugins/need-try-catch-plugin.js';
import dangerousAndOperator, { DangerousAndOperatorOptions } from '../plugins/dangerous-and-operator.js';
import needHandlerInCatch, { NeedHandlerInCatchOptions } from '../plugins/need-handler-in-catch-block.js'

export type ScanPluginsConf = 
{ plugin: 'needTryCatch', options?:Omit<NeedTryCatchOptions, 'sourceFilePath'> }
| { plugin: 'dangerousAndOperator', options?:Omit<DangerousAndOperatorOptions, 'sourceFilePath'> }
| { plugin: 'needHandlerInCatch', options?:Omit<NeedHandlerInCatchOptions, 'sourceFilePath'> }

export interface Options {
    includes: Includes;
    excludes?: Excludes;
    scanPlugins: ScanPluginsConf[];
    babelParsePlugins?: ParserPlugin[];
    fileEncoding?: BufferEncoding;
}

const pluginsMap = {
    needTryCatch,
    dangerousAndOperator,
    needHandlerInCatch
}

export default class Runner {
    constructor (options: Options) {
        this._options = options
    }
    private _options: Options;
    private _fileMeta: FileResult;

    private _getFileMeta () {
        const { includes, excludes } = this._options
        const fileSearcher = new FileSearcher(includes, excludes)
        this._fileMeta = fileSearcher.run()
    }

    private _getBabelPlugins  (plugins: ScanPluginsConf[], sourceFilePath: string) {
        return plugins.map(({ plugin, options }) => {
            return pluginsMap[plugin]
                ? [
                    pluginsMap[plugin],
                    { ...options, sourceFilePath }
                ] 
                : null
        }).filter(Boolean)
    }

    private _begin () {
        const { scanPlugins, babelParsePlugins, fileEncoding } = this._options
        this._fileMeta.forEach(({path, parsePlugins}) => {

            const fileContent = readFileSync(path, {
                encoding: fileEncoding ?? 'utf8',
            });

            transformSync(fileContent, {
                plugins: this._getBabelPlugins(scanPlugins, path),
                parserOpts: {
                    sourceType: 'unambiguous',
                    plugins: Array.from(new Set([
                        ...parsePlugins,
                        "decorators-legacy",
                        "decoratorAutoAccessors",
                        ...babelParsePlugins,
                    ])) 
                },
                code: false,
                comments: false,
                filename: path,
                sourceFileName: path,
                highlightCode: true
            });
        })
    }

    run() {
        this._getFileMeta();
        this._begin();
    }
}

// export default function run (options: Options) {
//     const { includes, excludes, plugins } = options
//     const fileSearcher = new FileSearcher(includes, excludes)
//     const fileMeta = fileSearcher.run()

//     fileMeta.forEach(({path, parsePlugins}) => {
//         const fileContent = readFileSync(path, {
//             encoding: 'utf8',
//         });
//         transformSync(fileContent, {
//             plugins: getBabelPlugins(plugins, path),
//             parserOpts: {
//                 sourceType: 'unambiguous',
//                 plugins: [
//                     ...parsePlugins,
//                     "decorators-legacy",
//                     "decoratorAutoAccessors"
//                 ]
//             },
//             code: false,
//             comments: false,
//             filename: path,
//             sourceFileName: path,
//             highlightCode: true
//         });
//     })
// }
