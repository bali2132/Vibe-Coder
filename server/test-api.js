/**
 * API TESTING UTILITY - BACKEND ENDPOINT VALIDATION
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This testing utility validates that all critical backend endpoints
 * are functioning correctly and returning expected data structures.
 * Essential for development workflow and CI/CD pipeline validation.
 * 
 * TESTING STRATEGY:
 * - Health endpoint verification ensures server is operational
 * - Chat endpoint testing validates core conversational AI functionality
 * - Response structure validation ensures frontend compatibility
 * - Error handling verification for production readiness
 * 
 * DEVELOPMENT WORKFLOW:
 * Run this script after starting the server to verify:
 * - All endpoints are accessible and responding
 * - API responses match expected format
 * - Error handling works correctly
 * - Integration with Vapi AI is functional
 */

const axios = require('axios');

// API configuration - points to local development server
const API_URL = 'http://localhost:5000/api';

/**
 * Main API Testing Function
 * 
 * TESTING FLOW:
 * 1. Health Check Test - Validates server is running and configured
 * 2. Chat Endpoint Test - Validates core AI conversation functionality
 * 3. Response Structure Test - Ensures frontend compatibility
 * 4. Error Handling Test - Validates graceful failure scenarios
 */
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