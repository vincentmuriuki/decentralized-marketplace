import { addProduct, listProducts } from '../services/product.service.js';
import process from 'bare-process';

// Helper function for prompting user input
const askQuestion = (query) => {
  process.stdout.write(query);
  return new Promise((resolve) => {
    process.stdin.once('data', (input) => resolve(input.toString().trim()));
  });
};

// Product Management Menu
export async function productMenu(productDB) {
  if (!productDB) {
    throw new Error('❌ Product database is not initialized.');
  }

  while (true) {
    console.log('\n📦 Product Management');
    console.log('1. Add Product');
    console.log('2. List Products');
    console.log('3. Back to Main Menu\n');

    const choice = await askQuestion('What would you like to do? (1-3): ');

    switch (choice) {
      case '1': {
        const name = await askQuestion('Enter product name: ');
        const price = await askQuestion('Enter product price: ');
        await addProduct(productDB, { name, price });
        console.log('✅ Product added successfully!');
        break;
      }

      case '2': {
        console.log('📦 Listing Products:');
        const products = await listProducts(productDB);
        console.log(products);
        break;
      }

      case '3': {
        return; // Exit to main menu
      }

      default:
        console.log('❌ Invalid option. Please choose between 1-3.');
    }
  }
}
