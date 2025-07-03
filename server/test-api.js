const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('Health check:', healthResponse.data);
    
    // Test chat endpoint
    console.log('\nTesting chat endpoint...');
    const chatResponse = await axios.post(`${API_URL}/chat`, {
      prompt: 'What is my name?',
      systemMessage: 'You are a helpful assistant'
    });
    
    console.log('Chat response:', {
      success: chatResponse.data.success,
      textResponse: chatResponse.data.textResponse,
      hasAudio: !!chatResponse.data.audioUrl,
      audioUrl: chatResponse.data.audioUrl
    });
    
    console.log('\nAPI test completed successfully!');
  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAPI(); 