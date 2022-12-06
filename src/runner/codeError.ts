import * as t from '@babel/types'

export interface IErrorCollector {
    collect: (node: t.Node, filePath: string, code: string, errorType: ErrorType, extraMsg?: string) => any
}

export interface CodeError {
    filePath: string;
    loc: t.SourceLocation;
    range: [number, number]
    pluginTips: string;
    codeFrameErrMsg?: string;
    extraMsg?: string 
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