import t from '@babel/types'
import { codeFrameColumns } from '@babel/code-frame'
import chalk from 'chalk'

export interface CodeError {
    filePath: string;
    codeFrameErrMsg: string;
    loc: {
        line: number;
        column: number;
    };
    pluginTips: string;
    extraMsg?: string 
}

export enum ErrorType {
    needTryCatch = 1,
    needHandlerInCatch,
    dangerousAndOperator,
    dangerousInitState
}

export const pluginTipsMap = {
    [ErrorType.needTryCatch]: 'Should be wrapped by try...catch...',
    [ErrorType.needHandlerInCatch]: 'Should handle error in catch block',
    [ErrorType.dangerousAndOperator]: 'The value of this expression may not be as expected',
    [ErrorType.dangerousInitState]: "The function execution result is included in the initial value of the component's state, and the function is executed only when the module is loaded",
}

export default class ErrorCollector {

    _errorPool: Map<CodeError, ErrorType> = new Map<CodeError, ErrorType>()

    static buildCodeError (node: t.Node, filePath: string, code: string, errorType: ErrorType, extraMsg?: string,): CodeError {
        const codeFrameErrMsg = codeFrameColumns(
            code,
            { start: node.loc.start, end: node.loc.end },
            { highlightCode: true,  }
        )
        const pluginTips = pluginTipsMap[errorType]
        return {
            filePath,
            codeFrameErrMsg,
            loc: node.loc.end,
            pluginTips,
            extraMsg
        }
    }

    saveCodeErrors = (codeError: CodeError, errorType: ErrorType) => {
        this._errorPool.set(codeError, errorType)
    }

    buildAndSaveCodeError = (node: t.Node, filePath: string, code: string, errorType: ErrorType, extraMsg?: string) => {
        const codeError = ErrorCollector.buildCodeError(node, filePath, code, errorType, extraMsg)
        this.saveCodeErrors(codeError, errorType)
    }

    getCodeErrors = () => {
        return Array.from(this._errorPool.keys())
    }

    clearCodeErrors = () => {
        this._errorPool.clear()
    }

    printCodeErrors = () => {
        this._errorPool.forEach((type, { pluginTips, filePath, loc, codeFrameErrMsg, extraMsg }) => {
            console.log(
                chalk.cyan(filePath),
                chalk.yellow(`(${loc.line}, ${loc.column + 1})`),
                chalk.redBright('Error:'),
                chalk.gray(pluginTips),
                chalk.yellow('\n' + extraMsg)
            )
            console.log(codeFrameErrMsg);
            console.log('\n');
        })
    }
}