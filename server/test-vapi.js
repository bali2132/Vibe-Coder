require('dotenv').config();
const axios = require('axios');

const VAPI_API_KEY = process.env.VAPI_API_KEY || '3a477c13-52f9-40ae-8fd0-6551f4b83502';
const VAPI_BASE_URL = 'https://api.vapi.ai';

async function testVapiAPI() {
  console.log('Testing Vapi API connectivity...');
  console.log('API Key:', VAPI_API_KEY ? `${VAPI_API_KEY.substring(0, 8)}...` : 'Not set');
  console.log('Base URL:', VAPI_BASE_URL);
  
  try {
    // Test 1: Try to list assistants
    console.log('\n1. Testing /assistant endpoint...');
    const assistantsResponse = await axios.get(`${VAPI_BASE_URL}/assistant`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ Assistants endpoint works:', assistantsResponse.status);
    console.log('Available assistants:', assistantsResponse.data.length || 0);
    
  } catch (error) {
    console.log('❌ Assistants endpoint failed:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // Test 2: Try the chat completions endpoint
    console.log('\n2. Testing /chat/completions endpoint...');
    const chatResponse = await axios.post(`${VAPI_BASE_URL}/chat/completions`, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, this is a test' }],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ Chat completions endpoint works:', chatResponse.status);
    
  } catch (error) {
    console.log('❌ Chat completions endpoint failed:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // Test 3: Try creating a simple chat
    console.log('\n3. Testing /chat endpoint...');
    const simpleChatResponse = await axios.post(`${VAPI_BASE_URL}/chat`, {
      messages: [{ role: 'user', content: 'Hello' }]
    }, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ Simple chat endpoint works:', simpleChatResponse.status);
    
  } catch (error) {
    console.log('❌ Simple chat endpoint failed:', error.response?.status, error.response?.data || error.message);
  }
}

testVapiAPI().catch(console.error); 