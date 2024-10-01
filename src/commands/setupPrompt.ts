import inquirer from 'inquirer';

export function setupPrompt() {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Choose the programming language:',
      choices: ['JavaScript', 'TypeScript'],
      default: 'TypeScript',
    },
    {
      type: 'confirm',
      name: 'caching',
      message: 'Do you want to enable node-cache?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'middlewares',
      message: 'Do you want to add common middlewares?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'mvc',
      message: 'Do you want to include an MVC structure?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'routers',
      message: 'Do you want to include a router structure?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'mongodb',
      message: 'Do you want to use MongoDB as a pre-configured database?',
      default: false,
    },
  ]);
}
