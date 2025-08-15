// fix-test-user.js - Script to fix or create test user with proper password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User schema inline to avoid any model issues
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profilePicture: String,
  bannerImage: String,
  bio: String,
  location: String,
  website: String,
  trustScore: { type: Number, default: 100 },
  vtokens: { type: Number, default: 100 },
  isVerified: { type: Boolean, default: false },
  joinedDate: { type: Date, default: Date.now },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  verifiedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  followersList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followingList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);

async function fixTestUser() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viurlDB');
    console.log('✅ Connected to MongoDB');

    const testEmail = 'new@viurl.com';
    const testPassword = 'New123!';
    const testUsername = 'newuser';
    const testName = 'New User';

    // Find existing user
    let user = await User.findOne({ email: testEmail });

    if (user) {
      console.log('📝 Found existing user, updating password...');
      
      // Hash the password properly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      // Update user with proper password and name
      user.password = hashedPassword;
      user.name = user.name || testName;
      user.username = user.username || testUsername;
      user.trustScore = user.trustScore || 100;
      user.vtokens = user.vtokens || 100;
      user.isVerified = user.isVerified || false;
      user.followers = user.followers || 0;
      user.following = user.following || 0;
      
      await user.save();
      console.log('✅ User updated successfully!');
    } else {
      console.log('🆕 Creating new test user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      // Create new user
      user = new User({
        email: testEmail,
        password: hashedPassword,
        username: testUsername,
        name: testName,
        bio: 'Test user for Viurl development',
        trustScore: 100,
        vtokens: 100,
        isVerified: false,
        joinedDate: new Date(),
        followers: 0,
        following: 0
      });
      
      await user.save();
      console.log('✅ Test user created successfully!');
    }

    // Verify the password works
    console.log('\n🔐 Testing password...');
    const isMatch = await bcrypt.compare(testPassword, user.password);
    if (isMatch) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
    }

    console.log('\n📋 User Details:');
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Name:', user.name);
    console.log('   Password: New123!');
    console.log('   Trust Score:', user.trustScore);
    console.log('   VTokens:', user.vtokens);
    console.log('   User ID:', user._id);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
fixTestUser();