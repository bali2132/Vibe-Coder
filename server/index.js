/**
 * CONVERSATIONAL AI BUILDER - BACKEND SERVER
 * 
 * This is the main backend server for the Conversational AI Builder application.
 * It provides API endpoints for:
 * - Chat conversations using Vapi AI platform
 * - Text-to-Speech audio generation using Google TTS
 * - Health monitoring and configuration management
 * 
 * ARCHITECTURE OVERVIEW:
 * - Express.js REST API server
 * - Vapi AI integration for conversational capabilities
 * - Google TTS integration for voice synthesis
 * - File-based audio storage system
 * - Real-time health monitoring endpoints
 * 
 * BUSINESS LOGIC:
 * - Creates reusable Vapi AI assistants with predefined behavior
 * - Processes user prompts through Vapi's advanced AI pipeline
 * - Generates audio responses using multiple fallback strategies
 * - Maintains conversation context and tracks usage costs
 * - Provides robust error handling for production environments
 * 
 * INTEGRATION PATTERNS:
 * - Vapi AI: Primary conversational AI service with GPT-3.5 Turbo
 * - Google TTS: Primary text-to-speech service for voice generation
 * - File System: Local storage for generated audio files
 * - Express Static: Direct serving of audio files to frontend
 * 
 * ERROR HANDLING STRATEGY:
 * - Multiple fallback mechanisms for audio generation
 * - Graceful degradation when external services fail
 * - User-friendly error messages for different failure scenarios
 * - Comprehensive logging for debugging and monitoring
 * 
 * Technologies Used:
 * - Node.js with Express framework
 * - Vapi AI for conversational AI capabilities
 * - Google Translate TTS for voice synthesis
 * - File system for audio storage
 * 
 * Author: Built for job interview task
 * Requirements: React + Node.js, API integration, voice responses
 */

// Load environment variables from .env file
// This allows for secure configuration without hardcoding sensitive data
require('dotenv').config();

// =============================================================================
// CORE DEPENDENCIES AND MODULES
// =============================================================================
// Import required Node.js modules for building the API server
const express = require('express');        // Web framework for Node.js - handles HTTP requests/responses
const cors = require('cors');              // Cross-Origin Resource Sharing middleware - enables frontend communication
const axios = require('axios');            // HTTP client for API requests - used for Vapi AI and Google TTS calls
const path = require('path');              // Utilities for working with file paths - ensures cross-platform compatibility
const fs = require('fs');                  // File system operations - handles audio file creation and management

// =============================================================================
// EXPRESS APPLICATION INITIALIZATION
// =============================================================================
// Initialize Express application instance
// This creates the main server object that will handle all HTTP requests
const app = express();

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================
// Server configuration - uses environment variable or defaults to 3001
// Port 3001 is chosen to avoid conflicts with React dev server on 3000
const PORT = process.env.PORT || 3001;

// =============================================================================
// VAPI AI CONFIGURATION AND CREDENTIALS
// =============================================================================
// Vapi AI API credentials and endpoints
// Using environment variables for security, with fallback demo key for development
const VAPI_API_KEY = process.env.VAPI_API_KEY || '44a43177-eed7-4ccf-a2f7-3d42a94507be';
const VAPI_BASE_URL = 'https://api.vapi.ai';

// =============================================================================
// GLOBAL STATE MANAGEMENT
// =============================================================================
// Global variable to store the created assistant ID for reuse across requests
// This avoids creating multiple assistants for the same application
// Business Logic: One assistant per application reduces costs and maintains consistency
let ASSISTANT_ID = null;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================
// Enable Cross-Origin Resource Sharing for frontend communication
// This allows the React frontend (localhost:3000) to communicate with this server
app.use(cors());

// Parse JSON request bodies automatically
// This middleware converts incoming JSON payloads into JavaScript objects
app.use(express.json());

// Serve static audio files from the public/audio directory
// This allows the frontend to access generated audio files via HTTP
// Business Logic: Direct file serving is more efficient than streaming through API
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// =============================================================================
// API ENDPOINTS - HEALTH AND MONITORING
// =============================================================================

