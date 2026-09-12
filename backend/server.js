// ==================== LOAD ENVIRONMENT VARIABLES ====================
require('dotenv').config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');

const connectDB = require('./config/database');
const { initSocket } = require('./socket');
const seedDatabase = require('./utils/seedDatabase');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');

// ==================== APP SETUP ====================
const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== ROUTES ====================
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/healthRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/contactRoutes'));
app.use('/api', require('./routes/subscriptionRoutes'));
app.use('/api', require('./routes/announcementRoutes'));
app.use('/api', require('./routes/newsRoutes'));
app.use('/api', require('./routes/galleryRoutes'));
app.use('/api', require('./routes/admissionRoutes'));
app.use('/api', require('./routes/superAdminRoutes'));
app.use('/api', require('./routes/academicAdminRoutes'));
app.use('/api', require('./routes/teacherRoutes'));
app.use('/api', require('./routes/studentRoutes'));
app.use('/api', require('./routes/disciplineAdminRoutes'));
app.use('/api', require('./routes/permissionRoutes'));
app.use('/api', require('./routes/accountsRoutes'));
app.use('/api', require('./routes/messageRoutes'));

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== DATABASE CONNECTION & START ====================
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    console.log('✅ MongoDB Connected');
    const userCount = await User.countDocuments();
    if (process.argv.includes('--seed') || process.env.SEED_DB === 'true' || userCount === 0) {
      await seedDatabase();
    }
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });