require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db.js');
const User = require('./models/userModel.js');
const Category = require('./models/categoryModel.js');
const Event = require('./models/eventModel.js');

const CATEGORIES = [
  { name: 'Technology', description: 'Tech talks, workshops and conferences' },
  { name: 'Music', description: 'Concerts and live performances' },
  { name: 'Business', description: 'Networking and business events' },
];

const seed = async () => {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@eventpulse.com').toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'EventPulse Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`[Seed] Admin user created: ${adminEmail}`);
  } else {
    console.log(`[Seed] Admin user already exists: ${adminEmail}`);
  }

  const categoryDocs = {};
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
    categoryDocs[cat.name] = doc;
  }
  console.log(`[Seed] Categories ready: ${Object.keys(categoryDocs).join(', ')}`);

  const sampleEvents = [
    {
      name: 'React Summit Cairo',
      description: 'A day of talks on modern frontend development.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      city: 'Cairo',
      capacity: 100,
      category: categoryDocs['Technology']._id,
    },
    {
      name: 'Jazz Night',
      description: 'Live jazz performance in the heart of the city.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      city: 'Alexandria',
      capacity: 50,
      category: categoryDocs['Music']._id,
    },
    {
      name: 'Startup Founders Meetup',
      description: 'Networking event for early-stage founders.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      city: 'Cairo',
      capacity: 10,
      category: categoryDocs['Business']._id,
    },
  ];

  for (const ev of sampleEvents) {
    await Event.findOneAndUpdate(
      { name: ev.name },
      { $setOnInsert: { ...ev, createdBy: admin._id } },
      { upsert: true, new: true }
    );
  }
  console.log(`[Seed] Sample events ready (${sampleEvents.length}).`);

  console.log('[Seed] Done.');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});