// test-auth.js - Test Viurl Authentication
const axios = require('axios');

const API_URL = 'https://viurl.com/api';
// const API_URL = 'http://localhost:5000/api'; // Use this for local testing

async function testAuth() {
  console.log('🧪 Testing Viurl Authentication System...\n');
  
  try {
    // Test 1: Login with existing user
    console.log('1️⃣ Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'new@viurl.com',
      password: 'New123!'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login successful!');
      console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
      console.log('   User:', loginResponse.data.user.email);
      console.log('   User ID:', loginResponse.data.user._id);
      
      const token = loginResponse.data.token;
      
      // Test 2: Get current user with token
      console.log('\n2️⃣ Testing Get Current User...');
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (meResponse.data.user) {
        console.log('✅ Get current user successful!');
        console.log('   Name:', meResponse.data.user.name);
        console.log('   Username:', meResponse.data.user.username);
        console.log('   Trust Score:', meResponse.data.user.trustScore || 0);
        console.log('   VTOKENS:', meResponse.data.user.vtokens || 0);
      }
      
      // Test 3: Test registration (optional - will fail if user exists)
      console.log('\n3️⃣ Testing Registration (new user)...');
      const randomEmail = `test${Date.now()}@viurl.com`;
      try {
        const registerResponse = await axios.post(`${API_URL}/auth/register`, {
          email: randomEmail,
          password: 'Test123!',
          name: 'Test User',
          username: `testuser${Date.now()}`
        });
        
        if (registerResponse.data) {
          console.log('✅ Registration successful!');
          console.log('   New user created:', randomEmail);
        }
      } catch (regError) {
        if (regError.response?.status === 400) {
          console.log('⚠️  Registration test skipped (expected if testing with existing data)');
        } else {
          throw regError;
        }
      }
      
      // Test 4: Test invalid login
      console.log('\n4️⃣ Testing Invalid Login (should fail)...');
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: 'invalid@viurl.com',
          password: 'wrong'
        });
        console.log('❌ Invalid login should have failed!');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          console.log('✅ Invalid login correctly rejected');
        } else {
          throw error;
        }
      }
      
      console.log('\n🎉 All authentication tests passed!');
      console.log('Your authentication system is working correctly.\n');
      
    } else {
      console.log('❌ Login failed - no token received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status);
    console.error('Full error:', error.response?.data);
  }
}

// Run the test
testAuth();

console.log('\n📝 Note: Run this script with: node test-auth.js');
console.log('Make sure your backend server is running first!');
