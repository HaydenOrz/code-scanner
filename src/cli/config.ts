import fs from 'fs'
import path  from 'path'
import chalk from 'chalk'
import { IScannerConfig } from './cliRunner'
import { logDebugInfo } from '../utils/debug'

import './public/scanner.config.template.json'

export function getConfig(_configFilePath: string, includes: string, ignore: string, debug?: boolean) {
    const configFilePath = path.normalize(path.resolve(_configFilePath)); 

    if(debug) {
        logDebugInfo('The path to your config file is', configFilePath)
    }

    if(!fs.existsSync(configFilePath)) {
        console.log(
            chalk.red(`Error:`), 
            chalk.gray(`"scanner.config.json" is not found!\n`),
            chalk.yellowBright('Run `scanner init` to generate')
        )
        process.exit()
    }

    const pathMeta = path.parse(configFilePath)
    const { ext } = pathMeta;

    if(ext!=='.json') {
        console.log(
            chalk.red(`Error:`), 
            chalk.gray( `${configFilePath} is not a json file`)
        )
        process.exit()
    }

    const configInFile: IScannerConfig = require(configFilePath);
    if (includes) { 
        configInFile.includes = includes; 
    }
    if (ignore) {
        configInFile.excludes = ignore; 
    }

    return configInFile
}


export function generateDefaultConfigFile (_targetDir) {
    const targetDir = path.resolve(_targetDir)
    if(!fs.existsSync(targetDir)) {
        console.log(
            chalk.red(`Error:`),
            chalk.gray(`${targetDir} is not a directory`)
        )
        process.exit()
    }

    const source = path.normalize(path.resolve(__dirname,'./public/scanner.config.template.json'))

    const dirMeta = path.parse(targetDir)
    const {dir, name, ext} = dirMeta
    const target = path.normalize(
        ext
        ? path.join(dir, `${name}.json`)
        : path.join(dir, name, 'scanner.config.json')
    ) 

    fs.copyFileSync(source, target)
}



