import fastGlob from "fast-glob";
import { normalize, extname } from 'path';
import type { ParserPlugin } from '@babel/parser';
import { logDebugInfo } from './debug'

export enum EXTENSION_TYPE {
    JS = '.js',
    JSX = '.jsx',
    TS = '.ts',
    TSX = '.tsx',
}

export interface AutomatonType {
    [EXTENSION_TYPE.TS]: ParserPlugin[];
    [EXTENSION_TYPE.JSX]: ParserPlugin[];
    [EXTENSION_TYPE.TSX]: ParserPlugin[];
    [EXTENSION_TYPE.JS]: ParserPlugin[];
    [typeName: string]: ParserPlugin[];
}

export const Automaton: AutomatonType = {
    [EXTENSION_TYPE.TS]: ['typescript'],
    [EXTENSION_TYPE.TSX]: ['jsx', 'typescript'],
    [EXTENSION_TYPE.JSX]: ['jsx'],
    [EXTENSION_TYPE.JS]: [],
};

export type Pattern = string;
export type PatternsGroup = Pattern[];
export type Includes = Pattern | Pattern[];
export type Excludes = Pattern | Pattern[];
export type FileResult = {
    path: string;
    parsePlugins: ParserPlugin[]
}[]

class FileSearcher {
    constructor (includes: Includes, excludes?: Excludes, debug?: boolean) {
        this.patterns = includes
        this.ignorePatterns = excludes
        this._debug = debug
    }
    private patterns: Includes;
    private ignorePatterns: Excludes;
    private filesPaths: string [];
    private _debug: boolean;

    private matchFiles() {
        const filesPath = fastGlob
            .sync(
                this.patterns,
                { 
                    ignore: Array.isArray(this.ignorePatterns) 
                        ? this.ignorePatterns 
                        : this.ignorePatterns 
                            ? [this.ignorePatterns]
                            : undefined,
                    dot: true, 
                    absolute: true
                }
            )
            .map(normalize)
        if(this._debug) {
            logDebugInfo('All matched files are: ', filesPath)
        }
        this.filesPaths = filesPath
    }

    private getFilePlugins(filePath: string): ParserPlugin[] {
        const fileExtName: keyof typeof Automaton = extname(filePath)
        return Automaton[fileExtName] ?? []
    }

    private combineFileAndPlugins(): FileResult {
        return this.filesPaths.map(filePath => ({
            path: filePath,
            parsePlugins: this.getFilePlugins(filePath)
        }))
    }

    run(): FileResult {
        this.matchFiles()
        return this.combineFileAndPlugins()
    }

}

export default FileSearcher