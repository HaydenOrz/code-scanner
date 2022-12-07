import { IErrorCollector, ErrorLevel } from '../runner/codeError'

export type BasePluginOptions = {
    errorCollector: IErrorCollector;
    level: ErrorLevel;
}