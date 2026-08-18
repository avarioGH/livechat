import { Router } from 'express';
import { prisma } from '../index';
import { authenticateJWT } from './conversations';

const router = Router();

// GET: List Organization Members
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: user.organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isActive: true,
            jobTitle: true
          }
        },
        role: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format response to match frontend expectations
    const formattedMembers = members.map(m => ({
      id: m.id,
      name: m.user.name,
      email: m.user.email,
      role: m.isOwner ? 'Owner' : (m.role?.name || 'Agent'),
      status: m.user.isActive ? 'Active' : 'Pending',
      lastActive: 'Baru saja', // Ideally fetched from sessions, hardcoded for now
      avatar: m.user.avatar || (m.user.name ? m.user.name.substring(0, 2).toUpperCase() : '')
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
