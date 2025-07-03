require('dotenv').config();
const axios = require('axios');

const VAPI_API_KEY = process.env.VAPI_API_KEY || '44a43177-eed7-4ccf-a2f7-3d42a94507be';
const VAPI_BASE_URL = 'https://api.vapi.ai';

async function testCorrectChatAPI() {
  console.log('Testing correct Vapi Chat API format...');
  console.log('API Key:', VAPI_API_KEY ? `${VAPI_API_KEY.substring(0, 8)}...` : 'Not set');
  
  try {
    // First, let's create a simple assistant to use for chat
    console.log('\n1. Creating a simple assistant...');
    const assistant = await axios.post(`${VAPI_BASE_URL}/assistant`, {
      name: "Test Chat Assistant",
      firstMessage: "Hello! How can I help you?",
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Keep responses brief and friendly."
          }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM"
      }
    }, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Assistant created:', assistant.data.id);
    const assistantId = assistant.data.id;
    
    // Now try to create a chat with this assistant
    console.log('\n2. Testing chat creation with assistant...');
    const chatResponse = await axios.post(`${VAPI_BASE_URL}/chat`, {
      assistantId: assistantId,
      input: "Hello, how are you?"
    }, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Chat created successfully:', chatResponse.status);
    console.log('Chat response:', JSON.stringify(chatResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    
    // Try alternative format
    console.log('\n3. Trying alternative chat format...');
    try {
      const altResponse = await axios.post(`${VAPI_BASE_URL}/chat`, {
        input: "Hello, this is a test message"
      }, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Alternative format worked:', altResponse.status);
      console.log('Response:', JSON.stringify(altResponse.data, null, 2));
      
    } catch (altError) {
      console.log('❌ Alternative format failed:', altError.response?.status, altError.response?.data || altError.message);
    }
  }
}

testCorrectChatAPI().catch(console.error); 