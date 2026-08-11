const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');
const Notification = require('./models/Notification');
const Message = require('./models/Message');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lostfound_db';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Item.deleteMany();
    await Claim.deleteMany();
    await Notification.deleteMany();
    await Message.deleteMany();

    console.log('[Seed] Cleared old collection records');

    // Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@lostfound.com',
      password: 'admin123', // Will be hashed via pre-save hook
      role: 'admin',
      phone: '+1 555 019 2831',
      location: 'Admin Office',
      bio: 'Platform administrator keeping items safe and secure.',
    });

    const user1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'password123',
      role: 'user',
      phone: '+1 555 014 9912',
      location: 'Central Campus',
      bio: 'Student at Central Campus',
    });

    const user2 = await User.create({
      name: 'Sophia Patel',
      email: 'sophia@example.com',
      password: 'password123',
      role: 'user',
      phone: '+1 555 018 3341',
      location: 'North Wing',
      bio: 'Researcher',
    });

    console.log('[Seed] Created sample users (Admin, Alex, Sophia)');

    // Create Items
    const item1 = await Item.create({
      title: 'Apple MacBook Pro 14"',
      kind: 'lost',
      category: 'Electronics',
      description: 'Silver MacBook Pro 14-inch left near study table 4 in the Main Library.',
      location: 'Main Library',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
      status: 'open',
      reportedBy: user1._id,
      claimCount: 1,
    });

    const item2 = await Item.create({
      title: 'Leather Wallet with IDs',
      kind: 'found',
      category: 'Wallets & IDs',
      description: 'Dark brown leather wallet found near Cafeteria billing counter. Contains student ID.',
      location: 'Cafeteria',
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop',
      status: 'open',
      reportedBy: user2._id,
      claimCount: 1,
    });

    const item3 = await Item.create({
      title: 'Car Key Chain with Blue Lanyard',
      kind: 'found',
      category: 'Keys',
      description: 'Toyota key fob attached to a navy blue lanyard found by the Metro Station entrance.',
      location: 'Metro Station',
      date: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop',
      status: 'pending',
      reportedBy: user1._id,
      claimCount: 0,
    });

    console.log('[Seed] Created sample items');

    // Create Sample Claim
    const claim1 = await Claim.create({
      item: item2._id,
      claimedBy: user1._id,
      message: 'This is my wallet! It has my driver license with name Alex Johnson inside.',
      status: 'pending',
    });

    // Create Sample Notifications
    await Notification.create({
      user: user2._id,
      title: 'New Claim Received',
      body: `Alex Johnson submitted a claim on your found item "${item2.title}".`,
      type: 'claim',
      relatedItem: item2._id,
    });

    await Notification.create({
      user: user1._id,
      title: 'Welcome to LostFound+',
      body: 'Thank you for joining LostFound+. You can now report lost or found items.',
      type: 'system',
    });

    // Create Sample Discussion Messages
    await Message.create({
      item: item2._id,
      sender: user1._id,
      author: 'Alex Johnson',
      body: 'Hi Sophia! I think that is my wallet. I dropped it while having lunch.',
    });

    await Message.create({
      item: item2._id,
      sender: user2._id,
      author: 'Sophia Patel',
      body: 'Hey Alex, please submit a claim verification describing the cards inside!',
    });

    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
