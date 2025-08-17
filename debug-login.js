// debug-login.js - Debug script to test login directly
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugLogin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viurlDB');
    console.log('✅ Connected to MongoDB\n');

    const email = 'new@viurl.com';
    const password = 'New123!';

    // Query the database directly
    console.log('📍 Step 1: Finding user by email...');
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found!');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Name:', user.name);
    console.log('   Has password field?:', user.password ? 'YES' : 'NO');
    
    if (user.password) {
      console.log('   Password hash (first 20 chars):', user.password.substring(0, 20) + '...');
      console.log('   Password hash length:', user.password.length);
    }

    console.log('\n📍 Step 2: Testing password comparison...');
    
    if (!user.password) {
      console.log('❌ User has no password field in database!');
      return;
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('   Password match result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
      
      if (isMatch) {
        console.log('\n🎉 Login would be successful!');
        console.log('   The password verification works correctly.');
      } else {
        console.log('\n❌ Password does not match!');
        console.log('   The stored password hash might be incorrect.');
      }
    } catch (bcryptError) {
      console.log('❌ Bcrypt error:', bcryptError.message);
      console.log('   Password value type:', typeof user.password);
      console.log('   Password value:', user.password);
    }

    console.log('\n📍 Step 3: Checking User model schema...');
    
    // Try loading through Mongoose model
    const User = require('./src/models/User');
    const mongooseUser = await User.findOne({ email });
    
    if (mongooseUser) {
      console.log('✅ User found via Mongoose model');
      console.log('   Has password in Mongoose query?:', mongooseUser.password ? 'YES' : 'NO');
      
      // Try with explicit select
      const userWithPassword = await User.findOne({ email }).select('+password');
      console.log('   Has password with select(+password)?:', userWithPassword.password ? 'YES' : 'NO');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the debug
debugLogin();