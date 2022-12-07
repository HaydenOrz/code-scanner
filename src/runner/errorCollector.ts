import { codeFrameColumns } from '@babel/code-frame'
import chalk from 'chalk';
import { outPutMarkdown } from '../utils/convertError2md'
import { CodeError, ErrorType, pluginTipsMap, IErrorCollector, CodeInfo, ErrorInfo, ErrorLevel } from './codeError'

const tipsColorMap = {
    [ErrorLevel.error]: 'redBright',
    error: 'redBright',
    [ErrorLevel.warning]: 'yellowBright',
    warning: 'yellowBright',
    [ErrorLevel.hint]: 'blue',
    hint: 'blue',
}

export default class ErrorCollector implements IErrorCollector {

    private _errorPool: Map<CodeError, ErrorType> = new Map<CodeError, ErrorType>()

    static buildCodeError (codeInfo: CodeInfo, errorInfo: ErrorInfo): CodeError {
        const { code, node, filePath } = codeInfo;
        const { errorType, errorLevel, extraMsg } = errorInfo;
        const codeFrameErrMsg = codeFrameColumns(
            code,
            { start: node.loc.start, end: node.loc.end },
            { highlightCode: true }
        )
        const pluginTips = pluginTipsMap[errorType]
        return {
            filePath,
            codeFrameErrMsg,
            loc: node.loc,
            pluginTips,
            extraMsg,
            range: [node.start?? 0, node.end ?? 0],
            errorLevel,
        }
    }

    saveCodeErrors = (codeError: CodeError, errorType: ErrorType) => {
        this._errorPool.set(codeError, errorType)
    }

    collect = (codeInfo: CodeInfo, errorInfo: ErrorInfo) => {
        const codeError = ErrorCollector.buildCodeError(codeInfo, errorInfo)
        this.saveCodeErrors(codeError, errorInfo.errorType)
    }

    getCodeErrors = () => {
        return this._errorPool
    }

    clearAll = () => {
        this._errorPool.clear()
    }

    printCodeErrors = () => {
        this._errorPool.forEach((type, { pluginTips, filePath, loc, codeFrameErrMsg, extraMsg, errorLevel }) => {
            const pathLog = chalk.cyan(`${filePath}(${loc.end.line}, ${loc.end.column + 1})`);
            const tipsLog = chalk[tipsColorMap[errorLevel]](`\n${ErrorLevel[errorLevel]}: ${pluginTips}`)
            const extraMsgLog = extraMsg ? chalk.yellow('\n' + extraMsg) : ''
            console.log(
                pathLog,
                tipsLog,
                extraMsgLog
            )
            console.log(codeFrameErrMsg);
            console.log('\n');
        })
    }

    printSummary = (print: boolean = true) => {
        const errors = Array.from(this._errorPool.entries()) 
        const total = errors.length;

        const pluginSummary = errors.reduce((prev, cur) => {
            const [ error, type ] = cur
            const level = error.errorLevel;
            if(prev[ErrorType[type]]) {
                prev[ErrorType[type]].count += 1
            } else {
                prev[ErrorType[type]] = {
                    type,
                    level,
                    count: 1
                }
            }
            return prev
        },{} as { [key: string]: { type: ErrorType, count: number, level: ErrorLevel } } )

        if(print) {
            let totalLog = chalk.bold(`total: ${total}\n`);
            const levelCountMap = errors.reduce((prev, cur) => {
                if(prev[cur[0].errorLevel]) {
                    prev[cur[0].errorLevel] += 1
                } else {
                    prev[cur[0].errorLevel] = 1
                }
                return prev
            }, {} as {
                [key in ErrorLevel]: number
            });
            ([ ErrorLevel.error, ErrorLevel.warning, ErrorLevel.hint ]).forEach(lv => {
                totalLog += `${levelCountMap[lv]} ${chalk[tipsColorMap[lv]](ErrorLevel[lv]+'s')}, `
            });
            let pluginLog = chalk.white('\n============= plugin results =============\n');
            Object.values(pluginSummary).forEach(({type, count, level}) => {
                pluginLog += chalk.cyanBright(`${ErrorType[type]}`)+ chalk.gray(" -> ") + count + chalk[tipsColorMap[level]](` ${ErrorLevel[level]}`) +"\n"
            })
            console.log(totalLog + pluginLog)
        }
        return pluginSummary
    }

    outPutMarkdown = () => {
        outPutMarkdown(this._errorPool)
    }

}