import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Basic login route (will be expanded with JWT later)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, generate JWT here
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant?.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basic register route (for Tenant and Admin User)
router.post('/register', async (req, res) => {
  try {
    const { companyName, email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create Tenant and Admin User
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        users: {
          create: {
            email,
            password, // NOTE: Use bcrypt to hash password in production
            name,
            role: 'ADMIN'
          }
        },
        aiPersonas: {
          create: {
            name: `${companyName} AI Assistant`
          }
        }
      },
      include: {
        users: true
      }
    });

    res.status(201).json({ message: 'Registration successful', tenant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
