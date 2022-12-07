import * as t from '@babel/types'

export interface ErrorInfo {
    errorType: ErrorType;
    extraMsg?: string;
    errorLevel: ErrorLevel;
}

export interface CodeInfo {
    node: t.Node;
    filePath: string;
    code: string;
}

export interface IErrorCollector {
    collect: (codeInfo: CodeInfo, errorInfo: ErrorInfo) => any
}

export interface CodeError {
    filePath: string;
    loc: t.SourceLocation;
    range: [number, number];
    pluginTips: string;
    codeFrameErrMsg?: string;
    extraMsg?: string;
    errorLevel: ErrorLevel
}

export enum ErrorType {
    needTryCatch = 1,
    needHandlerInCatch,
    dangerousAndOperator,
    dangerousInitState,
    dangerousDefaultValue
}

export const pluginTipsMap = {
    [ErrorType.needTryCatch]: 'Should be wrapped by try...catch...',
    [ErrorType.needHandlerInCatch]: 'Should handle error in catch block',
    [ErrorType.dangerousAndOperator]: 'The value of this expression may not be as expected',
    [ErrorType.dangerousInitState]: "The function execution result is included in the initial value of the component's state, and the function is executed only when the module is loaded",
    [ErrorType.dangerousDefaultValue]: "The value may be null!"
}

export enum ErrorLevel {
    error = 1,
    warning,
    hint,
}

export const getErrorLevel = (level: string | number) => {
    let lv =  ErrorLevel.error;
    if (typeof level === 'number') {
        lv =  ErrorLevel[level] ? level : ErrorLevel.error
    } else if (typeof level === 'string') {
        lv = ErrorLevel[level] ? ErrorLevel[level] : ErrorLevel.error
    }
    return lv;
}