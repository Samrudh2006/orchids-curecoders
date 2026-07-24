import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const router = new Hono();
const prisma = new PrismaClient();

// Get all shared workspaces for a user
router.get('/shared', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const userId = c.req.header('x-user-id') || c.req.query('userId;
')        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
        }

        const shared = await prisma.sharedWorkspace.findMany({
            where: { ownerId: userId }, // Note: In a real app we'd also search where sharedWith contains user email
            orderBy: { createdAt: 'desc' },
            include: { comments: true }
        });

        res.json(shared);
    } catch (error) {
        console.error("Error fetching shared workspaces:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Share a workspace/query
router.post('/share', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const {  ownerId, sharedWith, permission, query, result  } = await c.req.json();
        
        if (!ownerId || !query) {
            return res.status(400).json({ error: 'ownerId and query are required' });
        }

        const sharedWorkspace = await prisma.sharedWorkspace.create({
            data: {
                ownerId,
                sharedWith: typeof sharedWith === 'string' ? sharedWith : JSON.stringify(sharedWith || []),
                permission: permission || 'Viewer',
                query,
                result: typeof result === 'string' ? result : JSON.stringify(result || {})
            }
        });

        res.status(201).json(sharedWorkspace);
    } catch (error) {
        console.error("Error creating shared workspace:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a comment to a shared workspace
router.post('/:id/comments', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const { id } = req.params;
        const {  userId, userEmail, content  } = await c.req.json();
        
        if (!userId || !content) {
            return res.status(400).json({ error: 'userId and content are required' });
        }

        const comment = await prisma.comment.create({
            data: {
                sharedWorkspaceId: id,
                userId,
                userEmail: userEmail || 'unknown@example.com',
                content
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a shared workspace
router.delete('/share/:id', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const { id } = req.params;
        await prisma.sharedWorkspace.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting shared workspace:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
