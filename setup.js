#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 Conversational AI Builder - Setup Script');
console.log('==========================================\n');

/**
 * Execute command and handle errors
 */
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: 'true' }
    });
    return true;
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

/**
 * Check if a directory exists
 */
function directoryExists(dir) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

/**
 * Create .env file template
 */
function createEnvTemplate() {
  const envPath = path.join(__dirname, 'server', '.env');
  
  if (!fs.existsSync(envPath)) {
    const envContent = `# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Instructions:
# 1. Replace 'your-openai-api-key-here' with your actual OpenAI API key
# 2. Get your API key from: https://platform.openai.com/api-keys
# 3. Make sure you have credits in your OpenAI account`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env template file');
  } else {
    console.log('ℹ️  .env file already exists');
  }
}

/**
 * Main setup function
 */
async function setup() {
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].slice(1));
    
    if (majorVersion < 16) {
      console.warn('⚠️  Warning: Node.js version 16 or higher is recommended');
      console.warn(`   Current version: ${nodeVersion}`);
    }

    console.log(`📦 Node.js version: ${nodeVersion}`);
    console.log('');

    // Check if directories exist
    if (!directoryExists('server')) {
      console.error('❌ Server directory not found!');
      process.exit(1);
    }

    if (!directoryExists('client')) {
      console.error('❌ Client directory not found!');
      process.exit(1);
    }

    // Install server dependencies
    console.log('🔧 Installing server dependencies...');
    const serverSuccess = runCommand('npm install', path.join(__dirname, 'server'));
    
    if (!serverSuccess) {
      console.error('❌ Failed to install server dependencies');
      process.exit(1);
    }

    console.log('✅ Server dependencies installed successfully\n');

    // Install client dependencies
    console.log('🔧 Installing client dependencies...');
    const clientSuccess = runCommand('npm install', path.join(__dirname, 'client'));
    
    if (!clientSuccess) {
      console.error('❌ Failed to install client dependencies');
      process.exit(1);
    }

    console.log('✅ Client dependencies installed successfully\n');

    // Create .env template
    console.log('📝 Creating environment configuration...');
    createEnvTemplate();
    console.log('');

    // Success message
    console.log('🎉 Setup completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Configure your OpenAI API key in server/.env');
    console.log('2. Get your API key from: https://platform.openai.com/api-keys');
    console.log('3. Start the backend: cd server && npm run dev');
    console.log('4. Start the frontend: cd client && npm start');
    console.log('');
    console.log('🌐 The application will be available at:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:5000');
    console.log('');
    console.log('📖 For more information, see README.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setup(); 