import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const router = new Hono();
const prisma = new PrismaClient();

// Get all bookmarks for a user
router.get('/', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const userId = c.req.header('x-user-id') || c.req.query('userId;
')        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
        }

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(bookmarks);
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new bookmark
router.post('/', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const {  userId, title, query, summary, agentResults, tags  } = await c.req.json();
        
        if (!userId || !query) {
            return res.status(400).json({ error: 'userId and query are required' });
        }

        const bookmark = await prisma.bookmark.create({
            data: {
                userId,
                title: title || 'Untitled Research',
                query,
                summary: summary || '',
                agentResults: typeof agentResults === 'string' ? agentResults : JSON.stringify(agentResults || {}),
                tags: typeof tags === 'string' ? tags : JSON.stringify(tags || [])
            }
        });

        res.status(201).json(bookmark);
    } catch (error) {
        console.error("Error creating bookmark:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a bookmark
router.delete('/:id', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const { id } = req.params;
        await prisma.bookmark.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting bookmark:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a bookmark
router.patch('/:id', async (c) => {
    const req = c.req.raw;
    const res = { json: (data, status=200) => c.json(data, status), status: (s) => ({ json: (d) => c.json(d, s), send: (d) => c.text(d, s) }) };
    try {
        const { id } = req.params;
        const {  title, tags  } = await c.req.json();
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (tags !== undefined) updateData.tags = typeof tags === 'string' ? tags : JSON.stringify(tags);

        const bookmark = await prisma.bookmark.update({
            where: { id },
            data: updateData
        });

        res.json(bookmark);
    } catch (error) {
        console.error("Error updating bookmark:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
