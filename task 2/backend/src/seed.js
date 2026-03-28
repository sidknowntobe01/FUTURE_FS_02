/**
 * Seed script — populates the database with a default admin + sample leads.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');
const Lead = require('./models/Lead.model');

const LEADS = [
  {
    name: 'Alice Johnson',
    email: 'alice@techcorp.com',
    phone: '+1 555-0101',
    company: 'TechCorp Inc.',
    source: 'Website',
    status: 'New',
    notes: [{ text: 'Submitted contact form asking about the enterprise plan pricing.' }],
  },
  {
    name: 'Bob Smith',
    email: 'bob@startupbase.io',
    phone: '+1 555-0102',
    company: 'StartupBase',
    source: 'LinkedIn',
    status: 'Contacted',
    notes: [{ text: 'Replied to LinkedIn message. Interested in a Q2 pilot program.' }],
  },
  {
    name: 'Carol Williams',
    email: 'carol@designhub.com',
    phone: '+1 555-0103',
    company: 'DesignHub Agency',
    source: 'Referral',
    status: 'Qualified',
    notes: [
      { text: 'Referred by Bob Smith. Has budget approved for the current quarter.' },
      { text: 'Follow-up call scheduled for next Friday at 3 PM.' },
    ],
  },
  {
    name: 'David Lee',
    email: 'david@marketingpro.com',
    phone: '+1 555-0104',
    company: 'MarketingPro Ltd.',
    source: 'Email',
    status: 'Converted',
    notes: [
      { text: 'Signed a 12-month contract worth $24,000.' },
      { text: 'Onboarding call completed. Account fully activated.' },
    ],
  },
  {
    name: 'Eva Martinez',
    email: 'eva@globalretail.com',
    phone: '+1 555-0105',
    company: 'Global Retail Group',
    source: 'Cold Call',
    status: 'Lost',
    notes: [{ text: 'Decided to go with a competitor. Follow up in 6 months for renewal.' }],
  },
  {
    name: 'Frank Chen',
    email: 'frank@aiventures.com',
    phone: '+1 555-0106',
    company: 'AI Ventures',
    source: 'Website',
    status: 'New',
    notes: [],
  },
  {
    name: 'Grace Kim',
    email: 'grace@financeplus.com',
    phone: '+1 555-0107',
    company: 'FinancePlus Corp',
    source: 'LinkedIn',
    status: 'Contacted',
    notes: [{ text: 'Product demo scheduled for Thursday 2 PM.' }],
  },
  {
    name: 'Henry Patel',
    email: 'henry@cloudwave.tech',
    phone: '+1 555-0108',
    company: 'CloudWave Tech',
    source: 'Referral',
    status: 'Qualified',
    notes: [{ text: 'Needs 50+ seats. Requesting custom enterprise pricing.' }],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear collections
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin
    const admin = new User({
      name: 'CRM Admin',
      email: process.env.ADMIN_EMAIL || 'admin@leadcrm.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
    });
    await admin.save();
    console.log(`👤 Admin created: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

    // Create leads
    await Lead.insertMany(LEADS);
    console.log(`📋 Seeded ${LEADS.length} sample leads`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('─────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
