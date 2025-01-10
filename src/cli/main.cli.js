import { productMenu } from './product.cli.js';
import { userMenu } from './user.cli.js';
import { setupSwarm, shutdownSwarm } from '../core/networking.js';
import { initializeDB } from '../core/database.js';
// @ts-ignore
import process from 'bare-process';

let productDB;
let userDB;

const initializeApplication = async () => {
  try {
    console.log('Initializing the database...');
    const db = await initializeDB('800a9d39740cb0614c71159e1d01c6e7d2bfe5927ae928a4361c4166c0222fb7');
    productDB = db.productDB;
    userDB = db.userDB;

    if (!productDB || !userDB) {
      throw new Error('Failed to initialize productDB or userDB.');
    }

    console.log('✅ Database initialized successfully.');
  } catch (error) {
    console.error('❌ Error during initialization:', error.message);
    process.exit(1); // Exit with failure status
  }
};

// Helper function for prompting user input
const askQuestion = (query) => {
  process.stdout.write(query);
  return new Promise((resolve) => {
    process.stdin.once('data', (input) => resolve(input.toString().trim()));
  });
};

// Main Menu
const mainMenu = async () => {
  while (true) {
    console.log('\n🛒 Decentralized Marketplace CLI');
    console.log('1. User Management');
    console.log('2. Product Management');
    console.log('3. Start Networking');
    console.log('4. Exit\n');

    const choice = await askQuestion('What would you like to do? (1-4): ');

    switch (choice) {
      case '1': {
        if (!userDB) {
          console.log('❌ User database is not initialized.');
          break;
        }
        await userMenu(userDB);
        break;
      }

      case '2': {
        if (!productDB) {
          console.log('❌ Product database is not initialized.');
          break;
        }
        await productMenu(productDB); // Always pass the initialized productDB
        break;
      }

      case '3': {
        console.log('🌐 Starting Networking...');
        try {
          await setupSwarm();
          console.log('✅ Networking started successfully.');
        } catch (error) {
          console.error('❌ Error starting networking:', error.message);
        }
        break;
      }

      case '4': {
        const peerAddress = await askQuestion('Enter peer address: ');
        const productName = await askQuestion('Enter product name to share: ');
      
        const product = { name: productName, timestamp: new Date().toISOString() };
      
        try {
          await sendMessage(peerAddress, JSON.stringify(product));
          console.log('✅ Product shared successfully!');
        } catch (error) {
          console.error('❌ Failed to share product:', error.message);
        }
        break;
      }

      case '5': {
        console.log('👋 Goodbye!');
        process.exit(0);
      }

      default: {
        console.log('❌ Invalid option. Please choose between 1-4.');
      }
    }
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Cleaning up resources and exiting...');
  try {
    await shutdownSwarm()
    console.log('✅ Cleanup complete.');
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
  process.exit(0);
});

// Initialize and start the CLI application
(async () => {
  await initializeApplication();
  await mainMenu();
})();
