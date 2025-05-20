'use client';

import React, { useState,useEffect } from 'react';
import {
  handleFileUpload,
  handleUrlLoad,
  handleTextLoad,
  handleMigration,
  chat,
} from '../../utils/api';
import { DeleteByTag } from './DeleteTags';
import { useAuth } from '../../utils/AuthContext';
import { db } from '../../utils/firebase'; // Adjust path as needed
import { doc, getDoc } from 'firebase/firestore';

export default function RagComponent() {
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [tag, setTag] = useState('');
  const { signOut } = useAuth();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("användare");
  const [provider, setProvider] = useState<'openai' | 'ollama'>('openai');
  const [modelName, setModelName] = useState<string>('gpt-4o');

  const [urlMessage, setUrlMessage] = useState('');
  const [urlStatus, setUrlStatus] = useState<'success' | 'warning' | 'error' | ''>('');

  // Definiera modellalternativ
  const modelOptions = [
    { label: 'OpenAI (GPT-4o)', provider: 'openai', model: 'gpt-4o' },
    { label: 'Mistral (Lokal)', provider: 'ollama', model: 'mistral:latest' },
    { label: 'Llama 2 13B (Lokal)', provider: 'ollama', model: 'llama2:13b' }
  ];

  useEffect(() => {
    async function fetchUserProfile() {
      if (user && user.uid) {
        try {
          const userProfileRef = doc(db, 'userProfiles', user.uid);
          const userProfileSnap = await getDoc(userProfileRef);
          
          if (userProfileSnap.exists()) {
            const profileData = userProfileSnap.data();
            if (profileData && profileData.name) {
              setUserName(profileData.name);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    }
    
    fetchUserProfile();
  }, [user]);
  
  const handleChatClick = async () => {
    try {
      const result = await chat(chatQuestion, userName, user?.uid, provider, modelName);
      setChatAnswer(result.answer);
    } catch (error) {
      console.error('Error chatting:', error);
      setChatAnswer('Error chatting');
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    const option = modelOptions.find(opt => `${opt.provider}-${opt.model}` === selected);
    
    if (option) {
      setProvider(option.provider as 'openai' | 'ollama');
      setModelName(option.model);
    }
  };

  const handleMigrationClick = async () => {
    try {
      const result = await handleMigration();
      setMigrationResult(JSON.stringify(result));
    } catch (error) {
      console.error('Error migrating:', error);
      setMigrationResult('Error migrating');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUploadClick = async () => {
    if (!file) {
      alert('Välj en fil innan du försöker ladda upp!');
      return;
    }
    try {
      let fileType: 'pdf' | 'json';

      if (file.type === 'application/pdf') {
        fileType = 'pdf';
      } else if (
        file.type === 'application/json' ||
        file.name.endsWith('.json')
      ) {
        fileType = 'json';
      } else {
        alert('Only PDF and JSON files are allowed');
        return;
      }

      await handleFileUpload(file, fileType, tag,provider, user?.uid);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(
        `Error uploading file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const handleUrlLoadClick = async () => {
    try {
      setUrlMessage('');
      setUrlStatus('');
      
      console.log(`Skrapar URL med provider: ${provider}`);
      const result = await handleUrlLoad(url, 'url', tag, provider, user?.uid);
      
      if (result.alreadyProcessed) {
        setUrlMessage('Denna URL har redan skrapats och finns i databasen! Ingen ny data lades till.');
        setUrlStatus('warning');
      } else {
        setUrlMessage('URL skrapad och tillagd i databasen!');
        setUrlStatus('success');
      }
    } catch (error) {
      console.error('Error loading URL:', error);
      setUrlMessage('Ett fel inträffade vid skrapning av URL.');
      setUrlStatus('error');
    }
  };

  const handleTextLoadClick = async () => {
    try {
      await handleTextLoad(text, 'text', tag, provider,user?.uid);
      alert('Text loaded successfully!');
    } catch (error) {
      console.error('Error loading text:', error);
      alert('Error loading text.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Beräkna det aktuella värdet för modelldropdown
  const currentModelValue = `${provider}-${modelName}`;

  return (
    <div>
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
        >
          Logga ut
        </button>
      </div>
      
      <div
        style={{
          backgroundImage: 'var(--bostr-logo-url)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          width: '160px',
          height: '80px',
          margin: '0 auto',
          marginTop: '20px',
        }}
      >
        <span className="sr-only">BOSTR Logo</span>
      </div>
      <h1 className="text-1xl font-bold text-center text-white-600 my-4">
        Retrieval-Augmented Generation
      </h1>
      
      <div className="p-6 space-y-4 max-w-lg mx-auto">
        <div className="space-y-2">
          <label className="block text-white font-semibold">Välj AI Modell:</label>
          <select
            value={currentModelValue}
            onChange={handleModelChange}
            className="w-full border rounded-lg p-3 shadow-md focus:outline-none focus:ring focus:ring-blue-200 text-white"
          >
            {modelOptions.map(option => (
              <option 
                key={`${option.provider}-${option.model}`} 
                value={`${option.provider}-${option.model}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-white font-semibold">Modell:</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder={provider === 'openai' ? 'ex: gpt-4o' : 'ex: llama2'}
            className="w-full border rounded-lg p-3 shadow-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
      </div>
      
      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <textarea
          className="w-full h-48 border rounded-lg p-4 shadow-md resize-none focus:outline-none focus:ring focus:ring-white-200"
          value={chatQuestion}
          onChange={(e) => setChatQuestion(e.target.value)}
          placeholder="Skriv in din fråga..."
        />
        <button
          className="bg-[#4C2040] hover:text-[#4C2040] hover:bg-white border-white text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out focus:outline-none border border-white-300 rounded-lg shadow-md p-3"
          onClick={handleChatClick}
        >
          Skicka
        </button>
        {chatAnswer && (
          <div className="mt-4 p-4 rounded-md bg-gray-100">
            <p className="font-semibold text-black">Svar:</p>
            <p className="text-black">{chatAnswer}</p>
          </div>
        )}
      </div>
      <div className="w-full border-b border-[#51D4A0] py-4"></div>

 
      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <h1 className="text-1xl font-extrabold text-center text-white-600 my-8">
          Admin Panel
        </h1>
   
        <h4 className="text-center text-white-600 my-8">
          Ange META tagg för dina dokument
        </h4>
        <input
          type="text"
          className="w-full border rounded-lg p-4 shadow-md focus:outline-none focus:ring focus:ring-blue-200"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="META tagg tex: SKATT2025"
        />
        <div
          style={{
            backgroundImage: 'var(--arrow-logo-url)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            width: '50px',
            height: '85px',
            margin: '0 auto',
            marginTop: '20px',
            color: 'white',
            backgroundColor: '#4C2040',
          }}
        ></div>
        <div className="space-y-4">
          <button
            className="bg-[#4C2040] hover:text-[#4C2040] hover:bg-white border-white text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out focus:outline-none border border-white-300 rounded-lg shadow-md p-3"
            onClick={handleMigrationClick}
          >
            Migrera Vectorstore
          </button>
          {migrationResult && (
            <div className="mt-4 p-4 rounded-md bg-gray-100">
              <p className="font-semibold">Migration Result:</p>
              <p>{migrationResult}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#4C2040] hover:file:bg-blue-100 border border-white-300 rounded-lg shadow-md p-3"
        />
        <button
          className="bg-[#4C2040] hover:text-[#4C2040] hover:bg-white border-white text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out focus:outline-none border border-white-300 rounded-lg shadow-md p-3"
          onClick={handleFileUploadClick}
        >
          Ladda upp fil
        </button>
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <input
          className="w-full border rounded-lg p-4 shadow-md focus:outline-none focus:ring focus:ring-blue-200"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Lägg in URL..."
        />
        <button
          className="bg-[#4C2040] hover:text-[#4C2040] hover:bg-white border-white text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out focus:outline-none border border-white-300 rounded-lg shadow-md p-3"
          onClick={handleUrlLoadClick}
        >
          Skrapa hemsida
        </button>
        
        {urlMessage && (
          <div className={`mt-4 p-4 rounded-md ${
            urlStatus === 'success' ? 'bg-green-100 text-green-800' : 
            urlStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
            urlStatus === 'error' ? 'bg-red-100 text-red-800' : ''
          }`}>
            <p>{urlMessage}</p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <textarea
          className="w-full h-48 border rounded-lg p-4 shadow-md resize-none focus:outline-none focus:ring focus:ring-blue-200"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv text..."
        />
        <button
          className="bg-[#4C2040] hover:text-[#4C2040] hover:bg-white border-white text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out focus:outline-none border border-white-300 rounded-lg shadow-md p-3"
          onClick={handleTextLoadClick}
        >
          Skicka text
        </button>
      </div>
      <div className="w-full border-b border-[#51D4A0] py-4"></div>
      <DeleteByTag />
    </div>
  );
}