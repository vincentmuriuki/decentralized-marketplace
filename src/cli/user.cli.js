import { createUser, listUsers } from '../services/user.service.js';
// @ts-ignore
import process from 'bare-process';

// Helper function for prompting user input
const askQuestion = (query) => {
    process.stdout.write(query);
    return new Promise((resolve) => {
        process.stdin.once('data', (input) => resolve(input.toString().trim()));
    });
};

// User Management Menu
export async function userMenu(userDB) {
    console.log('\n👤 User Management');
    console.log('1. Add User');
    console.log('2. List Users');
    console.log('3. Back to Main Menu\n');

    const choice = await askQuestion('What would you like to do? (1-3): ');

    switch (choice) {
        case '1': {
            const username = await askQuestion('Enter username: ');
            await createUser(userDB, { username });
            console.log('✅ User added successfully!');
            break;
        }

        case '2': {
            console.log('👥 Listing Users:');
            const users = await listUsers(userDB);
            console.log(users);
            break;
        }

        case '3': {
            return;
        }

        default:
            console.log('❌ Invalid option. Please choose between 1-3.');
    }

    await userMenu(userDB);
}
