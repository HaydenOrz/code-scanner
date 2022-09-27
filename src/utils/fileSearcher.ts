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

export type PatternsGroup = Pattern[]

export type FileResult = {
    path: string;
    plugins: ParserPlugin[]
}[]

class FileSearcher {
    constructor (includes: Pattern | Pattern[], excludes?: Pattern[]) {
        this.patterns = includes
        this.ignorePatterns = excludes
    }
    private patterns: Pattern | Pattern[];
    private ignorePatterns: Pattern[] | undefined;
    private filesPath: string []

    private matchFiles() {
        const filesPath = fastGlob
            .sync(
                this.patterns,
                { ignore: this.ignorePatterns, dot: true, absolute: true }
            )
            .map(normalize)
        this.filesPath = filesPath
    }

    private getFilePlugins(filePath): ParserPlugin[] {
        const fileExtName: keyof typeof Automaton = extname(filePath)
        return Automaton[fileExtName] ?? []
    }

    private combineFileAndPlugins(): FileResult {
        return this.filesPath.map(filePath => ({
            path: filePath,
            plugins: this.getFilePlugins(filePath)
        }))
    }

    run(): FileResult {
        this.matchFiles()
        return this.combineFileAndPlugins()
    }

}

export default FileSearcher