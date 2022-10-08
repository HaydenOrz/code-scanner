import { transformSync } from '@babel/core'
import type { ParserPlugin } from '@babel/parser';
import { readFileSync } from 'fs';
import FileSearcher, { Includes, Excludes, FileResult } from '../utils/fileSearcher.js';
import ErrorCollector from '../utils/errorCollector.js'
import needTryCatch, { NeedTryCatchOptions } from '../plugins/need-try-catch-plugin.js';
import dangerousAndOperator, { DangerousAndOperatorOptions } from '../plugins/dangerous-and-operator.js';
import needHandlerInCatch, { NeedHandlerInCatchOptions } from '../plugins/need-handler-in-catch-block.js'

export type ScanPluginsConf = 
    { plugin: 'needTryCatch', options?: Omit<NeedTryCatchOptions, 'errorCollector'> } |
    { plugin: 'dangerousAndOperator', options?: Omit<DangerousAndOperatorOptions, 'errorCollector'> } |
    { plugin: 'needHandlerInCatch', options?: Omit<NeedHandlerInCatchOptions, 'errorCollector'> }

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
    private _errorCollector: ErrorCollector;

    private _getFileMeta () {
        const { includes, excludes } = this._options
        const fileSearcher = new FileSearcher(includes, excludes)
        this._fileMeta = fileSearcher.run()
    }

    private _getBabelPluginsConf (plugins: ScanPluginsConf[], errorCollector: ErrorCollector) {
        return plugins.map(({ plugin, options }) => {
            if(!pluginsMap[plugin]) {
                console.error('plugin is not found!');
                return null
            }
            const pluginOptions = {
                ...options,
                errorCollector
            }
            return [pluginsMap[plugin], pluginOptions]
        }).filter(Boolean)
    }

    private _begin () {
        const { scanPlugins, babelParsePlugins = [], fileEncoding } = this._options
        if(!scanPlugins?.length) return

        this._errorCollector = new ErrorCollector()

        this._fileMeta.forEach(({path, parsePlugins}) => {
            const fileContent = readFileSync(path, {
                encoding: fileEncoding ?? 'utf8',
            });

            transformSync(fileContent, {
                plugins: this._getBabelPluginsConf(scanPlugins, this._errorCollector),
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
            });
        })

        this._errorCollector.printCodeErrors()
    }

    run() {
        this._getFileMeta();
        this._begin();
    }
}
