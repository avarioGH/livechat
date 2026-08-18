import { Router } from 'express';
import { prisma } from '../index';
import { authenticateJWT } from './conversations';

const router = Router();

// GET: List AI Employees
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    const aiEmployees = await prisma.aIEmployee.findMany({
      where: { organizationId: user.organizationId },
      include: {
         knowledgeSources: {
            include: { knowledgeBase: true }
         }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(aiEmployees);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Create AI Employee
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, role, description, personality, communicationStyle, systemInstruction, provider, model } = req.body;
    
    const newAI = await prisma.aIEmployee.create({
      data: {
        organizationId: user.organizationId,
        name,
        role: role || 'Support Agent',
        description,
        personality: personality || 'Professional',
        communicationStyle: communicationStyle || 'Direct',
        systemInstruction: systemInstruction || '',
        provider: provider || 'OPENAI',
        model: model || 'gpt-4o-mini'
      }
    });
    res.status(201).json(newAI);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Connect AI Employee to Knowledge Base
router.put('/:id/train', authenticateJWT, async (req, res): Promise<any> => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const { knowledgeBaseId } = req.body;
    
    // Verify AI Employee ownership
    const aiEmployee = await prisma.aIEmployee.findUnique({ where: { id } });
    if (!aiEmployee || aiEmployee.organizationId !== user.organizationId) {
      return res.status(404).json({ error: 'AI Employee not found' });
    }
    
    // Upsert connection
    await prisma.aIEmployeeKnowledge.upsert({
       where: {
          aiEmployeeId_knowledgeBaseId: {
             aiEmployeeId: id,
             knowledgeBaseId
          }
       },
       update: {},
       create: {
          aiEmployeeId: id,
          knowledgeBaseId
       }
    });
    
    res.json({ message: 'Training data attached successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Generate System Prompt
router.post('/generate-prompt', authenticateJWT, async (req, res) => {
  try {
    const { name, role, style, provider, model } = req.body;
    
    // Import generateSystemPrompt dynamically or at top.
    // For now, let's import it inline to avoid circular dependencies if any,
    // or just import at the top. Let's assume it's imported at the top.
    const { generateSystemPrompt } = await import('../services/aiService');
    
    const prompt = await generateSystemPrompt(name || 'AI', role || 'Assistant', style || 'Professional', provider, model);
    res.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
