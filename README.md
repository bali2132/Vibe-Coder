# 🎤 Conversational AI Builder with Vapi AI

A modern, full-stack conversational AI application that provides both **text and voice responses** using advanced AI technology. Built with React and Node.js, featuring Vapi AI integration for intelligent conversations and Google TTS for high-quality voice synthesis.

## ✨ Features

- 🤖 **Vapi AI Integration**: Powered by Vapi's advanced conversational AI platform
- 🎯 **Smart Conversations**: Real-time AI responses using GPT-3.5 Turbo
- 🎤 **Voice Responses**: Text-to-Speech using Google Translate TTS
- 🔊 **Audio Playback**: Built-in audio player with play/pause controls
- 🎨 **Modern UI**: Clean, responsive interface with real-time status indicators
- 📱 **Mobile Friendly**: Responsive design for all device sizes
- ⚡ **Real-time Monitoring**: Server health checks and connection status
- 🚀 **Local Development**: Runs entirely on localhost with hot reloading

## Project Structure

```
bali/
├── client/          # React frontend
│   ├── src/
│   │   └── App.js   # Main application component
│   └── package.json
├── server/          # Node.js backend
│   ├── index.js     # Express server with Vapi AI integration
│   ├── test-api.js  # API testing script
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Vapi API key (optional for enhanced features)
- OpenAI API key (optional for advanced AI responses)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bali
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Configuration

1. **Create a `.env` file in the server directory**:
   ```env
   # Vapi AI Configuration
   VAPI_API_KEY=your-vapi-api-key-here

   # OpenAI Configuration (optional)
   OPENAI_API_KEY=your-openai-api-key-here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

2. **Note**: The application works without API keys using an intelligent fallback system.

### Running the Application

1. **Start the backend server** (in the server directory):
   ```bash
   cd server
   node index.js
   ```
   
   You should see:
   ```
   🚀 Conversational AI Builder Server running on port 5000
   📁 Audio files directory: C:\bali\server\public\audio
   🔑 Vapi API Key configured: true/false
   🌐 Server ready at http://localhost:5000
   🎤 Powered by Vapi AI - Advanced Voice Technology
   ```

2. **Start the frontend** (in a new terminal, in the client directory):
   ```bash
   cd client
   npm start
   ```
   
   The React app will open at `http://localhost:3000`

## Usage

1. **Enter a prompt**: Type your question or message in the text area
2. **Optional system message**: Customize the AI's behavior
3. **Send**: Click Send or press Enter to generate a response
4. **Listen**: Click the play button to hear the voice response
5. **Clear**: Reset the conversation with the Clear button

### Example Prompts

- "Hello, how are you?"
- "What is my name?"
- "Tell me about the weather"
- "What time is it?"
- "Can you help me?"

## API Endpoints

### Health Check
```http
GET http://localhost:5000/api/health
```

### Generate AI Response
```http
POST http://localhost:5000/api/chat
Content-Type: application/json

{
  "prompt": "Your question here",
  "systemMessage": "Optional system message"
}
```

### Audio Playback
```http
GET http://localhost:5000/audio/{filename}
```

## Testing

Run the API test script:
```bash
cd server
node test-api.js
```

## Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Verify Node.js is installed: `node --version`
- Check for error messages in the console

### No AI responses
- The app works without API keys using fallback responses
- For enhanced features, add valid API keys to `.env`

### Audio won't play
- Check browser console for errors
- Ensure audio files are being created in `server/public/audio/`
- Try refreshing the page

### Connection errors
- Ensure the backend server is running
- Check that frontend proxy is configured (in `client/package.json`)
- Verify CORS settings in the server

## How It Works

1. **Frontend (React)**:
   - Sends user prompts to the backend API
   - Displays text responses and audio controls
   - Handles playback of generated audio files

2. **Backend (Node.js/Express)**:
   - Processes incoming prompts
   - Generates AI responses using:
     - OpenAI API (if configured)
     - Intelligent fallback system (always available)
   - Creates audio files for voice responses
   - Serves audio files for playback

3. **Fallback System**:
   - Recognizes common queries (greetings, time, help, etc.)
   - Provides contextual responses without external APIs
   - Generates simple audio feedback


### Environment Variables

- `VAPI_API_KEY`: Your Vapi AI API key
- `OPENAI_API_KEY`: OpenAI API key for enhanced responses
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- The `.env` file should be in `.gitignore`
- Validate and sanitize user inputs

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server console logs
3. Inspect browser developer console
4. Create an issue in the repository

---

Built with ❤️ using React, Node.js, and Vapi AI Technology 