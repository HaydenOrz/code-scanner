#!/usr/bin/env node
import { Command } from 'commander'
import chalk from 'chalk';
import { generateDefaultConfigFile, getConfig } from './config'
import RunnerForCli from "./cliRunner";
import { logDebugInfo } from '../utils/debug'

const version = require('../../package.json').version
const defaultConfigFilePath = `${process.cwd()}/scanner.config.json`

const program = new Command();
const runner = new RunnerForCli()

program
    .name('code-scanner')
    .description('scan javascript code')
    .version(version, '-v, --version')
    .argument('[includes]', 'glob path to scan')
    .option('-i, --ignore <path>', 'ignore path to scan')
    .option('-c, --config <path>', 'path to config file ', defaultConfigFilePath)
    .option('-m, --markdown', 'output results as markdown')
    .option('-n, --noconsole', 'Do not print result to console')
    .option('--debug', 'print debug log')
    .action((argument, options) => {
        const config = getConfig(options.config, argument, options.ignore, options.debug);
        if(options.debug) {
            runner.setDebugMode()
            logDebugInfo('Scanner config is:', config)
        }
        runner.setConfig(config)
        runner.run()
        if(options.markdown) {
            runner.getErrorCollector().outPutMarkdown()
            console.log(chalk.cyanBright('The results have been output to .scanner/'));
        }
        if(!options.noconsole) {
            runner.getErrorCollector().printCodeErrors()
        }
        runner.getErrorCollector().printSummary()
    })

program.command('init')
    .description('Generate the default config file')
    .argument('[directory]', 'The directory which the config file located')
    .action((argument) => {
        generateDefaultConfigFile(argument ?? process.cwd())
    });

program.parse();