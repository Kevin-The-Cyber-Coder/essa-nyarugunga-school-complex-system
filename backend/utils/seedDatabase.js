const bcrypt = require('bcryptjs');

const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Announcement = require('../models/Announcement');
const News = require('../models/News');
const Gallery = require('../models/Gallery');
const AdmissionApplication = require('../models/AdmissionApplication');
const Contact = require('../models/Contact');
const Subscription = require('../models/Subscription');

const seedDatabase = async () => {
  console.log('\n🌱 Seeding database...');
  await Promise.all([
    User.deleteMany({}), TeacherProfile.deleteMany({}), Student.deleteMany({}),
    Class.deleteMany({}), Announcement.deleteMany({}), News.deleteMany({}),
    Gallery.deleteMany({}), AdmissionApplication.deleteMany({}),
    Contact.deleteMany({}), Subscription.deleteMany({})
  ]);

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await User.create({
    fullName: 'Head Master', email: 'admin@essa.rw',
    password: hashedPassword, role: 'super_admin',
    phone: '+250788123456', isActive: true
  });

  await Announcement.create([
    { title: 'Welcome to 2026 Academic Year', content: 'We are excited to welcome all students back.', audience: ['all'], priority: 'high', createdBy: superAdmin._id },
    { title: 'Parent-Teacher Conference', content: 'Scheduled for May 20, 2026.', audience: ['parents'], priority: 'normal', createdBy: superAdmin._id }
  ]);
  await News.create([
    { title: 'ESSA Wins Science Competition', summary: 'First place at the National Science Fair.', category: 'achievement', author: 'Science Dept', isPublished: true },
    { title: 'New Computer Lab Opens', summary: 'State-of-the-art lab with 50 new computers.', category: 'announcement', author: 'ICT Dept', isPublished: true }
  ]);
  await Gallery.create([
    { title: 'Graduation 2025', image: 'https://via.placeholder.com/500x350', category: 'events', isPublished: true },
    { title: 'Sports Day',      image: 'https://via.placeholder.com/500x350', category: 'sports', isPublished: true }
  ]);

  console.log('✅ Super Admin: admin@essa.rw / admin123');
  console.log('🎉 Seeding done!\n');
};

module.exports = seedDatabase;