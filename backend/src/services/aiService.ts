import { OpenAI } from 'openai';
import { prisma } from '../index';
let GoogleGenAI: any;
import('@google/genai').then(mod => {
  GoogleGenAI = mod.GoogleGenAI;
});

// Initialize SDKs (Make sure to set these in .env later)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

let gemini: any;
const initGemini = () => {
  if (!gemini && GoogleGenAI) {
    gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
    });
  }
  return gemini;
};

/**
 * Generate a reply using the configured AI provider for a specific Tenant.
 */
export const generateAIReply = async (
  tenantId: string,
  conversationHistory: { role: 'user' | 'assistant' | 'system', content: string }[]
): Promise<string> => {
  try {
    // 1. Fetch Tenant's AI Persona configuration
    const persona = await prisma.aIPersona.findFirst({
      where: { tenantId, isActive: true },
    });

    if (!persona) {
      return "Mohon maaf, layanan pelanggan saat ini sedang offline.";
    }

    // 2. Fetch Knowledge Base for RAG (Basic Implementation)
    // In a production app, we would query Pinecone/Weaviate here using vector embeddings of the user's message.
    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: { tenantId },
      take: 5 // Get some general context for now
    });

    let contextString = knowledgeBase.map((kb: any) => kb.content).join('\n\n');
    
    // Inject persona instruction and context as a system prompt
    const systemMessage = {
      role: 'system' as const,
      content: `
        You are ${persona.name}. 
        ${persona.systemPrompt}
        
        KNOWLEDGE BASE CONTEXT (Use this information to answer user queries):
        ${contextString}
        
        If the answer is not in the knowledge base, answer politely and try to assist or say you don't know.
        Always reply in a helpful, professional tone.
      `
    };

    const messages = [systemMessage, ...conversationHistory];

    // 3. Route to the chosen AI Provider
    if (persona.provider === 'OPENAI') {
      return await callOpenAI(messages);
    } else {
      return await callGemini(messages);
    }
  } catch (error) {
    console.error('Error generating AI reply:', error);
    return "Maaf, sistem AI sedang mengalami gangguan saat ini. Mohon tunggu sebentar.";
  }
};

// Helper: Call OpenAI GPT
const callOpenAI = async (messages: any[]): Promise<string> => {
  if (process.env.OPENAI_API_KEY === 'dummy_key' || !process.env.OPENAI_API_KEY) {
    return "[OpenAI System]: This is a dummy response. Please configure OPENAI_API_KEY in the .env file.";
  }

  const completion = await openai.chat.completions.create({
    messages,
    model: 'gpt-4o-mini',
  });

  return completion.choices[0]?.message?.content || 'No response from OpenAI.';
};

// Helper: Call Google Gemini
const callGemini = async (messages: any[]): Promise<string> => {
  if (process.env.GEMINI_API_KEY === 'dummy_key' || !process.env.GEMINI_API_KEY) {
    return "[Gemini System]: This is a dummy response. Please configure GEMINI_API_KEY in the .env file.";
  }

  // Convert messages format for Gemini
  // Gemini GenAI SDK uses slightly different formatting. We'll simplify for the basic text generation.
  // The system instruction can be passed in config.
  const systemInstruction = messages.find((m: any) => m.role === 'system')?.content || '';
  const userMessages = messages.filter((m: any) => m.role !== 'system').map((m: any) => m.content).join('\n');
  
  const geminiInstance = initGemini();
  if (!geminiInstance) return 'Gemini SDK is initializing, please try again.';

  const response = await geminiInstance.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userMessages,
    config: {
      systemInstruction: systemInstruction
    }
  });

  return response.text || 'No response from Gemini.';
};
