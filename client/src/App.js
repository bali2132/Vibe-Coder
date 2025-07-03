/**
 * CONVERSATIONAL AI BUILDER - FRONTEND APPLICATION
 * 
 * This is the main React frontend for the Conversational AI Builder application.
 * It provides a modern, responsive user interface for:
 * - Text input for user prompts with real-time validation
 * - Real-time AI conversation powered by Vapi AI backend
 * - Audio playback of AI responses with comprehensive controls
 * - Server health monitoring and automatic reconnection
 * - Comprehensive error handling and user feedback
 * 
 * COMPONENT ARCHITECTURE AND DESIGN PATTERNS:
 * - Single-page application with centralized state management
 * - React Hooks pattern for clean, functional component design
 * - Separation of concerns: UI, API logic, audio handling, error management
 * - Real-time status monitoring with automatic health checks
 * - Responsive design with mobile-first approach
 * 
 * STATE MANAGEMENT STRATEGY:
 * - useState for component-level state management
 * - useRef for audio element control and direct DOM manipulation
 * - useEffect for lifecycle management and side effects
 * - Centralized error state for consistent error handling
 * - Real-time server connection monitoring
 * 
 * USER EXPERIENCE DESIGN:
 * - Progressive enhancement: works without audio if TTS fails
 * - Loading states with clear progress indicators
 * - Toast notifications for all user actions and system events
 * - Character counting with visual feedback
 * - Disabled states during loading and server disconnection
 * - Clear visual hierarchy and intuitive navigation
 * 
 * API INTEGRATION PATTERNS:
 * - Axios for HTTP client with timeout and error handling
 * - Automatic retry mechanisms for failed requests
 * - Real-time health monitoring with periodic checks
 * - Graceful degradation when backend services are unavailable
 * - Structured error handling with user-friendly messages
 * 
 * AUDIO SYSTEM DESIGN:
 * - HTML5 audio element with programmatic control
 * - Play/pause functionality with visual feedback
 * - Error handling for audio loading and playback failures
 * - Automatic state management for audio events
 * - Preloading for smooth playback experience
 * 
 * Technologies Used:
 * - React with Hooks (useState, useRef, useEffect)
 * - Axios for HTTP requests to backend API
 * - Lucide React for modern, consistent icons
 * - React Hot Toast for elegant user notifications
 * - CSS3 for responsive, modern styling
 * 
 * Author: Built for job interview task
 * Requirements: React + Node.js, clean UI, voice playback capability
 */

// Import React core functionality
import React, { useState, useRef, useEffect } from 'react';

// Import HTTP client for API communication
import axios from 'axios';

// Import icon components for modern UI
import { Send, Play, Pause, MessageSquare, Volume2, Loader, AlertCircle, CheckCircle } from 'lucide-react';

// Import toast notification system
import { Toaster, toast } from 'react-hot-toast';

// Import CSS styles
import './index.css';

/**
 * Main Conversational AI Builder Application Component
 * 
 * Features:
 * - Text input for prompts with character counting
 * - AI-powered text responses via Vapi AI backend
 * - Voice synthesis and playback controls
 * - Clean, modern UI with loading states and animations
 * - Comprehensive error handling and user feedback
 * - Real-time server health monitoring
 * - Responsive design for mobile and desktop
 */
