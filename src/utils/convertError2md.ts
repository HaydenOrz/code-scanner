import json2md from 'json2md'
import fs from 'fs'
import path from 'path'
import { ErrorType, CodeError } from '../runner/codeError'

export function outPutMarkdown (codeError?: Map<CodeError, ErrorType> ) {
    const scanResultsMap = {
        [ErrorType.dangerousAndOperator]: [
            { h1: 'DangerousAndOperator scan results' },
            { blockquote: 'Detail are here: https://github.com/HaydenOrz/code-scanner#dangerousandoperator' }
        ] as json2md.DataObject[],
        [ErrorType.dangerousDefaultValue]: [
            { h1: 'DangerousDefaultValue scan results' },
            { blockquote: 'Detail are here: https://github.com/HaydenOrz/code-scanner#dangerousdefaultvalue' }
        ] as json2md.DataObject[],
        [ErrorType.dangerousInitState]: [
            { h1: 'DangerousInitState scan results' },
            { blockquote: 'Detail are here: https://github.com/HaydenOrz/code-scanner#dangerousinitstate' }
        ] as json2md.DataObject[],
        [ErrorType.needHandlerInCatch]: [
            { h1: 'NeedHandlerInCatch scan results' },
            { blockquote: 'Detail are here: https://github.com/HaydenOrz/code-scanner#needhandlerincatch' }
        ] as json2md.DataObject[],
        [ErrorType.needTryCatch]: [
            { h1: 'NeedTryCatch scan results' },
            { blockquote: 'Detail are here: https://github.com/HaydenOrz/code-scanner#needtrycatch' }
        ] as json2md.DataObject[],
    }

    codeError.forEach((errorType, error) => {
        const { filePath, codeFrameErrMsg, loc, pluginTips, extraMsg } = error;
        const errorLocation = `${filePath}`;
        scanResultsMap[errorType].push(
            { h2: path.basename(filePath) },
            { link: { title: path.basename(filePath), source: `file://${errorLocation}` }},
            { ul: [
                    `location: line:${loc.end.line}, column: ${loc.end.column + 1}`,
                    `description: ${pluginTips}`,
                    `detail: ${extraMsg ?? '--'}`
                ]
            },
            // { code: {language: 'javascript', content: codeFrameErrMsg} } // 乱码
        );
    })

    const baseDir = initDir()

    Array.from(new Set(codeError.values())).forEach(key => {
        const filename =  `${ErrorType[key]}_results.md`
        const mdContent = json2md(scanResultsMap[key])
        fs.writeFileSync(path.normalize(path.join(baseDir, filename)), mdContent)
    })
}

function initDir () {
    const baseDir = path.normalize(path.resolve('./.scanner'))
    if(fs.existsSync(baseDir)){
        fs.rmdirSync(baseDir, { recursive: true })
    }
    fs.mkdirSync(baseDir)
    fs.writeFileSync(path.normalize(path.join(baseDir, '.gitignore')), '*')
    return baseDir
}