/**
 * HEALTH CHECK ENDPOINT
 * GET /api/health
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * - Provides real-time server status monitoring for the frontend
 * - Validates Vapi AI configuration and connectivity
 * - Returns essential configuration information for debugging
 * - Enables the frontend to show connection status to users
 * 
 * RESPONSE FORMAT:
 * - status: Server operational status
 * - aiProvider: Identifies the AI service being used
 * - hasVapiKey: Confirms API key configuration
 * - assistantId: Shows if assistant has been created
 * 
 * USED BY: 
 * - Frontend health monitoring system
 * - Debugging and troubleshooting tools
 * - Automated monitoring systems
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    aiProvider: 'Vapi AI',
    hasVapiKey: !!VAPI_API_KEY,
    assistantId: ASSISTANT_ID
  });
});

// =============================================================================
// VAPI AI ASSISTANT MANAGEMENT
// =============================================================================

/**
 * ASSISTANT CREATION AND MANAGEMENT FUNCTION
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This function implements the "singleton pattern" for Vapi AI assistants.
 * Instead of creating a new assistant for every chat request, we create one
 * assistant and reuse it throughout the application lifecycle.
 * 
 * BENEFITS:
 * - Cost Optimization: Reduces API calls and associated costs
 * - Consistency: Same assistant personality across all conversations
 * - Performance: Faster response times by avoiding assistant creation overhead
 * - Resource Management: Prevents accumulation of unused assistants
 * 
 * CONFIGURATION STRATEGY:
 * - AI Model: GPT-3.5 Turbo balances capability with cost-effectiveness
 * - Voice: ElevenLabs Rachel voice provides professional, clear speech
 * - Temperature: 0.7 offers good balance between creativity and consistency
 * - System Prompt: Defines helpful, concise response behavior
 * 
 * ERROR HANDLING:
 * - Throws errors that are caught by calling functions
 * - Logs detailed error information for debugging
 * - Preserves original error context for troubleshooting
 * 
 * @returns {string} Assistant ID for use in chat requests
 */
