import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = new Hono();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'curecoders_super_secret_key_2026';

router.get('/', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const authHeader = c.req.header('authorization');
        const token = authHeader && authHeader.split(' ')[1];
        
        let userId = null;
        if (token) {
            try {
                const user = jwt.verify(token, JWT_SECRET);
                userId = user.id;
            } catch (err) {
                // Invalid token
            }
        }
        
        if (!userId) {
            const guestUser = await prisma.user.findUnique({ where: { email: 'guest@curecoders.com' } });
            if (guestUser) {
                userId = guestUser.id;
            } else {
                return res.json([]);
            }
        }

        const workspace = await prisma.workspace.findFirst({
            where: { userId: userId },
            orderBy: { createdAt: 'asc' }
        });

        if (!workspace) return res.json([]);

        const queries = await prisma.searchQuery.findMany({
            where: { workspaceId: workspace.id },
            orderBy: { createdAt: 'desc' },
            include: { results: true }
        });

        res.json(queries);
    } catch (error) {
        console.error("Failed to fetch history:", error);
        res.status(500).json({ error: 'Failed to fetch search history' });
    }
});

export default router;
