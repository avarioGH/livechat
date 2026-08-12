import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateJWT } from './conversations';
import { OpenAI } from 'openai';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Helper to split text into chunks (very basic chunking for MVP)
const chunkText = (text: string, maxChars = 1000) => {
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split(/(?<=[.?!])\s+/);
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChars) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    } else {
      currentChunk += sentence + ' ';
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

// GET: List Knowledge Bases
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    const kbs = await prisma.knowledgeBase.findMany({
      where: { organizationId: user.organizationId },
      include: {
         sources: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(kbs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Create Knowledge Base
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, description } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const kb = await prisma.knowledgeBase.create({
      data: {
        organizationId: user.organizationId,
        name,
        description
      }
    });
    res.status(201).json(kb);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Add raw text source to KB and generate embeddings
router.post('/:kbId/text', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { kbId } = req.params;
    const { title, textContent } = req.body;
    
    if (!title || !textContent) return res.status(400).json({ error: 'Title and textContent are required' });

    // Verify KB belongs to Org
    const kb = await prisma.knowledgeBase.findUnique({ where: { id: kbId } });
    if (!kb || kb.organizationId !== user.organizationId) {
      return res.status(404).json({ error: 'Knowledge Base not found' });
    }

    // 1. Create Source & Document
    const source = await prisma.knowledgeSource.create({
      data: {
        knowledgeBaseId: kbId,
        type: 'TEXT',
        name: title,
        status: 'PROCESSING',
        documents: {
          create: {
            title,
            content: textContent
          }
        }
      },
      include: { documents: true }
    });

    const documentId = source.documents[0].id;
    
    // 2. Chunk text
    const chunks = chunkText(textContent);
    
    // 3. Generate embeddings & Save chunks
    let successfulChunks = 0;
    
    for (const chunkText of chunks) {
      if (!chunkText) continue;
      
      let embeddingVec = null;
      try {
         if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
            const embedResp = await openai.embeddings.create({
               model: 'text-embedding-3-small',
               input: chunkText,
               encoding_format: 'float'
            });
            embeddingVec = embedResp.data[0].embedding;
         }
      } catch (embedError) {
         console.error('Embedding error for chunk:', embedError);
         // Continue without embedding for this chunk in fallback mode
      }

      // We use raw SQL to insert the vector because of Prisma's limited native insert for Unsupported("vector")
      if (embeddingVec) {
          const vectorStr = `[${embeddingVec.join(',')}]`;
          await prisma.$executeRaw`
            INSERT INTO "KnowledgeChunk" ("id", "knowledgeDocumentId", "content", "embedding", "createdAt")
            VALUES (gen_random_uuid(), ${documentId}::uuid, ${chunkText}, ${vectorStr}::vector, now())
          `;
      } else {
          await prisma.knowledgeChunk.create({
             data: {
                knowledgeDocumentId: documentId,
                content: chunkText
             }
          });
      }
      successfulChunks++;
    }

    // Update status to READY
    await prisma.knowledgeSource.update({
      where: { id: source.id },
      data: { status: 'READY' }
    });

    res.status(201).json({ message: 'Source processed successfully', chunksCreated: successfulChunks });
  } catch (error) {
    console.error('Error adding text to KB:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
