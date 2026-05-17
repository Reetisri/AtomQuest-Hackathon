require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const SystemSetting = require('./models/SystemSetting');

const seedDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined in .env file.');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await SystemSetting.deleteMany({});
    console.log('Cleared existing users and settings');

    // Create System Setting
    await SystemSetting.create({ activePhase: 'GOAL_SETTING' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: passwordHash,
      role: 'ADMIN',
      department: 'HR'
    });

    // Create Managers
    const manager1 = await User.create({
      name: 'Manager One',
      email: 'manager@demo.com',
      password: passwordHash,
      role: 'MANAGER',
      department: 'Engineering'
    });

    const manager2 = await User.create({
      name: 'Manager Two',
      email: 'manager2@demo.com',
      password: passwordHash,
      role: 'MANAGER',
      department: 'Sales'
    });

    // Create Employees
    await User.create({
      name: 'Employee One',
      email: 'employee@demo.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      managerId: manager1._id,
      department: 'Engineering'
    });

    await User.create({
      name: 'Employee Two',
      email: 'employee2@demo.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      managerId: manager1._id,
      department: 'Engineering'
    });

    await User.create({
      name: 'Employee Three',
      email: 'employee3@demo.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      managerId: manager2._id,
      department: 'Sales'
    });

    await User.create({
      name: 'Employee Four',
      email: 'employee4@demo.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      managerId: manager2._id,
      department: 'Sales'
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
