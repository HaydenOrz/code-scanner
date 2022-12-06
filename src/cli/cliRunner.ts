import type { ParserPlugin } from '@babel/parser';
import { readFileSync } from 'fs';
import chalk from 'chalk'
import ProgressBar from 'progress'
import FileSearcher, { Includes, Excludes, FileResult } from '../utils/fileSearcher';
import ErrorCollector from '../runner/errorCollector';
import { ScanPluginsConf } from '../plugins'
import Scanner from '../runner';

export interface ICliScannerConfig {
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

export default class RunnerForCli {
    constructor (scannerConfig?: ICliScannerConfig, debug?: boolean) {
        this._config = scannerConfig;
        this._debug = debug;
    }

    private _config: ICliScannerConfig;
    private _fileMeta: FileResult;
    private _errorCollector: ErrorCollector;
    private _debug: boolean;
    private _bar: InstanceType<typeof ProgressBar>

    private _getFileMeta () {
        const { includes, excludes } = this._config
        const fileSearcher = new FileSearcher(includes, excludes, this._debug)
        this._fileMeta = fileSearcher.run()
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
        const scanPluginsConf = Scanner.genScanPluginsConf(scanPlugins, this._errorCollector)

        if(!scanPluginsConf?.length) {
            console.log(
                chalk.redBright('Error: '),
                chalk.gray(`There are no scanPlugins available!\n`)
            );
            return
        }

        const scanner = new Scanner()        

        this._fileMeta.forEach(({path, parsePlugins}) => {
            const fileContent = readFileSync(path, {
                encoding: fileEncoding ?? 'utf8',
            });
            this._bar.tick()
            scanner.setConfig({
                code: fileContent,
                scanPluginsConf,
                babelParsePlugins: [...parsePlugins, ...babelParsePlugins],
                filePath: path
            })
            scanner.run()
        })

        console.log(chalk.green.bold('Scanner run finished!'));
        this._bar.terminate();
    }

    setConfig = (config: ICliScannerConfig) => {
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
