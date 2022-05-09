#!/usr/bin/env ts-node

// const chalk = require('chalk');
import readline from 'readline-sync';
import { CLI, User, Zoo } from './Zoo';

console.log('WELCOME TO ZOOPLA ZOO!');

const userName = readline.question('Enter your name: ');
const animals = ['dolphin', 'bear', 'octopus'];
const animalIndex = readline.keyInSelect(animals, 'Choose an animal:');

console.log(`Thanks, ${userName} the ${animals[animalIndex]}.`);

const zoo = new Zoo();
const cli = new CLI(zoo);

zoo.addUser(new User(userName));

function checkForFurtherInput() {
    const input = readline.question(`
        What would you like to do next? Your options:
    
        - Add another animal - "add [name]"
    
        - Post - "${userName} -> [your message]"
    
        - Follow an animal's posts - "[username] follows [username]"
    
        - Unfollow an animal's posts - "[username] unfollows [username]"
    
        - Quit - "quit"
    `);

    if (input === 'quit') {
        console.log('OK BAI');
        return;
    } else {
        const response = cli.input(input);
        console.log(response);
        checkForFurtherInput();
    }
}

checkForFurtherInput();
