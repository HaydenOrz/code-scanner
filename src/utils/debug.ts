import chalk from "chalk";

export function logDebugInfo (message: string, detail) {
    console.log(chalk.gray('----------- DEBUG -----------'))
    console.log(chalk.gray(message));
    console.log(detail);
    console.log(chalk.gray('-----------------------------\n'))
}