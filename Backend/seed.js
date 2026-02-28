require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create default admin if not exists
    const existing = await Admin.findOne({ email: 'admin@gunaso.gov.np' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        name: 'System Administrator',
        email: 'admin@gunaso.gov.np',
        password: hashedPassword,
      });
      console.log('Default admin created: admin@gunaso.gov.np / admin123');
    } else {
      console.log('Admin already exists, skipping.');
    }

    await mongoose.disconnect();
    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
