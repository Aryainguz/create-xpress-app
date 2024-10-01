import figlet from 'figlet';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

function showBanner() {
  return new Promise<void>((resolve) => {
    console.clear();
    figlet.text('Xpress CLI', { font: 'Standard' }, (err, data) => {
      if (err) {
        console.log('Something went wrong with the banner...');
        console.dir(err);
        return;
      }
      console.log(chalk.blueBright(data));
      console.log(chalk.yellow('\nPowered by Inguz \n'));
      resolve();
    });
  });
}

function startSpinner(message: string) {
  const spinner = ora(chalk.green(message)).start();
  return spinner;
}

function createDir(directoryPath: string) {
  try {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`Directory created: ${directoryPath}`);
  } catch (error) {
    console.error(`Error creating directory ${directoryPath}:`, error);
  }
}

function writeFile(filePath: string, content: string) {
  try {
    fs.writeFileSync(filePath, content);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
  }
}

function createPackageJson(projectPath: string, projectName: string, options: any) {
  const packageJsonContent = {
    name: projectName,
    version: "1.0.0",
    main: options.language === 'ts' ? "src/app.ts" : "src/app.js",
    scripts: {
      start: `node src/app.${options.language === 'ts' ? 'ts' : 'js'}`,
      dev: `nodemon src/app.${options.language === 'ts' ? 'ts' : 'js'}`,
      build: options.language === 'ts' ? "tsc" : undefined,
    },
    dependencies: {
      express: "^4.17.1",
      dotenv: "^10.0.0",
      ...(options.mongodb ? { mongoose: "^5.11.15" } : {}),
      ...(options.caching ? { "node-cache": "^5.1.2" } : {}),
    },
    devDependencies: {
      ...(options.language === 'ts' ? { typescript: "^4.0.0", "@types/node": "^14.0.0", "@types/express": "^4.17.8" } : {}),
      nodemon: "^2.0.7",
    },
  };
  writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJsonContent, null, 2));
}

function createEnvFile(projectPath: string, options: any) {
  let envContent = `PORT=3000`;
  if (options.mongodb) {
    envContent += `\nMONGO_URI=<your_mongo_uri_here>`;
  }
  writeFile(path.join(projectPath, '.env'), envContent);
}

function addMongoDBConnection(options: any) {
  if (options.mongodb) {
    return `
      mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('MongoDB connected'))
      .catch(err => console.error('MongoDB connection error:', err));
    `;
  }
  return '';
}

export async function createProjectFiles(projectName: string, options: any) {


  await showBanner();
  const spinner = startSpinner('Creating project structure based on user options...');
  spinner.start();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  spinner.stop();
  

  const projectPath = path.join(process.cwd(), projectName);
  const srcDir = path.join(projectPath, 'src');

  // Create project and src directories
  createDir(projectPath);
  createDir(srcDir);

  // Create models directory and a sample User model if the option is selected
  if (options.models) {
    const modelsDir = path.join(srcDir, 'models');
    createDir(modelsDir);
    writeFile(path.join(modelsDir, 'User.ts'), `
      import mongoose from 'mongoose';
      const userSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
      });
      const User = mongoose.model('User', userSchema);
      export default User;
    `);
  }

  // Create package.json
  createPackageJson(projectPath, projectName, options);

  // Create .env file
  createEnvFile(projectPath, options);

  // Create basic structure based on TypeScript/JavaScript
  const appFileName = options.language === 'ts' ? 'app.ts' : 'app.js';
  const appFileContent = `
    import express from 'express';
    import dotenv from 'dotenv';
    ${options.mongodb ? "import mongoose from 'mongoose';" : ""}
    import { errorHandler } from './middlewares/errorHandler';
    import mainRouter from './routes/mainRouter';

    dotenv.config();

    const app = express();
    app.use(express.json());

    // MongoDB connection
    ${addMongoDBConnection(options)}

    // Register main routes
    app.use('/', mainRouter);

    // Error handling middleware
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT}\`);
    });

    export default app;
  `;

  writeFile(path.join(srcDir, appFileName), appFileContent);

  // Add node-cache if caching is enabled
  if (options.caching) {
    const cacheFileName = options.language === 'ts' ? 'cache.ts' : 'cache.js';
    writeFile(path.join(srcDir, cacheFileName), `
      const NodeCache = require('node-cache');
      const cache = new NodeCache();
      module.exports = cache;
    `);
  }

  // Create middleware, routers, and MVC structure if options are selected
  if (options.middlewares || options.routers || options.mvc) {
    const controllersDir = path.join(srcDir, 'controllers');
    const routersDir = path.join(srcDir, 'routes');
    const middlewaresDir = path.join(srcDir, 'middlewares');

    if (options.mvc) createDir(controllersDir);
    if (options.routers) createDir(routersDir);
    if (options.middlewares) createDir(middlewaresDir);

    // Add a sample controller
    if (options.mvc) {
      writeFile(path.join(controllersDir, 'mainController.ts'), `
        export const home = (req, res) => {
          res.send('Welcome to Express MVC!');
        };
      `);
    }

    // Add a sample router
    if (options.routers) {
      writeFile(path.join(routersDir, 'mainRouter.ts'), `
        import express from 'express';
        import { home } from '../controllers/mainController';
        const router = express.Router();
        router.get('/', home);
        export default router;
      `);
    }

    // Add error handling middleware
    if (options.middlewares) {
      writeFile(path.join(middlewaresDir, 'errorHandler.ts'), `
        export const errorHandler = (err, req, res, next) => {
          console.error(err.stack);
          res.status(500).send('Something broke!');
        };
      `);
    }
  }

  console.log('Project structure created successfully based on user options.');
}