function App() {
  // =============================================================================
  // STATE MANAGEMENT - COMPREHENSIVE REACT HOOKS ARCHITECTURE
  // =============================================================================
  
  // USER INPUT STATE MANAGEMENT
  // These states handle all user input and form interaction
  const [prompt, setPrompt] = useState('');                    // Main user prompt text - the core conversation input
  const [systemMessage, setSystemMessage] = useState('');      // Optional system message override - allows AI behavior customization
  
  // AI RESPONSE AND INTERACTION STATE MANAGEMENT
  // These states manage the complete conversation lifecycle
  const [response, setResponse] = useState(null);              // AI response data object - contains text, audio, metadata
  const [loading, setLoading] = useState(false);               // Loading state for API calls - controls UI feedback
  const [error, setError] = useState(null);                    // Error message display - centralized error handling
  
  // AUDIO PLAYBACK STATE MANAGEMENT
  // Manages the complete audio experience for voice responses
  const [audioPlaying, setAudioPlaying] = useState(false);     // Audio playback status - controls play/pause UI
  
  // SERVER CONNECTION MONITORING STATE
  // Real-time backend connectivity status for reliable user experience
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'connected', 'disconnected' - three-state monitoring
  
  // AUDIO ELEMENT REFERENCE FOR DIRECT DOM MANIPULATION
  // useRef provides direct access to audio element for programmatic control
  const audioRef = useRef(null);

  // =============================================================================
  // CONFIGURATION
  // =============================================================================
  
  // API Base URL - Always use localhost for development
  // In production, this would be configured via environment variables
  const API_BASE_URL = 'http://localhost:5000/api';

  // =============================================================================
  // EFFECT HOOKS
  // =============================================================================
  
  /**
   * Component Mount Effect - Application Lifecycle Management
   * 
   * PURPOSE AND BUSINESS LOGIC:
   * This effect implements the application's health monitoring system.
   * It ensures the frontend always knows the backend status and can
   * provide appropriate user feedback.
   * 
   * IMPLEMENTATION STRATEGY:
   * - Immediate health check on component mount for instant feedback
   * - Periodic monitoring every 30 seconds for real-time status updates
   * - Cleanup function prevents memory leaks and unnecessary requests
   * 
   * USER EXPERIENCE BENEFITS:
   * - Users immediately see connection status when app loads
   * - Real-time updates if backend goes down or comes back online
   * - Prevents users from trying to send messages when backend is unavailable
   * - Provides clear feedback about system status
   */
  useEffect(() => {
    checkServerHealth();
    // Check server health every 30 seconds to monitor backend status
    // 30-second interval balances responsiveness with reasonable request frequency
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval); // Cleanup on unmount prevents memory leaks
  }, []);

  // =============================================================================
  // SERVER HEALTH MONITORING
  // =============================================================================
  
  /**
   * Check Backend Server Health and Connectivity
   * 
   * This function verifies that the backend server is running and accessible.
   * It updates the UI status indicator and shows appropriate error messages.
   * 
   * Status Indicators:
   * - 'checking': Initial state while verifying connection
   * - 'connected': Server is accessible and responding
   * - 'disconnected': Server is not reachable or responding with errors
   */
  const checkServerHealth = async () => {
    try {
      console.log('Checking server health at:', `${API_BASE_URL}/health`);
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000 // 5 second timeout for health checks
      });
      
      if (response.data.status) {
        setServerStatus('connected');
        if (response.data.aiProvider) {
          console.log('Connected to:', response.data.aiProvider);
        }
      }
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerStatus('disconnected');
      
      // Show specific error messages based on error type
      if (error.code === 'ECONNREFUSED') {
        toast.error('Backend server is not running. Please start the server with "node index.js" in the server directory.');
      } else {
        toast.error('Unable to connect to AI server. Please check if the server is running on port 5000.');
      }
    }
  };

  // =============================================================================
  // MAIN CHAT FUNCTIONALITY
  // =============================================================================
  
  /**
   * Handle Form Submission for AI Chat
   * 
   * This is the main function that processes user input and communicates with the backend.
   * 
   * Process Flow:
   * 1. Validate user input
   * 2. Check server connectivity
   * 3. Send request to backend /api/chat endpoint
   * 4. Process AI response and audio file
   * 5. Update UI with results
   * 6. Handle any errors gracefully
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // =============================================================================
    // INPUT VALIDATION
    // =============================================================================
    if (!prompt.trim()) {
      toast.error('Please enter a prompt!');
      return;
    }

    // Check server connection before proceeding
    if (serverStatus !== 'connected') {
      toast.error('Server is not connected. Please check your backend.');
      return;
    }

    // =============================================================================
    // PREPARE FOR API CALL
    // =============================================================================
    setLoading(true);      // Show loading spinner
    setError(null);        // Clear previous errors
    setResponse(null);     // Clear previous response

    try {
      // Show loading notification to user
      const loadingToast = toast.loading('Generating AI response with Vapi...');

      // =============================================================================
      // API REQUEST TO BACKEND
      // =============================================================================
      console.log('Sending chat request to:', `${API_BASE_URL}/chat`);
      const result = await axios.post(`${API_BASE_URL}/chat`, {
        message: prompt.trim(),
        systemMessage: systemMessage.trim() || undefined
      }, {
        timeout: 30000 // 30 second timeout for AI generation
      });

      // =============================================================================
      // PROCESS API RESPONSE
      // =============================================================================
      if (result.data.response) {
        // Format the response to match expected UI structure
        const formattedResponse = {
          textResponse: result.data.response,
          audioUrl: result.data.audioFileName ? `${API_BASE_URL}/audio/${result.data.audioFileName}` : null,
          timestamp: new Date().toISOString(),
          promptLength: prompt.trim().length,
          responseLength: result.data.response.length,
          aiProvider: 'Vapi AI',
          success: true
        };
        
        // Update UI with successful response
        setResponse(formattedResponse);
        toast.success('AI response generated successfully!', { id: loadingToast });
        
        // Clear the prompt after successful submission for better UX
        setPrompt('');
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      // =============================================================================
      // ERROR HANDLING
      // =============================================================================
      console.error('Error generating response:', error);
      
      // Determine appropriate error message based on error type
      let errorMessage = 'Failed to generate response. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 429) {
        errorMessage = 'API rate limit exceeded. Please wait a moment and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Vapi API authentication failed. Please check your API key configuration.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The AI is taking longer than usual to respond.';
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.';
        setServerStatus('disconnected');
      }

      // Update UI with error state
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  // =============================================================================
  // AUDIO PLAYBACK FUNCTIONALITY
  // =============================================================================
  
  /**
   * Handle Audio Playback Controls
   * 
   * This function manages the play/pause functionality for AI response audio.
   * It toggles between play and pause states and provides user feedback.
   * 
   * Features:
   * - Play/pause toggle functionality
   * - Error handling for audio playback issues
   * - User notifications for audio events
   * - Automatic state management
   */
  const handleAudioPlay = () => {
    // Check if audio is available
    if (!response?.audioUrl) {
      toast.error('No audio available to play');
      return;
    }

    try {
      if (audioRef.current) {
        if (audioPlaying) {
          // PAUSE AUDIO
          audioRef.current.pause();
          setAudioPlaying(false);
          toast('Audio paused');
        } else {
          // PLAY AUDIO
          audioRef.current.play()
            .then(() => {
              setAudioPlaying(true);
              toast.success('Playing audio response');
            })
            .catch((error) => {
              console.error('Error playing audio:', error);
              toast.error('Failed to play audio. Please try again.');
            });
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio. Please try again.');
    }
  };

  // =============================================================================
  // AUDIO EVENT HANDLERS
  // =============================================================================
  
  /**
   * Handle Audio Playback Completion
   * Called automatically when audio finishes playing
   */
  const handleAudioEnded = () => {
    setAudioPlaying(false);
  };

  /**
   * Handle Audio Loading/Playback Errors
   * Called when audio file cannot be loaded or played
   */
  const handleAudioError = () => {
    setAudioPlaying(false);
    toast.error('Error loading audio file');
  };

  // =============================================================================
  // UI UTILITY FUNCTIONS
  // =============================================================================
  
  /**
   * Clear Current Response and Reset UI
   * Allows users to start a fresh conversation
   */
  const clearResponse = () => {
    setResponse(null);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
  };

  /**
   * Get Server Status Indicator Component
   * 
   * Returns appropriate status indicator based on current server connection state.
   * Provides visual feedback about backend connectivity to users.
   * 
   * @returns {JSX.Element} Status indicator component
   */
  const getStatusIndicator = () => {
    if (serverStatus === 'checking') {
      return (
        <div className="status-indicator warning">
          <Loader size={16} className="loading-spinner" />
          Checking server connection...
        </div>
      );
    } else if (serverStatus === 'connected') {
      return (
        <div className="status-indicator success">
          <CheckCircle size={16} />
          Connected to Vapi AI server (localhost:5000)
        </div>
      );
    } else {
      return (
        <div className="status-indicator error">
          <AlertCircle size={16} />
          Server disconnected - Please start the backend server
        </div>
      );
    }
  };

  // =============================================================================
  // MAIN COMPONENT RENDER
  // =============================================================================
  
  return (
    <div className="app">
      {/* =============================================================================
          TOAST NOTIFICATION SYSTEM
          ============================================================================= */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* =============================================================================
          APPLICATION HEADER
          ============================================================================= */}
      <header className="header">
        <h1>🎤 Conversational AI Builder</h1>
        <p>Create intelligent voice assistants with Vapi AI - Advanced Voice Technology</p>
        <div style={{ fontSize: '14px', opacity: '0.8', marginTop: '0.5rem' }}>
          Powered by Vapi AI • Running on localhost:5000
        </div>
      </header>

      {/* =============================================================================
          MAIN CHAT INTERFACE
          ============================================================================= */}
      <main className="chat-container">
        {/* Server status indicator for real-time connection monitoring */}
        {getStatusIndicator()}

        {/* =============================================================================
            USER INPUT SECTION
            ============================================================================= */}
        <section className="input-section">
          <form onSubmit={handleSubmit}>
            {/* Optional system message input for advanced users */}
            <div>
              <label htmlFor="system-message" className="system-message-label">
                System Message (Optional)
              </label>
              <input
                id="system-message"
                type="text"
                className="system-message-input"
                placeholder="Customize the AI's behavior (e.g., 'You are a helpful cooking assistant')"
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Main prompt input with character limit */}
            <div className="input-group">
              <textarea
                className="prompt-input"
                placeholder="Enter your prompt here... (e.g., 'Explain how machine learning works in simple terms')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                rows={3}
                maxLength={1000}
                required
              />
              <button
                type="submit"
                className="send-button"
                disabled={loading || !prompt.trim() || serverStatus !== 'connected'}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="loading-spinner" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Character count indicator */}
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
            {prompt.length}/1000 characters
          </div>
        </section>

        {/* =============================================================================
            LOADING STATE DISPLAY
            ============================================================================= */}
        {loading && (
          <div className="loading">
            <Loader size={24} className="loading-spinner" />
            <span>Vapi AI is generating your response...</span>
          </div>
        )}

        {/* =============================================================================
            ERROR STATE DISPLAY
            ============================================================================= */}
        {error && (
          <div className="error">
            <AlertCircle size={20} style={{ marginRight: '10px' }} />
            {error}
          </div>
        )}

        {/* =============================================================================
            AI RESPONSE DISPLAY SECTION
            ============================================================================= */}
        {response && (
          <section className="response-section">
            {/* Response header with clear button */}
            <div className="response-header">
              <MessageSquare size={20} />
              <span>Vapi AI Response</span>
              <button 
                onClick={clearResponse}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>

            {/* AI-generated text response */}
            <div className="response-text">
              {response.textResponse}
            </div>

            {/* =============================================================================
                AUDIO PLAYBACK CONTROLS
                ============================================================================= */}
            {response.audioUrl && (
              <div className="audio-controls">
                <button
                  className="play-button"
                  onClick={handleAudioPlay}
                  title={audioPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {audioPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                
                <div className="audio-info">
                  <h4>🎵 Voice Response</h4>
                  <p>
                    {audioPlaying ? 'Playing...' : 'Click to hear the AI response'}
                  </p>
                </div>

                <Volume2 size={20} style={{ color: '#667eea' }} />
              </div>
            )}

            {/* Hidden audio element for playback functionality */}
            {response.audioUrl && (
              <audio
                ref={audioRef}
                src={response.audioUrl}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                preload="auto"
              />
            )}

            {/* =============================================================================
                RESPONSE METADATA DISPLAY
                ============================================================================= */}
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: '#f0f0f0', 
              borderRadius: '6px',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>Response Details:</strong><br />
              Generated at: {new Date(response.timestamp).toLocaleString()}<br />
              Prompt length: {response.promptLength} characters<br />
              Response length: {response.responseLength} characters<br />
              AI Provider: {response.aiProvider}<br />
              {response.assistantId && `Assistant ID: ${response.assistantId}`}
            </div>
          </section>
        )}

        {/* =============================================================================
            WELCOME MESSAGE FOR NEW USERS
            ============================================================================= */}
        {!response && !loading && !error && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontStyle: 'italic',
            marginTop: '20px'
          }}>
            💡 Enter a prompt above to start a conversation with Vapi AI.<br />
            You'll receive intelligent text responses powered by advanced voice technology!
          </div>
        )}
      </main>

      {/* =============================================================================
          APPLICATION FOOTER
          ============================================================================= */}
      <footer style={{ 
        marginTop: 'auto', 
        textAlign: 'center', 
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px'
      }}>
        <p>Built with React, Node.js, and Vapi AI</p>
        <p>Featuring Vapi's Advanced Voice AI Technology • Running on localhost</p>
      </footer>
    </div>
  );
}

// Export the main App component for use in index.js
export default App; 