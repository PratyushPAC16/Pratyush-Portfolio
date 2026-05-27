import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { connectDB } from './config/db';
import User from './models/User';

dotenv.config();

const SEED_EMAIL = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
const SEED_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const BCRYPT_SALT_ROUNDS = 12;

async function seed(): Promise<void> {
  console.log('🌱 Starting seed script...');
  await connectDB();

  // If a custom admin is configured, clean up the default public admin for security
  if (SEED_EMAIL !== 'admin@portfolio.com') {
    const deletedDefault = await User.deleteOne({ email: 'admin@portfolio.com' });
    if (deletedDefault.deletedCount > 0) {
      console.log('🧹 Cleaned up default admin account (admin@portfolio.com) for security.');
    }
  }

  const existing = await User.findOne({ email: SEED_EMAIL });
  if (existing) {
    console.log(`ℹ️  Admin user already exists: ${SEED_EMAIL}. Updating password...`);
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_SALT_ROUNDS);
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`✅ Admin password updated successfully for: ${SEED_EMAIL}`);
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
