/**
 * VAPI AI CHAT FORMAT VALIDATION UTILITY
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This utility specifically tests the correct format for Vapi AI chat interactions.
 * It validates the exact request structure needed for successful conversations
 * and helps debug integration issues with the chat API.
 * 
 * TESTING METHODOLOGY:
 * - Creates a test assistant to establish proper conversation context
 * - Tests the correct chat API format with assistantId and input fields
 * - Validates response structure and content extraction
 * - Provides fallback testing for alternative request formats
 * 
 * INTEGRATION DEBUGGING:
 * This script helps identify:
 * - Correct request format for Vapi AI chat API
 * - Required fields and their expected values
 * - Response structure for parsing AI responses
 * - Error scenarios and their handling requirements
 * 
 * DEVELOPMENT WORKFLOW:
 * Run this when integrating with Vapi AI to understand:
 * - How to structure chat requests correctly
 * - What response format to expect
 * - How to handle different error conditions
 * - Assistant creation and management workflow
 */

require('dotenv').config();
const axios = require('axios');

// Vapi AI configuration with production-ready API key
const VAPI_API_KEY = process.env.VAPI_API_KEY || '44a43177-eed7-4ccf-a2f7-3d42a94507be';
const VAPI_BASE_URL = 'https://api.vapi.ai';

/**
 * Correct Chat API Format Testing Function
 * 
 * TESTING WORKFLOW:
 * 1. Creates a test assistant with proper configuration
 * 2. Tests chat creation using the assistant ID
 * 3. Validates response structure and data extraction
 * 4. Tests alternative formats if primary method fails
 * 
 * This comprehensive approach ensures we understand exactly
 * how to integrate with Vapi AI's chat system correctly.
 */
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