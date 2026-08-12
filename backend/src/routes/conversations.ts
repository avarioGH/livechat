import { Router, Request, Response, RequestHandler } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';

// Middleware to authenticate JWT
export const authenticateJWT: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      (req as any).user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Get all conversations for the organization
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    const conversations = await prisma.conversation.findMany({
      where: { organizationId: user.organizationId },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        aiEmployee: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
