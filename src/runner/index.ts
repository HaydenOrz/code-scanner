import { transformSync } from '@babel/core'
import type { ParserPlugin } from '@babel/parser';
import { readFileSync } from 'fs';
import FileSearcher, { Includes, Excludes, FileResult } from '../utils/fileSearcher.js';
import needTryCatch, { NeedTryCatchOptions } from '../plugins/need-try-catch-plugin.js';
import dangerousAndOperator, { DangerousAndOperatorOptions } from '../plugins/dangerous-and-operator.js';
import needHandlerInCatch, { NeedHandlerInCatchOptions } from '../plugins/need-handler-in-catch-block.js'

export type ScanPluginsConf = 
{ plugin: 'needTryCatch', options?: NeedTryCatchOptions }
| { plugin: 'dangerousAndOperator', options?: DangerousAndOperatorOptions }
| { plugin: 'needHandlerInCatch', options?: NeedHandlerInCatchOptions }

export interface Options {
    /**
     * The files you want to scan
     */
    includes: Includes;
     /**
     * The files you want to ignore
     */
    excludes?: Excludes;
    /**
     * The scanning plugin you want to use
     */
    scanPlugins: ScanPluginsConf[];
    /**
     * babel parse plugin
     */
    babelParsePlugins?: ParserPlugin[];
    /**
     * The file encoding format
     */
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
                ? [ pluginsMap[plugin], { ...options, sourceFilePath } ] 
                : null
        }).filter(Boolean)
    }

    private _begin () {
        const { scanPlugins, babelParsePlugins = [], fileEncoding } = this._options
        if(!scanPlugins?.length) return

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
