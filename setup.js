#!/usr/bin/env node

/**
 * CONVERSATIONAL AI BUILDER - AUTOMATED SETUP SCRIPT
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This automated setup script streamlines the development environment setup
 * by handling all dependency installation and configuration tasks in a single
 * command. It ensures consistent setup across different development machines.
 * 
 * SETUP AUTOMATION STRATEGY:
 * - Validates system requirements (Node.js version)
 * - Installs all frontend and backend dependencies
 * - Creates environment configuration templates
 * - Provides clear next-steps guidance for developers
 * - Handles errors gracefully with informative messages
 * 
 * DEVELOPER EXPERIENCE BENEFITS:
 * - One-command setup for the entire project
 * - Automatic environment file creation with templates
 * - Clear validation of system requirements
 * - Comprehensive setup instructions and next steps
 * - Error handling that guides developers to solutions
 * 
 * WORKFLOW INTEGRATION:
 * - Supports CI/CD pipeline setup automation
 * - Enables quick onboarding for new team members
 * - Reduces setup-related support requests
 * - Ensures consistent development environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 Conversational AI Builder - Setup Script');
console.log('==========================================\n');

/**
 * Execute Command with Comprehensive Error Handling
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This utility function executes shell commands with proper error handling
 * and user feedback. It ensures that setup failures are clearly communicated
 * and that the setup process can be debugged effectively.
 * 
 * ERROR HANDLING STRATEGY:
 * - Captures both successful execution and error scenarios
 * - Provides clear feedback about what command is being executed
 * - Returns boolean status for flow control
 * - Preserves colored output for better user experience
 * - Logs detailed error information for troubleshooting
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
 * Create Environment Configuration Template
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This function creates a comprehensive .env template file that guides
 * developers through the API key configuration process. It includes
 * clear instructions and sensible defaults to minimize setup friction.
 * 
 * CONFIGURATION STRATEGY:
 * - Provides template with clear placeholder values
 * - Includes comprehensive setup instructions as comments
 * - Avoids overwriting existing configuration files
 * - Guides users to official API key sources
 * - Sets appropriate default values for development
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
 * Main Setup Function - Complete Development Environment Initialization
 * 
 * PURPOSE AND BUSINESS LOGIC:
 * This is the orchestrator function that coordinates the entire setup process.
 * It implements a comprehensive setup workflow that validates system requirements,
 * installs dependencies, and configures the development environment.
 * 
 * SETUP WORKFLOW:
 * 1. System Validation - Checks Node.js version and project structure
 * 2. Dependency Installation - Installs both frontend and backend packages
 * 3. Environment Configuration - Creates necessary configuration files
 * 4. Success Communication - Provides clear next steps for developers
 * 
 * ERROR HANDLING PHILOSOPHY:
 * - Fails fast with clear error messages
 * - Validates prerequisites before starting installation
 * - Provides specific guidance for common issues
 * - Exits with appropriate status codes for automation
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