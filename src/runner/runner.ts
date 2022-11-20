import { transformSync } from '@babel/core';
import type { ParserPlugin } from '@babel/parser';
import type { PluginItem  } from '@babel/core';


interface IRunnerConf {
    code: string;
    scanPluginsConf: PluginItem[];
    babelParsePlugins: ParserPlugin[];
    filePath?: string
}


export default class Runner {
    constructor (config?: IRunnerConf) {
        config && (this._config = config);
    }

    private _config: IRunnerConf

    updateConfig = (config: IRunnerConf) => {
        this._config = config;
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