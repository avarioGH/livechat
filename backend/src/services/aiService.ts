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

/**
 * Generate a reply using the configured AI provider for a specific Organization.
 */
export const generateAIReply = async (
  organizationId: string,
  conversationHistory: { role: 'user' | 'assistant' | 'system', content: string }[]
): Promise<string> => {
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
      return "Mohon maaf, layanan pelanggan saat ini sedang offline.";
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
             queryEmbedding = embedResp.data[0].embedding;
          } catch (e) {
             console.error('Failed to embed user query:', e);
          }
       }

       if (queryEmbedding) {
          const vectorStr = `[${queryEmbedding.join(',')}]`;
          const kbIds = aiEmployee.knowledgeSources.map(ks => ks.knowledgeBaseId);
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
          contextString = topChunks.map(c => c.content).join("\n\n");
       } else {
          // Fallback: Just get random/latest chunks if no embedding available
          const topChunks = await prisma.knowledgeChunk.findMany({
             where: {
                knowledgeDocument: {
                   knowledgeSource: {
                      knowledgeBaseId: { in: aiEmployee.knowledgeSources.map(k => k.knowledgeBaseId) }
                   }
                }
             },
             take: 5
          });
          contextString = topChunks.map(c => c.content).join("\n\n");
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
    return "Maaf, sistem AI sedang mengalami gangguan saat ini. Mohon tunggu sebentar.";
  }
};

// Helper: Call OpenAI GPT
const callOpenAI = async (messages: any[], model: string): Promise<string> => {
  if (process.env.OPENAI_API_KEY === 'dummy_key' || !process.env.OPENAI_API_KEY) {
    return "[OpenAI System]: This is a dummy response. Please configure OPENAI_API_KEY in the .env file.";
  }

  const completion = await openai.chat.completions.create({
    messages,
    model: model || 'gpt-4o-mini',
  });

  return completion.choices[0]?.message?.content || 'No response from OpenAI.';
};

// Helper: Call Google Gemini
const callGemini = async (messages: any[], model: string): Promise<string> => {
  if (process.env.GEMINI_API_KEY === 'dummy_key' || !process.env.GEMINI_API_KEY) {
    return "[Gemini System]: This is a dummy response. Please configure GEMINI_API_KEY in the .env file.";
  }

  const systemInstruction = messages.find((m: any) => m.role === 'system')?.content || '';
  const userMessages = messages.filter((m: any) => m.role !== 'system').map((m: any) => m.content).join('\n');
  
  const geminiInstance = initGemini();
  if (!geminiInstance) return 'Gemini SDK is initializing, please try again.';

  const response = await geminiInstance.models.generateContent({
    model: model || 'gemini-2.5-flash',
    contents: userMessages,
    config: {
      systemInstruction: systemInstruction
    }
  });

  return response.text || 'No response from Gemini.';
};
