BOSTR-RAGBOT

A powerful chatbot leveraging OpenAI and Firebase to provide intelligent information retrieval and storage using a vector database. It features a complete Content Management System (CMS) within an admin panel for seamless management of your knowledge base.
Key Features

    Intelligent Chat
    Interact with a chatbot powered by OpenAI for insightful answers.

    Vector Database
    Utilizes vector embeddings for efficient and semantic information retrieval.

    Firebase Integration
    Leverages Firebase for robust data storage and real-time capabilities.

    Comprehensive CMS (Admin Panel)
    Easy management of information, including:

        Storing new data

        Deleting existing entries

        Retrieving and reviewing information

    Flexible Uploads
    Accepts various data formats:

        PDF documents (.pdf)

        JSON files (.json)

        Web URLs (Scraping)

        Plain text

🚀 Setup

Follow these steps to get the BOSTR-RAGBOT up and running on your local machine.

    Navigate to the project root:

cd BOSTR-RAGBOT

Install dependencies
Run the following commands in both the backend (BE) and frontend (FE) directories:

    cd be
    npm install
    cd ../fe
    npm install

    Configure Environment Variables

        OpenAI API:
        Get your API key from OpenAI

        Firebase:
        Create an account and obtain your API keys from Firebase

        Add your keys to the .env.example file in BE and FE directories.

        Rename .env.example to .env in both BE and FE directories.
    Configure Firebase Admin Access (Backend):

        Create a new Firebase project with Cloud Firestore (or use an existing one).

        Get your Firebase project configuration from the Firebase Console:
        Go to your project → Project settings (gear icon) → Service accounts → Generate new private key → Firebase SDK snippet.
        Copy the config object and paste it into adminConfig.example or import the .json file and change its name to adminConfig.json.

        Rename adminConfig.example to adminConfig.json and add your Firebase keys.

Handling Your Private Firebase Key (Alternative Method)

⚠️ **You can also set up your private Firebase key like this:**

    Download your private key
    Go to Firebase Console → Project Settings → Service Accounts → Generate new private key.
    This will download a .json file to your computer.

    Create a config folder
    In your backend root (BE), create a folder called config.

    Move your .json file
    Move (or copy) the downloaded .json file into the config folder.

    Update the path in your code
    Open the following files and update the path to your JSON file:

        BE/utils/admin.js

const { join } = require('path');
// Change the filename after 'config/' to your actual file name
const serviceAccountPath = join(__dirname, '../config/your-filename.json');

BE/utils/delete-collection.js

        const { join } = require('path');
        // Change the filename after 'config/' to your actual file name
        const serviceAccountPath = join(__dirname, '../config/your-filename.json');

    Tip:
    Replace your-filename.json with the actual name of your downloaded JSON file, e.g., bostr-chatbot-firebase-adminsdk-xxxxxx.json.

🔑 Firebase Authentication Setup

To use authentication features in this project, you must enable Firebase Authentication in your Firebase Console and create at least one user account.
1. Enable Authentication in Firebase

    Go to the Firebase Console.

    Select your project.

    In the left sidebar, click on "Authentication".

    Click on "Get started" if you haven’t already enabled Authentication.

    Go to the "Sign-in method" tab.

    Enable "Email/Password" authentication:

        Click on "Email/Password".

        Click the "Enable" toggle.

        Click "Save".

2. Add a User

To test your application, you need at least one user registered:

    While still in the Authentication section, go to the "Users" tab.

    Click "Add user".

    Enter an email address and a password for your new user.

    Click "Add user" to create the account.

🏃 Running the Application

You have several options to start the BOSTR-RAGBOT:
🌐 Run Frontend and Backend Simultaneously (Local Development)

    Navigate to the project root:

cd BOSTR-RAGBOT

Start both servers with a single command:

    cd fe
    npm run start:all

        Note: Ensure your fe/package.json has a start:all script that starts both frontend and backend. You may need to adjust this command based on your setup.

⚙️ Run Backend Only

    Navigate to the backend directory:

cd BOSTR-RAGBOT/be

Start the backend server:

    npm run start:backend

🎨 Run Frontend Only

    Navigate to the frontend directory:

cd BOSTR-RAGBOT/fe

Start the frontend development server:

npm run start:frontend

🦙 Ollama Setup (Mistral and Llama 2 13B Support)

If you want to use Ollama Mistral or Ollama Llama 2 13B with this project, you need to install Ollama and download the required models.
1. Install Ollama

If you have never installed Ollama before:

    Go to the Ollama website and download the installer for your operating system (Windows, macOS, or Linux).

    Follow the installation instructions on the site to set up Ollama.

Alternatively, for Mac you can use Homebrew:

brew install ollama

For Linux (Ubuntu/Debian):

curl -fsSL https://ollama.com/install.sh | sh

For Windows:
Just use the Windows installer and follow the prompts.

After installing, make sure the Ollama server is running:

ollama serve

2. Download the Required Models

You need to download the models you want to use:

    mistral:latest

    llama2:13b

Open a terminal and run the following commands:

ollama pull mistral:latest
ollama pull llama2:13b

Wait for the downloads to complete.

    Note: The models can be large and may take a while to download depending on your internet speed.

3. Using the Models

Once downloaded, Ollama will automatically make these models available for your application.
If you encounter issues or need to switch models, check Ollama's documentation or restart the Ollama server.
