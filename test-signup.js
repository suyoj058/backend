// test-signup.js

const axios = require('axios');

async function testSignup() {
  try {
    const response = await axios.post('http://localhost:5000/api/users/signup', {
      firstName: 'Test',
      lastName: 'User',
      contact: '9800000000',
      email: 'test@example.com',
      password: 'secret123'
    });

    console.log('✅ Signup successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('❌ Server responded with an error:', error.response.data);
    } else {
      console.error('❌ Error during signup request:', error.message);
    }
  }
}

testSignup();