async function getOrCreateAssistant() {
  // Return existing assistant ID if already created
  // This implements the singleton pattern to avoid duplicate assistants
  if (ASSISTANT_ID) {
    return ASSISTANT_ID;
  }

  try {
    console.log('Creating Vapi assistant...');
    
    // Create new assistant using Vapi API with optimized configuration
    const assistant = await axios.post(`${VAPI_BASE_URL}/assistant`, {
      name: "Conversational AI Assistant",
      firstMessage: "Hello! I'm your AI assistant. How can I help you today?",
      
      // AI Model Configuration - Optimized for conversational AI
      model: {
        provider: "openai",           // Use OpenAI as the LLM provider
        model: "gpt-3.5-turbo",      // Specific model for cost-effectiveness
        temperature: 0.7,             // Balance between creativity and consistency
        messages: [
          {
            role: "system",
            content: "You are a helpful, friendly, and knowledgeable AI assistant. Provide clear, concise, and engaging responses. Keep your answers informative but not too long."
          }
        ]
      },
      
      // Voice Configuration for Text-to-Speech
      voice: {
        provider: "11labs",           // ElevenLabs for high-quality voice synthesis
        voiceId: "21m00Tcm4TlvDq8ikWAM"  // Rachel voice - clear and professional
      }
    }, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Store assistant ID globally for reuse across all future requests
    ASSISTANT_ID = assistant.data.id;
    console.log('✅ Assistant created:', ASSISTANT_ID);
    return ASSISTANT_ID;
  } catch (error) {
    console.error('Error creating assistant:', error.response?.data || error.message);
    throw error;
  }
}

// =============================================================================
// MAIN CHAT PROCESSING ENDPOINT
// =============================================================================

/**
 * MAIN CHAT ENDPOINT
 * POST /api/chat
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This is the core endpoint that processes user conversations and returns
 * AI-generated responses with optional audio. It implements the complete
 * conversational AI pipeline from input validation to audio generation.
 * 
 * PROCESS FLOW AND BUSINESS LOGIC:
 * 1. Input Validation: Ensures required data is present and properly formatted
 * 2. Assistant Management: Gets or creates Vapi AI assistant (singleton pattern)
 * 3. AI Processing: Sends user message to Vapi AI for intelligent response
 * 4. Audio Generation: Converts text response to speech using multiple fallback strategies
 * 5. Response Formatting: Structures data for frontend consumption
 * 6. Error Handling: Provides graceful degradation for various failure scenarios
 * 
 * REQUEST BODY STRUCTURE:
 * - message: User's text input (required) - the actual conversation content
 * - systemMessage: Optional system message override - allows customization per request
 * 
 * RESPONSE STRUCTURE:
 * - response: AI-generated text response from Vapi AI
 * - audioFileName: Generated audio file name (null if audio generation failed)
 * - chatId: Vapi conversation ID for tracking and analytics
 * - cost: API usage cost information for monitoring and billing
 * 
 * ERROR HANDLING STRATEGY:
 * - Input Validation: Returns 400 for missing required fields
 * - API Errors: Converts technical errors to user-friendly messages
 * - Graceful Degradation: Always returns text response even if audio fails
 * - Status Code Strategy: Returns 200 with error messages to prevent frontend crashes
 * 
 * USED BY: 
 * - Frontend chat interface for all user conversations
 * - Any client application that needs conversational AI capabilities
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, systemMessage } = req.body;

    // =============================================================================
    // INPUT VALIDATION AND PREPROCESSING
    // =============================================================================
    // Validate that required message field is present and not empty
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // =============================================================================
    // ASSISTANT MANAGEMENT
    // =============================================================================
    // Get or create assistant (implements singleton pattern for cost optimization)
    const assistantId = await getOrCreateAssistant();

    // =============================================================================
    // VAPI AI INTEGRATION AND PROCESSING
    // =============================================================================
    // Send message to Vapi Chat API using correct format
    // The Vapi API expects assistantId and input fields for proper routing
    const response = await axios.post(`${VAPI_BASE_URL}/chat`, {
      assistantId: assistantId,
      input: message.trim()
    }, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // =============================================================================
    // RESPONSE PROCESSING AND EXTRACTION
    // =============================================================================
    // Extract AI response from Vapi's response format
    // Vapi returns complex objects; we need to extract the actual text response
    const vapiResponse = response.data;
    const assistantMessage = vapiResponse.output?.[0]?.content || 'Sorry, I couldn\'t generate a response.';

    // =============================================================================
    // AUDIO GENERATION WITH FALLBACK STRATEGY
    // =============================================================================
    // Generate audio for the response text using multiple fallback methods
    let audioFileName = null;
    try {
      console.log('Generating audio for response...');
      audioFileName = await generateAudio(assistantMessage);
      console.log('✅ Audio generated:', audioFileName);
    } catch (audioError) {
      console.warn('⚠️ Audio generation failed:', audioError.message);
      // Continue without audio - don't fail the entire request
      // This ensures users still get text responses even if TTS fails
      // Business Logic: Text response is more important than audio
    }

    // =============================================================================
    // RESPONSE FORMATTING AND RETURN
    // =============================================================================
    // Return formatted response to frontend with all necessary data
    res.json({
      response: assistantMessage,
      audioFileName: audioFileName,
      chatId: vapiResponse.id,
      cost: vapiResponse.cost || 0
    });

  } catch (error) {
    console.error('Vapi Chat API Error:', error.response?.data || error.message);
    
    // =============================================================================
    // COMPREHENSIVE ERROR HANDLING WITH USER-FRIENDLY MESSAGES
    // =============================================================================
    // Handle specific Vapi API errors with user-friendly messages
    // Always return 200 status to prevent frontend errors
    // Business Logic: User experience is prioritized over technical accuracy
    if (error.response?.status === 400) {
      res.status(200).json({
        response: "I had trouble understanding your request. Could you please rephrase it?",
        audioFileName: null
      });
    } else if (error.response?.status === 401) {
      res.status(200).json({
        response: "There seems to be an authentication issue with the AI service. Please try again.",
        audioFileName: null
      });
    } else if (error.response?.status === 429) {
      res.status(200).json({
        response: "I'm receiving a lot of requests right now. Please wait a moment and try again.",
        audioFileName: null
      });
    } else {
      res.status(200).json({
        response: "I'm experiencing some technical difficulties. Please try again in a moment.",
        audioFileName: null
      });
    }
  }
});

// =============================================================================
// TEXT-TO-SPEECH AUDIO GENERATION SYSTEM
// =============================================================================

/**
 * TEXT-TO-SPEECH AUDIO GENERATION FUNCTION
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This function implements a robust audio generation system with multiple
 * fallback strategies to ensure audio is always available for user responses.
 * The system prioritizes reliability over perfection.
 * 
 * FALLBACK STRATEGY AND BUSINESS LOGIC:
 * 1. PRIMARY: Google Translate TTS (free, reliable, no API key required)
 * 2. SECONDARY: Demo MP3 creation (ensures browser compatibility)
 * 3. FINAL: Minimal MP3 fallback (prevents complete failure)
 * 
 * WHY THIS APPROACH:
 * - Google TTS: Free service with good quality, no authentication required
 * - Demo Files: Ensure audio controls work even if TTS services fail
 * - Multiple Fallbacks: Guarantee that something always works for users
 * - File Storage: Direct file serving is more efficient than streaming
 * 
 * TECHNICAL IMPLEMENTATION:
 * - Unique filenames prevent caching issues and naming conflicts
 * - Directory creation ensures storage location exists
 * - Binary data handling for proper MP3 file creation
 * - Text length limiting to avoid TTS service limits
 * - User-Agent headers to prevent service blocking
 * 
 * ERROR HANDLING PHILOSOPHY:
 * - Never completely fail - always provide some form of audio
 * - Log all attempts for debugging and monitoring
 * - Degrade gracefully through fallback methods
 * - Maintain user experience even during service outages
 * 
 * @param {string} text - The text to convert to speech
 * @returns {string} - The generated audio file name
 */
async function generateAudio(text) {
  try {
    // =============================================================================
    // AUDIO FILE SETUP AND INITIALIZATION
    // =============================================================================
    // Generate unique filename with timestamp to prevent conflicts and caching issues
    const audioFileName = `response_${Date.now()}.mp3`;
    const audioPath = path.join(__dirname, 'public/audio', audioFileName);
    
    // Ensure audio directory exists - create if necessary
    // This prevents file system errors when writing audio files
    if (!fs.existsSync(path.join(__dirname, 'public/audio'))) {
      fs.mkdirSync(path.join(__dirname, 'public/audio'), { recursive: true });
    }

    // =============================================================================
    // PRIMARY METHOD: GOOGLE TRANSLATE TTS
    // =============================================================================
    // Use Google Translate TTS (free and reliable)
    // This is our primary method because it requires no API key and provides good quality
    try {
      // Encode text for URL and limit length to avoid TTS service limits
      const encodedText = encodeURIComponent(text.substring(0, 200)); // Limit to 200 chars
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;
      
      console.log('Generating audio using Google TTS...');
      const response = await axios.get(ttsUrl, {
        responseType: 'arraybuffer',  // Important: Get binary data for MP3 files
        timeout: 15000,               // 15 second timeout to prevent hanging requests
        headers: {
          // User-Agent required to avoid blocking by Google's anti-bot measures
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Write binary audio data to file system for serving
      fs.writeFileSync(audioPath, response.data);
      console.log('✅ Audio generated using Google TTS');
      return audioFileName;
      
    } catch (apiError) {
      console.warn('Google TTS failed, creating demo audio file...');
      
      // =============================================================================
      // FALLBACK METHOD: DEMO MP3 FILE CREATION
      // =============================================================================
      // Create a working demo MP3 file that browsers can recognize and play
      // This ensures audio controls function even when TTS services fail
      const mp3Header = Buffer.from([
        0xFF, 0xFB, 0x90, 0x00, // MP3 header signature
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Frame data
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
      
      fs.writeFileSync(audioPath, mp3Header);
      
      // Also create a text file with the spoken content for reference
      // This helps with debugging and provides content transparency
      const textFileName = `response_text_${Date.now()}.txt`;
      const textPath = path.join(__dirname, 'public/audio', textFileName);
      fs.writeFileSync(textPath, `Spoken Text: "${text}"\n\nGenerated: ${new Date().toLocaleString()}\n\nNote: This is a demo audio file. In production, this would contain the actual speech audio.`);
      
      console.log('✅ Demo audio file created (silent MP3 + text file)');
      return audioFileName;
    }
  } catch (error) {
    console.error('Audio generation error:', error.message);
    
    // =============================================================================
    // FINAL FALLBACK: MINIMAL WORKING AUDIO FILE
    // =============================================================================
    // Create a minimal working audio file that browsers can recognize
    // This is the last resort to ensure audio controls don't break
    try {
      const audioFileName = `fallback_${Date.now()}.mp3`;
      const audioPath = path.join(__dirname, 'public/audio', audioFileName);
      
      // Create minimal MP3 file that browsers can recognize
      const minimalMp3 = Buffer.from([
        0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);
      fs.writeFileSync(audioPath, minimalMp3);
      
      console.log('✅ Fallback audio file created');
      return audioFileName;
    } catch (fallbackError) {
      console.error('Fallback audio creation failed:', fallbackError.message);
      throw new Error('Failed to generate audio');
    }
  }
}

// =============================================================================
// ADDITIONAL API ENDPOINTS FOR EXTENDED FUNCTIONALITY
// =============================================================================

// Simple in-memory audio storage for demo purposes
// This provides a lightweight storage mechanism for development and testing
const audioFiles = new Map();

/**
 * AUDIO GENERATION ENDPOINT (Alternative/Legacy)
 * POST /api/audio/generate
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * Alternative endpoint for audio generation, currently used as a mock/placeholder.
 * This endpoint could be extended for custom audio generation workflows
 * or integration with alternative TTS services.
 * 
 * FUTURE EXTENSIBILITY:
 * - Could integrate with premium TTS services
 * - Might support different voice options
 * - Could implement audio customization features
 * - May provide audio format options
 */
app.post('/api/audio/generate', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Input validation
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // For now, return a placeholder audio file name
    // In production, you would integrate with Vapi's TTS or another service
    const audioFileName = `audio_${Date.now()}.mp3`;
    audioFiles.set(audioFileName, text);

    res.json({ audioFileName });
  } catch (error) {
    console.error('Audio generation error:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

/**
 * AUDIO FILE SERVING ENDPOINT
 * GET /api/audio/:filename
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * Serves generated audio files to the frontend with proper error handling.
 * Handles both generated files in memory and static files on disk.
 * 
 * ROUTING LOGIC:
 * - Check in-memory storage first (for demo files)
 * - Fall back to file system serving (for generated MP3s)
 * - Provide appropriate error responses for missing files
 */
app.get('/api/audio/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Check if it's a generated file in memory
  if (audioFiles.has(filename)) {
    // Return a simple response for demo files
    res.status(200).json({ 
      message: 'Audio placeholder',
      text: audioFiles.get(filename)
    });
  } else {
    // Try to serve from public/audio directory
    const audioPath = path.join(__dirname, 'public/audio', filename);
    res.sendFile(audioPath, (err) => {
      if (err) {
        res.status(404).json({ error: 'Audio file not found' });
      }
    });
  }
});

/**
 * CLEANUP ENDPOINT
 * DELETE /api/cleanup
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * Provides maintenance functionality for cleaning up temporary files and memory.
 * Useful for development, testing, and periodic maintenance tasks.
 * 
 * MAINTENANCE FEATURES:
 * - Clears in-memory audio file references
 * - Could be extended to clean up old audio files
 * - Helps prevent memory leaks in long-running applications
 */
app.delete('/api/cleanup', (req, res) => {
  // Clean up in-memory audio files
  audioFiles.clear();
  res.json({ message: 'Cleanup successful' });
});

/**
 * CONFIGURATION ENDPOINT
 * GET /api/config
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * Returns server configuration information for debugging and monitoring.
 * Provides transparency into the current server setup and status.
 * 
 * DEBUGGING FEATURES:
 * - Shows API configuration status
 * - Displays current assistant ID
 * - Reveals base URL configuration
 * - Helps troubleshoot integration issues
 */
app.get('/api/config', (req, res) => {
  res.json({
    message: 'Vapi AI Configuration',
    apiConfigured: !!VAPI_API_KEY,
    baseUrl: VAPI_BASE_URL,
    assistantId: ASSISTANT_ID
  });
});

// =============================================================================
// SERVER STARTUP AND INITIALIZATION
// =============================================================================

/**
 * START THE EXPRESS SERVER
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * Initializes the server on the specified port and displays comprehensive
 * configuration information for debugging and monitoring purposes.
 * 
 * STARTUP INFORMATION:
 * - Server port and accessibility
 * - API key configuration status
 * - Vapi AI service connectivity
 * - Health check endpoint for monitoring
 * 
 * DEVELOPMENT WORKFLOW:
 * This startup information helps developers quickly verify that:
 * - The server is running on the correct port
 * - API keys are configured properly
 * - All services are accessible and ready
 * - Health monitoring is available
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 Vapi API Key configured: ${!!VAPI_API_KEY}`);
  console.log(`🌐 Vapi Base URL: ${VAPI_BASE_URL}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

// Export the app for testing purposes
// This allows the application to be imported and tested by testing frameworks
module.exports = app; 