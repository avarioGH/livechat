import { Router } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { companyName, email, password, name } = req.body;

    if (!companyName || !email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Organization, User, and OrganizationMember
    const organization = await prisma.organization.create({
      data: {
        name: companyName,
        users: {
          create: {
            user: {
              create: {
                email,
                passwordHash,
                name
              }
            },
            isOwner: true
          }
        },
        aiEmployees: {
          create: {
            name: `${companyName} AI Assistant`,
            role: 'Support Agent',
            description: 'Default AI Assistant',
            personality: 'Professional',
            communicationStyle: 'Direct',
            systemInstruction: 'You are a helpful customer support agent.',
            isActive: true,
            model: 'gpt-4o-mini',
            provider: 'OPENAI'
          }
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    });

    const user = organization.users[0]?.user;
    if (!user) throw new Error('User not created');

    const token = jwt.sign(
      { userId: user.id, organizationId: organization.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: organization.id,
        organizationName: organization.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Assuming user belongs to at least one organization
    const defaultMembership = user.memberships[0];
    const organizationId = defaultMembership ? defaultMembership.organizationId : null;
    const organizationName = defaultMembership ? defaultMembership.organization.name : null;

    const token = jwt.sign(
      { userId: user.id, organizationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId,
        organizationName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
