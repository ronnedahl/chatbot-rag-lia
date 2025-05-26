import { Request, Response } from 'express';
import axios from 'axios';
import { ChatRequestBody } from './interfaces.js';
import { getVectorStore } from './vectorStore.js'; 
import { db as adminDb } from '../utils/admin.js'; 

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001/chat';

interface PythonDocumentInput {
  page_content: string;
  metadata: Record<string, any>;
}

interface PythonApiResponse {
  answer: string;
  tool_calls?: Array<{
    name: string;
    args: Record<string, any>;
    id: string;
  }> | null;
}

export const Chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, provider, modelName } = req.body as ChatRequestBody & {
      provider?: 'openai' | 'ollama';
      modelName?: string;
    };

    const userId = (req.headers['user-id'] as string) || req.body.userId;
    let userName = req.body.userName || 'användare';
    let income: number | null = null;

    console.log('Node: Received userId:', userId, typeof userId);
    console.log('Node: Processing question:', question);

    if (userId) {
      try {
        const userProfileRef = adminDb.collection('userProfiles').doc(userId);
        const userProfile = await userProfileRef.get();
        if (userProfile.exists) {
          const userData = userProfile.data();
          console.log('Node: User data from Firestore:', userData);
          if (userData?.name) {
            userName = userData.name;
          }
          if (userData?.monthlyIncome) {
            income = Number(userData.monthlyIncome);
            console.log(`Node: Income from 'monthlyIncome': ${income}`);
          }
        }
      } catch (profileError) {
        console.error('Node: Error fetching user profile:', profileError);
    
      }
    }

    if (!question || question.trim() === '') {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const lowerQuestion = question.toLowerCase().trim();

    if (
      lowerQuestion === 'hej' ||
      lowerQuestion === 'hallå' ||
      lowerQuestion === 'tjena' ||
      lowerQuestion === 'hello' ||
      lowerQuestion === 'hi'
    ) {
      let greeting = `Hej ${userName}! Välkommen till BOSTR-chatboten.`;
      if (income !== null) {
        greeting += ` Din registrerade månadsinkomst är ${income} kr.`;
      }
      greeting += ' Vad kan jag hjälpa dig med?';
      res.json({ answer: greeting });
      return;
    }

    console.log(`Node: Processing question for Python API from ${userName}: "${question}"`);

    let relevantDocsFromFirebase: any[] = [];
    
    try {
      const broadSearchKeywords: string[] = ['förklara', 'beskriv', 'jämför', 'hur fungerar', 'vad är'];
      const isBroadSearch: boolean = broadSearchKeywords.some((word) =>
        question.toLowerCase().includes(word)
      );

      const store = await getVectorStore();
      console.log('Node: Searching for relevant documents in Firebase...');
      
      const retriever = store.asRetriever(isBroadSearch ? 8 : 5);
      relevantDocsFromFirebase = await retriever.getRelevantDocuments(question);
      console.log(`Node: Found ${relevantDocsFromFirebase.length} relevant documents from Firebase.`);
    } catch (vectorStoreError) {
      console.error('Node: Error accessing vector store:', vectorStoreError);
      
      relevantDocsFromFirebase = [];
    }

    const documentsForPython: PythonDocumentInput[] = relevantDocsFromFirebase.map((doc) => ({
      page_content: doc.pageContent,
      metadata: doc.metadata || {},
    }));

    const pythonApiPayload = {
      question: question.trim(),
      documents: documentsForPython,
      user_id: userId,
      user_name: userName,
    };

    console.log(`Node: Calling Python API at ${PYTHON_API_URL} with ${documentsForPython.length} documents.`);

    try {
     
      const pythonApiResponse = await axios.post<PythonApiResponse>(
        PYTHON_API_URL, 
        pythonApiPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, 
          validateStatus: (status) => status < 500, 
        }
      );

      if (pythonApiResponse.status >= 400) {
        console.error('Node: Python API returned error status:', pythonApiResponse.status);
        console.error('Node: Python API error details:', pythonApiResponse.data);
        res.status(pythonApiResponse.status).json({
          error: 'Error from Python API',
          details: pythonApiResponse.data
        });
        return;
      }

      const { answer, tool_calls } = pythonApiResponse.data;

      if (!answer || answer.trim() === '') {
        console.warn('Node: Python API returned empty answer');
        res.json({ 
          answer: 'Jag kunde inte generera ett svar på din fråga. Kan du försöka omformulera den?' 
        });
        return;
      }

      console.log(`Node: Received answer from Python API: "${answer}"`);
      if (tool_calls && tool_calls.length > 0) {
        console.log('Node: Tool calls from Python API:', tool_calls);
      }

      res.json({ answer: answer.trim() });

    } catch (pythonError: any) {
      console.error('Node: Error calling Python API:', pythonError.message);
      
      if (axios.isAxiosError(pythonError)) {
        if (pythonError.code === 'ECONNREFUSED') {
          console.error('Node: Python API not reachable - is it running on port 8001?');
          res.status(503).json({ 
            error: 'Chat service temporarily unavailable. Please try again later.',
            details: 'Python API not reachable'
          });
        } else if (pythonError.code === 'ECONNABORTED') {
          console.error('Node: Python API timeout');
          res.status(504).json({ 
            error: 'Request timed out. Please try again.',
            details: 'Python API timeout'
          });
        } else if (pythonError.response) {
          console.error('Python API Response Status:', pythonError.response.status);
          console.error('Python API Response Data:', pythonError.response.data);
          res.status(pythonError.response.status || 500).json({
            error: 'Failed to get response from chat service',
            details: pythonError.response.data?.error || 'Unknown error from Python API'
          });
        } else {
          console.error('Python API request error:', pythonError.message);
          res.status(500).json({ 
            error: 'Failed to contact chat service',
            details: 'Network error'
          });
        }
      } else {
        console.error('Non-Axios error:', pythonError);
        res.status(500).json({ 
          error: 'An unexpected error occurred',
          details: 'Internal server error'
        });
      }
      return;
    }

  } catch (error: any) {
    console.error('Node: Error in main Chat handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error in chat handler'
    });
  }
};