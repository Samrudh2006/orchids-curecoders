import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { parseDocument } from '../services/parserService.js';
import { chunkText } from '../services/chunkService.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const prisma = new PrismaClient();

const uploadDir = os.tmpdir();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'curecoders_super_secret_key_2026');
        } catch (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        const userId = decoded.id; // From server.js token sign
        let workspace = await prisma.workspace.findFirst({ where: { userId } });
        
        if (!workspace) {
            return res.status(400).json({ error: 'No workspace found to attach file' });
        }

        const { path: filePath, originalname: filename, size: sizeBytes, mimetype: filetype } = req.file;

        // 1. Create UploadedFile record
        const uploadedFile = await prisma.uploadedFile.create({
            data: {
                filename,
                filepath: filePath,
                sizeBytes,
                filetype,
                workspaceId: workspace.id
            }
        });

        // 2. Parse text
        const extractedText = await parseDocument(filePath, filetype, filename);

        // 3. Chunk text (500 tokens, 75 overlap)
        const chunks = chunkText(extractedText, 500, 75);

        // 4. Generate Embeddings & Save
        for (const chunk of chunks) {
            const embeddingVector = await generateEmbedding(chunk);
            
            await prisma.documentChunk.create({
                data: {
                    fileId: uploadedFile.id,
                    chunkText: chunk,
                    embedding: JSON.stringify(embeddingVector)
                }
            });
        }

        res.status(201).json({
            message: 'File processed successfully',
            fileId: uploadedFile.id,
            chunksProcessed: chunks.length
        });
    } catch (error) {
        console.error("Upload/Parsing Error:", error);
        res.status(500).json({ error: 'Failed to process document: ' + error.message });
    }
});

export default router;
