import chalk from "chalk";
import { configCharles } from "./configCharles.js";

async function main() {
    console.log(chalk.dim('Welcome to Charles, booting up...'))
    const config = await configCharles()
    
}

main()