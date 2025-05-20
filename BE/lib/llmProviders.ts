import { OpenAI } from 'openai';
import axios from 'axios';

export interface LLMProvider {
  generateResponse(prompt: string): Promise<string>;
  embedText(text: string): Promise<number[]>;
  embedTexts(texts: string[]): Promise<number[][]>;
  modelName: string;
}

// Interface för modellkonfiguration
export interface ModelConfig {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI;
  public modelName: string;
  private embeddingModel: string;
  private config: ModelConfig;

  constructor(
    apiKey: string, 
    modelName = 'gpt-4o', 
    embeddingModel = 'text-embedding-3-small',
    config: ModelConfig = {}
  ) {
    this.openai = new OpenAI({ apiKey });
    this.modelName = modelName;
    this.embeddingModel = embeddingModel;
    // Standardvärden med möjlighet att åsidosätta
    this.config = {
      temperature: 0.1,
      topP: 1,
      maxTokens: 2048,
      ...config
    };
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature,
        top_p: this.config.topP,
        max_tokens: this.config.maxTokens,
        presence_penalty: this.config.presencePenalty,
        frequency_penalty: this.config.frequencyPenalty
      });
      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating response from OpenAI:', error);
      throw error;
    }
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error embedding text with OpenAI:', error);
      throw error;
    }
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: texts,
      });
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error embedding texts with OpenAI:', error);
      throw error;
    }
  }
}

export class OllamaProvider implements LLMProvider {
  private baseUrl: string;
  public modelName: string;
  private embeddingModel: string;
  private config: ModelConfig;

  constructor(
    baseUrl = 'http://localhost:11434', 
    modelName = 'mistral:latest', 
    embeddingModel = 'mistral:latest',
    config: ModelConfig = {}
  ) {
    this.baseUrl = baseUrl;
    this.modelName = modelName;
    this.embeddingModel = embeddingModel;
    // Standardvärden med möjlighet att åsidosätta
    this.config = {
      temperature: 0.1,  // Lägre temperatur för Mistral ger mer deterministiska svar
      topP: 0.9,
      maxTokens: 2048,
      ...config
    };
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      // Förbättrad Ollama API-integrering med stöd för fler parametrar
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: this.config.temperature,
          top_p: this.config.topP,
          num_predict: this.config.maxTokens,
        }
      });
      return response.data.response;
    } catch (error) {
      console.error('Error generating response from Ollama:', error);
      throw error;
    }
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model: this.embeddingModel,
        prompt: text,
      });
      return response.data.embedding;
    } catch (error) {
      console.error('Error embedding text with Ollama:', error);
      throw error;
    }
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await this.embedText(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }
}

// Förbättrad factory function med stöd för modellkonfiguration
export function createLLMProvider(
  provider: 'openai' | 'ollama' = 'openai',
  modelName?: string,
  config?: ModelConfig
): LLMProvider {
  // Anpassad konfiguration baserad på modell
  let modelConfig: ModelConfig = { ...config };
  
  // Specialkonfigurationer för specifika modeller
  if (provider === 'ollama' && modelName?.includes('mistral')) {
    // Mistral fungerar bättre med låg temperatur
    modelConfig = {
      temperature: 0.05,  // Mycket låg temperatur för Mistral
      topP: 0.85,
      ...config
    };
  }
  
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(
        process.env.OPENAI_API_KEY!,
        modelName || 'gpt-4o',
        'text-embedding-3-small',
        modelConfig
      );
    
    case 'ollama':
      return new OllamaProvider(
        process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        modelName || 'mistral:latest',
        'mistral:latest',
        modelConfig
      );
    
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function createEmbeddings(provider: LLMProvider) {
  return {
    embedDocuments: (texts: string[]) => provider.embedTexts(texts),
    embedQuery: (text: string) => provider.embedText(text),
    modelName: provider.modelName,
  };
}