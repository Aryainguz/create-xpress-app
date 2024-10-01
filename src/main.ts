#!/usr/bin/env node  
import { Command } from 'commander';
import { setupProject } from './commands/create'; 

const program = new Command();

program
  .version('1.0.0')
  .description('CLI Tool for Express.js and TypeScript')
  .argument('<project-name>', 'Name of the project to create')
  .option('-l, --language <type>', 'Programming language (js or ts)') 
  .option('-c, --caching', 'Enable caching with node-cache') 
  .option('-m, --middlewares', 'Add common middlewares') 
  .option('-r, --routers', 'Add router structure') 
  .option('--mongodb', 'Use MongoDB as pre-configured database') 
  .action((projectName, options) => {
    setupProject(projectName, options);
  });

program.parse(process.argv);
