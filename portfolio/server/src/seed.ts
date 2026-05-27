import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectDB } from './config/db';
import User from './models/User';

dotenv.config();

const SEED_EMAIL = 'admin@portfolio.com';
const SEED_PASSWORD = 'admin123';
const BCRYPT_SALT_ROUNDS = 12;

async function seed(): Promise<void> {
  console.log('🌱 Starting seed script...');
  await connectDB();

  const existing = await User.findOne({ email: SEED_EMAIL });
  if (existing) {
    console.log(`ℹ️  Admin user already exists: ${SEED_EMAIL}. Skipping seed.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_SALT_ROUNDS);

  const admin = await User.create({
    email: SEED_EMAIL,
    passwordHash,
    role: 'admin',
  });

  console.log(`✅ Admin user created successfully:`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log(`   ID:    ${admin._id}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
