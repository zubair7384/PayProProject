import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const seedUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'artilectsolutions2024@gmail.com' });
    
    if (existingUser) {
      console.log('User already exists');
      process.exit(0);
    }

    // Create the user
    const user = new User({
      email: 'artilectsolutions2024@gmail.com',
      password: 'Passpass@123',
      name: 'Artilect Solutions',
      isActive: true
    });

    await user.save();
    console.log('User created successfully');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedUser();