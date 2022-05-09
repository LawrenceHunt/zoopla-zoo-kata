#!/usr/bin/env node

import { Command } from 'commander';

function buildSayCmd(): Command {
    return new Command()
        .name('say')
        .description('Say the word passed as the first argument')
        .argument('<word>')
        .action((word: string) => console.log(word));
}

const HELLO = 'Hello!';

function buildCmd(): Command {
    const command = new Command()
        .option('-g, --greet', `Say ${HELLO}`, false)
        .addCommand(buildSayCmd())
        .addHelpCommand()
        .showHelpAfterError();

    command.action((options) => {
        if (options.greet) {
            console.log(HELLO);
            return;
        }

        command.help();
    });

    return command;
}

const isExecutedAsScript = require.main === module;
if (isExecutedAsScript) {
    const cmd = buildCmd();

    cmd.parse(process.argv);
}
