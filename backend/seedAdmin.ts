import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './src/models';

dotenv.config();

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PWD = 'admin123';
const ADMIN_ROLE = 'admin';

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Conectado a MongoDB Atlas');

    let user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PWD, salt);
      user = new User({ name: 'Admin', email: ADMIN_EMAIL, passwordHash, roles: [ADMIN_ROLE] });
      await user.save();
      console.log(`Usuario ${ADMIN_EMAIL} creado con contraseña ${ADMIN_PWD}`);
    } else if (!user.roles.includes(ADMIN_ROLE)) {
      user.roles.push(ADMIN_ROLE);
      await user.save();
      console.log(`Usuario ${ADMIN_EMAIL} promovido a admin`);
    } else {
      console.log(`Usuario ${ADMIN_EMAIL} ya existe como admin`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin usuario:', err);
    process.exit(1);
  }
}

seedAdmin();
