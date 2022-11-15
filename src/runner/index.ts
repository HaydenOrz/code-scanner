import { transformSync } from '@babel/core';
import type { ParserPlugin } from '@babel/parser';
import { readFileSync } from 'fs';
import chalk from 'chalk'
import ProgressBar from 'progress'
import FileSearcher, { Includes, Excludes, FileResult } from './fileSearcher';
import ErrorCollector, { ErrorType } from './errorCollector';
import needTryCatch, { NeedTryCatchOptions } from '../plugins/need-try-catch-plugin';
import dangerousAndOperator, { DangerousAndOperatorOptions } from '../plugins/dangerous-and-operator';
import needHandlerInCatch, { NeedHandlerInCatchOptions } from '../plugins/need-handler-in-catch-block';
import dangerousInitState, { DangerousInitStateOptions } from '../plugins/dangerous-init-state';
import dangerousDefaultValue, { DangerousDefaultValueOptions } from '../plugins/dangerous-default-value'


export type ScanPluginsConf = 
    { plugin: 'needTryCatch', options?: Omit<NeedTryCatchOptions, 'errorCollector'> } |
    { plugin: 'dangerousAndOperator', options?: Omit<DangerousAndOperatorOptions, 'errorCollector'> } |
    { plugin: 'needHandlerInCatch', options?: Omit<NeedHandlerInCatchOptions, 'errorCollector'> } |
    { plugin: 'dangerousInitState', options?: Omit<DangerousInitStateOptions, 'errorCollector'> } |
    { plugin: 'dangerousDefaultValue', options?: Omit<DangerousDefaultValueOptions, 'errorCollector'> }


export interface IScannerConfig {
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
    needHandlerInCatch,
    dangerousInitState,
    dangerousDefaultValue
}

export default class Runner {
    constructor (scannerConfig?: IScannerConfig, debug?: boolean) {
        this._config = scannerConfig;
        this._debug = debug;
    }

    private _config: IScannerConfig;
    private _fileMeta: FileResult;
    private _errorCollector: ErrorCollector;
    private _debug: boolean;
    private _bar: InstanceType<typeof ProgressBar>

    private _getFileMeta () {
        const { includes, excludes } = this._config
        const fileSearcher = new FileSearcher(includes, excludes, this._debug)
        this._fileMeta = fileSearcher.run()
    }

    private _getBabelPluginsConf (plugins: ScanPluginsConf[], errorCollector: ErrorCollector) {
        return plugins.map(({ plugin, options }) => {
            if(!pluginsMap[plugin]) {
                console.log(
                    chalk.redBright('Error: '),
                    chalk.gray(`Plugin ${plugin} is not found! Please check your config! \n `)
                );
                return null
            }
            const pluginOptions = {
                ...options,
                errorCollector
            }
            return [pluginsMap[plugin], pluginOptions]
        }).filter(Boolean)
    }

    private _initProcessBar = () => {
        const barFormat = chalk.cyan.bold('  Scanning ') + ':bar' + chalk.green.bold(' :percent');
        this._bar = new ProgressBar(barFormat,
            {
                complete: chalk.green('█'),
                incomplete: chalk.whiteBright('█'),
                width: 30,
                total: this._fileMeta.length,
            }
        );
    }

    private _begin () {
        const { scanPlugins, babelParsePlugins = [], fileEncoding } = this._config
        if(!scanPlugins?.length) {
            console.log(
                chalk.redBright('Error: '),
                chalk.gray(`ScanPlugins not found in config file \n`)
            );
            return
        }

        this._errorCollector = new ErrorCollector()

        const scanPluginsConf = this._getBabelPluginsConf(scanPlugins, this._errorCollector)
    
        if(!scanPluginsConf?.length) {
            console.log(
                chalk.redBright('Error: '),
                chalk.gray(`There are no scanPlugins available!\n`)
            );
            return
        }

        this._fileMeta.forEach(({path, parsePlugins}) => {
            const fileContent = readFileSync(path, {
                encoding: fileEncoding ?? 'utf8',
            });
            this._bar.tick()
            transformSync(fileContent, {
                plugins: scanPluginsConf,
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

        console.log(chalk.green.bold('Scanner run finished!'));
        this._bar.terminate();
    }

    setConfig = (config: IScannerConfig) => {
        this._config = config;
    }

    setDebugMode = () => {
        this._debug = true
    }

    getErrorCollector = () => {
        return this._errorCollector
    }

    run() {
        this._getFileMeta();
        this._initProcessBar()
        this._begin();
    }
}
