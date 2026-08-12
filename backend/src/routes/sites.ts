import { Router } from 'express';
import { prisma } from '../index';
import { authenticateJWT } from './conversations';

const router = Router();

// GET: List Sites for the organization
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    const sites = await prisma.site.findMany({
      where: { organizationId: user.organizationId },
      include: { widgetConfig: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Create Site and default WidgetConfig
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, domain } = req.body;
    
    if (!name || !domain) {
      return res.status(400).json({ error: 'Name and domain are required' });
    }

    const site = await prisma.site.create({
      data: {
        organizationId: user.organizationId,
        name,
        domain,
        widgetConfig: {
          create: {} // uses default values defined in schema
        }
      },
      include: { widgetConfig: true }
    });
    
    res.status(201).json(site);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Update WidgetConfig
router.put('/:id/widget-config', authenticateJWT, async (req, res): Promise<any> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const site = await prisma.site.findUnique({ where: { id } });
    if (!site || site.organizationId !== user.organizationId) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    const { primaryColor, title, welcomeMessage } = req.body;
    
    const updatedConfig = await prisma.widgetConfig.update({
      where: { siteId: id },
      data: { primaryColor, title, welcomeMessage }
    });
    
    res.json(updatedConfig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET PUBLIC: Get WidgetConfig by publicKey or siteId
router.get('/:publicKey/widget-config', async (req, res): Promise<any> => {
  try {
    const { publicKey } = req.params;
    
    const site = await prisma.site.findFirst({
      where: { 
        OR: [
          { id: publicKey },
          { publicKey: publicKey }
        ]
      },
      include: { widgetConfig: true, organization: { select: { id: true, name: true } } }
    });
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json({
      siteId: site.id,
      organizationId: site.organization.id,
      organizationName: site.organization.name,
      config: site.widgetConfig
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
