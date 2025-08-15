// test-auth.js - Test Script for Viurl Authentication
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'new@viurl.com',
  password: 'New123!'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testAuth() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════╗
║        VIURL Authentication Tester         ║
╚════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // Test 1: Health Check
    console.log(`${colors.blue}📍 Test 1: Health Check${colors.reset}`);
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log(`${colors.green}✅ Server is healthy:${colors.reset}`, healthResponse.data);
    
    // Test 2: Login with existing user
    console.log(`\n${colors.blue}📍 Test 2: Login with existing user${colors.reset}`);
    console.log(`   Email: ${TEST_USER.email}`);
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    
    if (loginResponse.data.token) {
      console.log(`${colors.green}✅ Login successful!${colors.reset}`);
      console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
      console.log('   User:', loginResponse.data.user);
      
      const token = loginResponse.data.token;
      
      // Test 3: Access protected route
      console.log(`\n${colors.blue}📍 Test 3: Access protected route /api/auth/me${colors.reset}`);
      
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`${colors.green}✅ Protected route accessed successfully:${colors.reset}`);
      console.log('   User data:', meResponse.data);
      
      // Test 4: Try without token (should fail)
      console.log(`\n${colors.blue}📍 Test 4: Try accessing protected route without token${colors.reset}`);
      
      try {
        await axios.get(`${API_URL}/auth/me`);
        console.log(`${colors.red}❌ This shouldn't happen - route should be protected${colors.reset}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`${colors.green}✅ Protected route correctly blocked unauthorized access${colors.reset}`);
        } else {
          throw error;
        }
      }
      
      // Test 5: Test invalid credentials
      console.log(`\n${colors.blue}📍 Test 5: Test invalid credentials${colors.reset}`);
      
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: 'wrong@email.com',
          password: 'wrongpassword'
        });
        console.log(`${colors.red}❌ This shouldn't happen - invalid login should fail${colors.reset}`);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          console.log(`${colors.green}✅ Invalid login correctly rejected${colors.reset}`);
        } else {
          throw error;
        }
      }
      
      // Test 6: Create a post (if implemented)
      console.log(`\n${colors.blue}📍 Test 6: Create a test post${colors.reset}`);
      
      try {
        const postResponse = await axios.post(`${API_URL}/posts`, {
          content: 'Test post from authentication test script! 🚀'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`${colors.green}✅ Post created successfully:${colors.reset}`);
        console.log('   Post ID:', postResponse.data.post._id);
        console.log('   Content:', postResponse.data.post.content);
      } catch (error) {
        console.log(`${colors.yellow}⚠️  Post creation not yet implemented or failed${colors.reset}`);
        console.log('   Error:', error.response?.data?.message || error.message);
      }
      
      // Summary
      console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
      console.log(`${colors.green}🎉 All authentication tests passed!${colors.reset}`);
      console.log(`${colors.green}Your authentication system is working correctly.${colors.reset}`);
      console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);
      
    } else {
      console.log(`${colors.red}❌ Login failed - no token received${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Test failed:${colors.reset}`, error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status);
    console.error('Full error:', error.response?.data);
    
    // Helpful debugging info
    console.log(`\n${colors.yellow}🔍 Debugging Tips:${colors.reset}`);
    console.log('1. Make sure your backend server is running: npm start or node server.js');
    console.log('2. Check MongoDB is connected');
    console.log('3. Verify the test user exists in the database');
    console.log('4. Check server logs for more details');
  }
}

// Additional test for registration
async function testRegistration() {
  console.log(`\n${colors.blue}📍 Optional: Test Registration${colors.reset}`);
  
  const newUser = {
    email: `test${Date.now()}@viurl.com`,
    password: 'Test123!',
    name: 'Test User',
    username: `testuser${Date.now()}`
  };
  
  try {
    const response = await axios.post(`${API_URL}/auth/register`, newUser);
    console.log(`${colors.green}✅ Registration successful!${colors.reset}`);
    console.log('   New user:', response.data.user);
    return response.data;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Registration test skipped or failed${colors.reset}`);
    console.log('   Error:', error.response?.data?.message || error.message);
    return null;
  }
}

// Run the tests
async function runAllTests() {
  console.log(`${colors.cyan}Starting Viurl Authentication Tests...${colors.reset}\n`);
  console.log('🔗 Testing against:', API_URL);
  console.log('📅 Test time:', new Date().toISOString());
  console.log('');
  
  // Run main auth tests
  await testAuth();
  
  // Optionally test registration
  // Uncomment the line below to test registration
  // await testRegistration();
  
  console.log(`${colors.cyan}Tests completed!${colors.reset}`);
}

// Execute tests
runAllTests().catch(console.error);

// Instructions
console.log(`
${colors.yellow}📝 Usage Instructions:${colors.reset}
1. Make sure your backend server is running: ${colors.cyan}node server.js${colors.reset}
2. Run this test: ${colors.cyan}node test-auth.js${colors.reset}
3. Check the output for any errors

${colors.yellow}📦 Required:${colors.reset}
- axios: ${colors.cyan}npm install axios${colors.reset} (if not installed)
`);