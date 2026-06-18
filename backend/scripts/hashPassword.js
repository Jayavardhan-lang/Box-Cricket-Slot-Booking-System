
const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('\n❌ Usage: node scripts/hashPassword.js <your_password>\n');
  process.exit(1);
}

if (password.length < 8) {
  console.warn('⚠️  Warning: Password is shorter than 8 characters. Consider using a stronger password.');
}

const SALT_ROUNDS = 12;

bcrypt.hash(password, SALT_ROUNDS).then((hash) => {
  console.log('\n✅ Password hashed successfully!\n');
  console.log('Copy this into your backend/.env file:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
}).catch((err) => {
  console.error('❌ Hashing failed:', err.message);
  process.exit(1);
});
