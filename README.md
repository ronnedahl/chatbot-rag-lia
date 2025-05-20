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
