import fastGlob from "fast-glob";
import { normalize, extname } from 'path';
import type { ParserPlugin } from '@babel/parser';

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
export type Excludes = Pattern[];
export type FileResult = {
    path: string;
    parsePlugins: ParserPlugin[]
}[]

class FileSearcher {
    constructor (includes: Includes, excludes?: Excludes) {
        this.patterns = includes
        this.ignorePatterns = excludes
    }
    private patterns: Includes;
    private ignorePatterns: Excludes;
    private filesPaths: string [];

    private matchFiles() {
        const filesPath = fastGlob
            .sync(
                this.patterns,
                { ignore: this.ignorePatterns, dot: true, absolute: true }
            )
            .map(normalize)
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