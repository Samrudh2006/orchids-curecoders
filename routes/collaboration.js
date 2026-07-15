import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all shared workspaces for a user
router.get('/shared', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || req.query.userId;
        if (!userId) {
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
router.post('/share', async (req, res) => {
    try {
        const { ownerId, sharedWith, permission, query, result } = req.body;
        
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
router.post('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userEmail, content } = req.body;
        
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
router.delete('/share/:id', async (req, res) => {
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
