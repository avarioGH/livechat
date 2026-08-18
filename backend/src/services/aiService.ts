import { OpenAI } from 'openai';
import { prisma } from '../index';
let GoogleGenAI: any;
import('@google/genai').then(mod => {
  GoogleGenAI = mod.GoogleGenAI;
});

// Initialize SDKs
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

export interface AIReplyResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
}

/**
 * Generate a reply using the configured AI provider for a specific Organization.
 */
export const generateAIReply = async (
  organizationId: string,
  conversationHistory: { role: 'user' | 'assistant' | 'system', content: string }[]
): Promise<AIReplyResult> => {
  try {
    // 1. Fetch AI Employee configuration
    const aiEmployee = await prisma.aIEmployee.findFirst({
      where: { organizationId, isActive: true },
      include: {
        knowledgeSources: {
          select: { knowledgeBaseId: true }
        }
      }
    });

    if (!aiEmployee) {
      return {
         content: "Mohon maaf, layanan pelanggan saat ini sedang offline.",
         usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
         provider: 'NONE',
         model: 'NONE'
      };
    }

    // 2. Fetch Knowledge Base for RAG using pgvector similarity search
    let contextString = "";
    if (aiEmployee.knowledgeSources && aiEmployee.knowledgeSources.length > 0) {
       const userLatestQuery = conversationHistory.filter(m => m.role === 'user').pop()?.content || "";
       
       let queryEmbedding: number[] | null = null;
       if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
          try {
             const embedResp = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: userLatestQuery,
                encoding_format: 'float'
             });
             queryEmbedding = embedResp.data[0]?.embedding || null;
          } catch (e) {
             console.error('Failed to embed user query:', e);
          }
       }

       if (queryEmbedding) {
          const vectorStr = `[${queryEmbedding.join(',')}]`;
          const kbIds = aiEmployee.knowledgeSources.map((ks: any) => ks.knowledgeBaseId);
          // 1 - (embedding <=> query) AS similarity (cosine similarity)
          const topChunks = await prisma.$queryRaw<any[]>`
             SELECT c.content, (1 - (c.embedding <=> ${vectorStr}::vector)) AS similarity
             FROM "KnowledgeChunk" c
             JOIN "KnowledgeDocument" d ON c."knowledgeDocumentId" = d.id
             JOIN "KnowledgeSource" s ON d."knowledgeSourceId" = s.id
             WHERE s."knowledgeBaseId" IN (${kbIds.join("','")})
               AND c.embedding IS NOT NULL
             ORDER BY c.embedding <=> ${vectorStr}::vector
             LIMIT 5;
          `;
          contextString = topChunks.map((c: any) => c.content).join("\n\n");
       } else {
          // Fallback: Just get random/latest chunks if no embedding available
          const topChunks = await prisma.knowledgeChunk.findMany({
             where: {
                knowledgeDocument: {
                   knowledgeSource: {
                      knowledgeBaseId: { in: aiEmployee.knowledgeSources.map((k: any) => k.knowledgeBaseId) }
                   }
                }
             },
             take: 5
          });
          contextString = topChunks.map((c: any) => c.content).join("\n\n");
       }
    }
    
    // Inject persona instruction and context as a system prompt
    const systemMessage = {
      role: 'system' as const,
      content: `
        You are ${aiEmployee.name}. 
        ${aiEmployee.systemInstruction || 'You are a helpful customer support agent.'}
        
        KNOWLEDGE BASE CONTEXT (Use this information to answer user queries):
        ${contextString}
        
        If the answer is not in the knowledge base, answer politely and try to assist or say you don't know.
        Always reply in a helpful, professional tone.
      `
    };

    const messages = [systemMessage, ...conversationHistory];

    // 3. Route to the chosen AI Provider
    if (aiEmployee.provider === 'OPENAI') {
      return await callOpenAI(messages, aiEmployee.model);
    } else {
      return await callGemini(messages, aiEmployee.model);
    }
  } catch (error) {
    console.error('Error generating AI reply:', error);
    return {
       content: "Maaf, sistem AI sedang mengalami gangguan saat ini. Mohon tunggu sebentar.",
       usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
       provider: 'ERROR',
       model: 'ERROR'
    };
  }
};

// Helper: Call OpenAI GPT
const callOpenAI = async (messages: any[], model: string): Promise<AIReplyResult> => {
  if (process.env.OPENAI_API_KEY === 'dummy_key' || !process.env.OPENAI_API_KEY) {
    return {
       content: "[OpenAI System]: This is a dummy response. Please configure OPENAI_API_KEY in the .env file.",
       usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
       provider: 'OPENAI',
       model: model || 'gpt-4o-mini'
    };
  }

  const completion = await openai.chat.completions.create({
    messages,
    model: model || 'gpt-4o-mini',
  });

  return {
     content: completion.choices[0]?.message?.content || 'No response from OpenAI.',
     usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
     },
     provider: 'OPENAI',
     model: model || 'gpt-4o-mini'
  };
};

// Helper: Call Google Gemini
const callGemini = async (messages: any[], model: string): Promise<AIReplyResult> => {
  if (process.env.GEMINI_API_KEY === 'dummy_key' || !process.env.GEMINI_API_KEY) {
    return {
       content: "[Gemini System]: This is a dummy response. Please configure GEMINI_API_KEY in the .env file.",
       usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
       provider: 'GEMINI',
       model: model || 'gemini-2.5-flash'
    };
  }

  const systemInstruction = messages.find((m: any) => m.role === 'system')?.content || '';
  const userMessages = messages.filter((m: any) => m.role !== 'system').map((m: any) => m.content).join('\n');
  
  const geminiInstance = initGemini();
  if (!geminiInstance) {
     return {
        content: 'Gemini SDK is initializing, please try again.',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        provider: 'GEMINI',
        model: model || 'gemini-2.5-flash'
     };
  }

  const response = await geminiInstance.models.generateContent({
    model: model || 'gemini-2.5-flash',
    contents: userMessages,
    config: {
      systemInstruction: systemInstruction
    }
  });

  // Note: Old versions of google/genai may structure usage differently.
  // Using optional chaining as best effort.
  return {
     content: response.text || 'No response from Gemini.',
     usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0
     },
     provider: 'GEMINI',
     model: model || 'gemini-2.5-flash'
  };
};

/**
 * Generate a detailed system prompt for an AI employee based on user inputs.
 */
export const generateSystemPrompt = async (name: string, role: string, style: string, provider: string = 'OPENAI', model: string = 'gpt-4o-mini'): Promise<string> => {
  const prompt = `Buatkan instruksi sistem (system prompt) yang detail, profesional, dan komprehensif dalam bahasa Indonesia untuk AI Customer Service bernama ${name} yang bekerja sebagai ${role} dengan gaya komunikasi ${style}. Instruksi ini akan dimasukkan ke dalam konfigurasi LLM. Jangan sertakan pengantar, langsung tuliskan instruksinya saja.`;
  
  try {
    if (provider === 'OPENAI') {
      const resp = await callOpenAI([{ role: 'user', content: prompt }], model);
      return resp.content;
    } else {
      const resp = await callGemini([{ role: 'user', content: prompt }], model);
      return resp.content;
    }
  } catch (error) {
    console.error('Error generating system prompt:', error);
    return `Kamu adalah asisten customer service bernama ${name}. Tugasmu adalah melayani pelanggan dengan peran sebagai ${role}. Bicaralah dengan gaya bahasa ${style}.`;
  }
};
