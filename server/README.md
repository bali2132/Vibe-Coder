# 🚀 Conversational AI Builder - Backend Server

## Overview

This is the Node.js/Express backend server for the Conversational AI Builder application. It provides RESTful API endpoints for AI conversations using **Vapi AI** platform and voice synthesis using **Google TTS**.

## 🏗️ Architecture

- **Express.js** - Web framework for API endpoints
- **Vapi AI** - Conversational AI platform with GPT-3.5 Turbo
- **Google TTS** - Text-to-Speech for voice responses
- **File System** - Audio file storage and management
- **CORS** - Cross-origin resource sharing for frontend

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Configuration (Optional)
Create a `.env` file in the server directory:
```env
# Vapi AI Configuration
VAPI_API_KEY=your-vapi-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Note**: The server works without API keys using hardcoded demo credentials.

### 3. Run the Server
```bash
# Start the server
npm start

# Or run directly
node index.js
```

Expected output:
```
🚀 Server running on port 5000
🤖 Vapi API Key configured: true
🌐 Vapi Base URL: https://api.vapi.ai
📡 Health check: http://localhost:5000/api/health
Creating Vapi assistant...
✅ Assistant created: [assistant-id]
```

## 📡 API Endpoints

### Core Endpoints

#### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "aiProvider": "Vapi AI",
  "hasVapiKey": true,
  "assistantId": "assistant-id-here"
}
```

#### Chat Conversation
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "systemMessage": "Optional system message override"
}
```
**Response:**
```json
{
  "response": "Hello! I'm just a digital assistant...",
  "audioFileName": "response_1234567890.mp3",
  "chatId": "vapi-chat-id",
  "cost": 0.0051
}
```

#### Audio File Serving
```http
GET /audio/{filename}
```
Serves generated MP3 audio files for frontend playback.

### Utility Endpoints

#### Configuration Info
```http
GET /api/config
```
Returns server configuration and Vapi AI connection status.

#### Audio Generation (Legacy)
```http
POST /api/audio/generate
```
Alternative endpoint for audio generation (currently placeholder).

#### Cleanup
```http
DELETE /api/cleanup
```
Cleans up temporary files and memory storage.

## 🤖 Vapi AI Integration

### Assistant Creation
The server automatically creates a Vapi AI assistant on startup with:
- **Model**: GPT-3.5 Turbo from OpenAI
- **Voice**: ElevenLabs "Rachel" voice
- **System Prompt**: Helpful, friendly assistant behavior
- **Temperature**: 0.7 for balanced creativity

### Chat Processing
1. User message received via `/api/chat`
2. Message sent to Vapi Chat API
3. AI response extracted from Vapi format
4. Audio generated using Google TTS
5. Response returned with text and audio file

## 🔊 Audio Generation

### Google TTS Integration
- **Primary Method**: Google Translate TTS API
- **Format**: MP3 audio files
- **Language**: English (US)
- **Fallback**: Demo MP3 files if TTS fails
- **Storage**: `public/audio/` directory

### Audio File Management
- Unique timestamps for file names
- Automatic directory creation
- Static file serving via Express
- Multiple fallback mechanisms

## 📁 File Structure

```
server/
├── index.js              # Main server file with comprehensive comments
├── test-api.js           # API testing utilities
├── test-vapi.js          # Vapi AI connectivity tests
├── test-correct-chat.js  # Chat API format validation
├── package.json          # Dependencies and scripts
├── public/
│   └── audio/            # Generated audio files
│       ├── response_*.mp3    # AI voice responses
│       ├── response_text_*.txt # Audio content reference
│       └── fallback_*.mp3    # Backup audio files
└── README.md             # This documentation
```

## 🧪 Testing

### Automated Tests

1. **Test server health**:
   ```bash
   node test-api.js
   ```

2. **Test Vapi AI connectivity**:
   ```bash
   node test-vapi.js
   ```

3. **Test chat format**:
   ```bash
   node test-correct-chat.js
   ```

### Manual Testing

1. **Health check**: `curl http://localhost:5000/api/health`
2. **Chat endpoint**:
   ```bash
   curl -X POST http://localhost:5000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Hello, how are you?"}'
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VAPI_API_KEY` | Vapi AI API key | Demo key | No |
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment | development | No |

### Vapi AI Settings

The assistant is configured with:
```javascript
{
  name: "Conversational AI Assistant",
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM"  // Rachel voice
  }
}
```

## 🔍 Error Handling

### Vapi API Errors
- **400**: Bad request - user-friendly rephrasing suggestion
- **401**: Authentication - API key verification message
- **429**: Rate limiting - wait and retry message
- **500**: Server errors - generic technical difficulty message

### Audio Generation Errors
- **Primary**: Google TTS failure → Demo MP3 creation
- **Secondary**: Demo creation failure → Minimal fallback file
- **Final**: All failures → Error response without audio

### Graceful Degradation
- Server continues without audio if TTS fails
- Fallback responses for API unavailability
- Comprehensive error logging for debugging 