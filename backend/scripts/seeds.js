require('dotenv').config();

const connectDB = require('../config/database');
const seedDatabase = require('../utils/seedDatabase');

(async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
})();