import { transformSync } from '@babel/core';
import type { ParserPlugin } from '@babel/parser';
import type { PluginItem  } from '@babel/core';
import { ScanPluginsConf, pluginsMap } from '../plugins'
import { IErrorCollector } from './codeError'

export interface IScannerConf {
    code?: string;
    scanPluginsConf?: PluginItem[];
    babelParsePlugins?: ParserPlugin[];
    filePath?: string
}

export default class Scanner {
    constructor (config?: IScannerConf) {
        config && (this._config = config);
    }

    static genScanPluginsConf (plugins: ScanPluginsConf[], errorCollector: IErrorCollector) {
        return plugins.map(({ plugin, options }) => {
            if(!pluginsMap[plugin]) {
                return null
            }
            const pluginOptions = {
                ...options,
                errorCollector
            }
            return [pluginsMap[plugin], pluginOptions]
        }).filter(Boolean)
    }

    private _config: IScannerConf = {}

    setConfig = (config: IScannerConf) => {
        this._config = {
            ...this._config,
            ...config
        };
    }

    run = () => {
        const { code, scanPluginsConf, babelParsePlugins, filePath } = this._config;
        transformSync(code, {
            plugins: scanPluginsConf,
            parserOpts: {
                sourceType: 'unambiguous',
                errorRecovery: true,
                plugins: Array.from(new Set([
                    "decorators-legacy",
                    "decoratorAutoAccessors",
                    ...babelParsePlugins,
                ])) 
            },
            code: false,
            comments: false,
            filename: filePath,
            sourceFileName: filePath,
        });
    }
}