import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './src/models';

dotenv.config();

const ADMIN_EMAIL = 'autotest@example.com'; // Cambia al email de tu usuario admin
const ADMIN_ROLE = 'admin';

async function promoteAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Conectado a MongoDB Atlas');

    const user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      console.error(`Usuario no encontrado: ${ADMIN_EMAIL}`);
      process.exit(1);
    }

    if (!user.roles.includes(ADMIN_ROLE)) {
      user.roles.push(ADMIN_ROLE);
      await user.save();
      console.log(`Usuario ${ADMIN_EMAIL} promovido a admin`);
    } else {
      console.log(`Usuario ${ADMIN_EMAIL} ya es admin`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error promoviendo admin:', err);
    process.exit(1);
  }
}

promoteAdmin();
