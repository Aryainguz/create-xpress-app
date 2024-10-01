import { createProjectFiles } from '../utils/fileUtils';
import { setupPrompt } from './setupPrompt';

interface ProjectOptions {
  language: string;
  caching: boolean;
  middlewares: boolean;
  routers: boolean;
  useMongoDB: boolean; 
}

export async function setupProject(projectName: string, options: ProjectOptions) {
  // Ask user questions
  const answers = await setupPrompt(); 

  
  createProjectFiles(projectName, { ...answers, ...options }); // Combine answers and options
  
  console.log(`Project ${projectName} created successfully!`);
}


