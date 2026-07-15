import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all bookmarks for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || req.query.userId;
        if (!userId) {
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
router.post('/', async (req, res) => {
    try {
        const { userId, title, query, summary, agentResults, tags } = req.body;
        
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
router.delete('/:id', async (req, res) => {
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
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, tags } = req.body;
        
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
