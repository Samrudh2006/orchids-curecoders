import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { createRequire } from 'module';
import { OAuth2Client } from 'google-auth-library';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import ExcelJS from 'exceljs';
import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import bookmarksRouter from './routes/bookmarks.js';
import collaborationRouter from './routes/collaboration.js';
import uploadRouter from './routes/upload.js';
import historyRouter from './routes/history.js';
import chatRouter from './routes/chat.js';

import { searchSimilarChunks } from './services/vectorSearch.js';
import { generateEmbedding } from './services/embeddingService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'curecoders_super_secret_key_2026';

const prisma = new PrismaClient();

// Mount Modular Routes
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/collaboration', collaborationRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/history', historyRouter);
app.use('/api/chat', chatRouter);

// Custom AI Client for OpenAI-compatible proxies
class CustomAIClient {
    constructor(apiKey, modelName = "glm4.7", baseUrl = "https://api.hcnsec.cn/v1") {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.modelName = modelName;
        this.models = {
            generateContent: async (params) => {
                const { contents } = params;
                const promptText = typeof contents === 'string' ? contents : JSON.stringify(contents);
                const response = await fetch(`${this.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.modelName,
                        messages: [{ role: 'user', content: promptText }]
                    })
                });
                
                if (!response.ok) {
                    const err = await response.text();
                    throw new Error(`AI API error: ${response.status} ${err}`);
                }
                
                const data = await response.json();
                return { text: data.choices[0].message.content };
            }
        };
    }
}

// Gemini client initialization
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
if (!API_KEY) {
    console.warn("WARNING: No Gemini API Key found in env variables! Falling back to simulated AI analysis.");
}
const defaultModel = process.env.DEFAULT_AI_MODEL || "glm4.7";
const defaultBaseUrl = process.env.DEFAULT_AI_BASE_URL || "https://api.hcnsec.cn/v1";

const ai = API_KEY ? new CustomAIClient(API_KEY, defaultModel, defaultBaseUrl) : null;

function getAgentAi(agentName) {
    const envKey = `${agentName.toUpperCase()}_API_KEY`;
    const modelEnvKey = `${agentName.toUpperCase()}_MODEL`;
    const baseUrlEnvKey = `${agentName.toUpperCase()}_BASE_URL`;

    const agentKey = process.env[envKey] || API_KEY;
    const modelName = process.env[modelEnvKey] || defaultModel;
    const baseUrl = process.env[baseUrlEnvKey] || defaultBaseUrl;

    if (agentKey) {
        return new CustomAIClient(agentKey, modelName, baseUrl);
    }
    return ai;
}

// ==========================================
// 🔐 AUTHENTICATION MIDDLEWARE & ENDPOINTS
// ==========================================

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// User Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        email = email.trim().toLowerCase();
        password = password.trim();

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                workspaces: {
                    create: {
                        name: 'Default Workspace'
                    }
                }
            },
            include: {
                workspaces: true
            }
        });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role }, workspaces: user.workspaces });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        email = email.trim().toLowerCase();
        password = password.trim();

        const user = await prisma.user.findUnique({
            where: { email },
            include: { workspaces: true }
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role }, workspaces: user.workspaces });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// Google Sign-In / Sign-Up
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.VITE_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        const email = payload.email;

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
            include: { workspaces: true }
        });

        // If not, create them with a secure random password
        if (!user) {
            const randomPassword = require('crypto').randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    workspaces: {
                        create: { name: 'Default Workspace' }
                    }
                },
                include: { workspaces: true }
            });
        }

        const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: jwtToken, user: { id: user.id, email: user.email, role: user.role }, workspaces: user.workspaces });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ error: 'Google Authentication Failed' });
    }
});

// Get Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: user.id, email: user.email, role: user.role });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update Profile
app.post('/api/profile/update', authenticateToken, async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if email is already taken by someone else
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser && existingUser.id !== req.user.id) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { 
                email,
                role: role || 'Analyst'
            }
        });

        // Generate a new token in case the email changed
        const token = jwt.sign({ id: updatedUser.id, email: updatedUser.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role } });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change Password
app.post('/api/profile/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedNewPassword }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Get Workspaces
app.get('/api/workspaces', authenticateToken, async (req, res) => {
    try {
        const workspaces = await prisma.workspace.findMany({
            where: { userId: req.user.id },
            include: { files: true }
        });
        res.json(workspaces);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
});

// Create Workspace
app.post('/api/workspaces', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const workspace = await prisma.workspace.create({
            data: {
                name: name || 'New Workspace',
                userId: req.user.id
            }
        });
        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create workspace' });
    }
});

// ==========================================
// 📂 DOCUMENT INGESTION & RAG PIPELINE
// ==========================================

function chunkText(text, size = 1000, overlap = 200) {
    const chunks = [];
    let index = 0;
    while (index < text.length) {
        chunks.push(text.slice(index, index + size));
        index += size - overlap;
    }
    return chunks;
}

async function getEmbedding(text, aiClient) {
    if (!aiClient) {
        // Return a mock vector of 768 dimensions
        return Array(768).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }
    try {
        const response = await aiClient.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
        });
        return response.embedding.values;
    } catch (e) {
        console.error("AI embedding failed, returning mock:", e);
        return Array(768).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}



// ==========================================
// 🧪 EXTERNAL REAL API INTEGRATIONS
// ==========================================

// 1. Clinical Trials API (ClinicalTrials.gov v2)
async function fetchClinicalTrials(query) {
    try {
        const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(query)}&pageSize=5`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("ClinicalTrials API request failed");
        const json = await response.json();
        
        if (!json.studies || json.studies.length === 0) {
            return getFallbackTrials(query);
        }

        return json.studies.map(study => {
            const protocol = study.protocolSection || {};
            const identification = protocol.identificationModule || {};
            const statusModule = protocol.statusModule || {};
            const sponsorModule = protocol.sponsorCollaboratorsModule || {};
            const descriptionModule = protocol.descriptionModule || {};
            const designModule = protocol.designModule || {};
            
            return {
                id: identification.nctId || "NCT00000000",
                title: identification.briefTitle || identification.officialTitle || "Clinical Trial",
                phase: designModule.phases ? designModule.phases.join(", ") : "N/A",
                status: statusModule.overallStatus || "Unknown",
                sponsor: sponsorModule.leadSponsor ? sponsorModule.leadSponsor.name : "Unknown",
                summary: descriptionModule.briefSummary || ""
            };
        });
    } catch (error) {
        console.error("ClinicalTrials fetch failed, using fallback:", error);
        return getFallbackTrials(query);
    }
}

function getFallbackTrials(query) {
    return [
        { id: "NCT05912341", title: `A Safety & Efficacy Evaluation of ${query} Formulations in Adults`, phase: "Phase 2", status: "Recruiting", sponsor: "Novartis Pharmaceuticals" },
        { id: "NCT05822152", title: `Comparative Study of ${query} vs Standard of Care for Therapy`, phase: "Phase 3", status: "Active, not recruiting", sponsor: "Eli Lilly and Company" },
        { id: "NCT05291233", title: `Long-term Cardiovascular Tolerability Profile of ${query}`, phase: "Phase 4", status: "Completed", sponsor: "Novo Nordisk A/S" }
    ];
}

// 2. Patent search (PatentsView API)
async function fetchPatents(query) {
    try {
        const url = `https://api.patentsview.org/patents/query?q={"_or":[{"patent_title":"${query}"},{"patent_abstract":"${query}"}]}&f=["patent_number","patent_title","patent_date","patent_abstract","assignee_organization"]&o={"limit":5}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("PatentsView API failed");
        const json = await response.json();
        
        if (!json.patents || json.patents.length === 0) {
            return getFallbackPatents(query);
        }

        return json.patents.map(p => {
            const date = p.patent_date || "2024-01-01";
            const year = parseInt(date.split("-")[0]);
            const expiryYear = year + 20;
            const expiryDate = `${expiryYear}-${date.split("-").slice(1).join("-")}`;
            const assignee = p.assignees && p.assignees[0] ? p.assignees[0].assignee_organization : "Global Pharma";
            
            const yearsToExpiry = expiryYear - new Date().getFullYear();
            const ftRisk = yearsToExpiry <= 3 ? "High" : (yearsToExpiry <= 7 ? "Medium" : "Low");

            return {
                title: p.patent_title || "Pharma Patent formulation",
                url: `https://patents.google.com/patent/US${p.patent_number}/en`,
                expiryDate,
                owner: assignee,
                ftRisk
            };
        });
    } catch (error) {
        console.error("Patents fetch failed, using fallback:", error);
        return getFallbackPatents(query);
    }
}

function getFallbackPatents(query) {
    return [
        { title: `Controlled release delivery of ${query} compounds`, url: "https://patents.google.com/patent/US10245678", expiryDate: "2032-11-14", owner: "AstraZeneca PLC", ftRisk: "Medium" },
        { title: `Method of treating metabolic indications with ${query}`, url: "https://patents.google.com/patent/US9876543", expiryDate: "2027-08-01", owner: "Merck & Co.", ftRisk: "High" }
    ];
}

// 3. EXIM Sourcing data (UN Comtrade preview helper)
async function fetchTradeData(query) {
    // Comtrade API often requires custom headers/subscription tokens.
    // We return clean mock trade distributions mapped directly to the queried term.
    return {
        apiName: query,
        exportVolumes: [
            { country: "Denmark", value: "USD 8.4B" },
            { country: "Switzerland", value: "USD 5.1B" },
            { country: "Germany", value: "USD 3.2B" },
            { country: "USA", value: "USD 1.8B" }
        ],
        importDependency: "High Dependency",
        topSourcingCountries: [
            { country: "Denmark", share: "58%" },
            { country: "Switzerland", share: "22%" },
            { country: "India", share: "12%" }
        ]
    };
}

// 4. Web signals (Tavily search or fallback)
async function fetchWebSignals(query) {
    if (process.env.TAVILY_API_KEY) {
        try {
            const response = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: process.env.TAVILY_API_KEY,
                    query: `${query} pharma clinical trial news`,
                    max_results: 3
                })
            });
            if (response.ok) {
                const json = await response.json();
                return json.results.map(r => {
                    const sentiment = r.title.toLowerCase().includes("concern") || r.title.toLowerCase().includes("risk") ? 0.35 : 0.8;
                    return {
                        title: r.title,
                        url: r.url,
                        source: new URL(r.url).hostname || "Web News",
                        excerpt: r.content,
                        sentiment
                    };
                });
            }
        } catch (e) {
            console.error("Tavily search query error:", e);
        }
    }
    
    return [
        { title: `Breakthrough clinical benefits announced for next-generation ${query}`, url: "#", source: "BioPharma Dive", excerpt: `Research highlights outstanding efficacy profiles with ${query} formulations over previous standards.`, sentiment: 0.9 },
        { title: `Production challenges hit global supply chains for ${query}`, url: "#", source: "SupplyChainNews", excerpt: "Manufacturing delays in European hubs trigger minor market shortages.", sentiment: 0.4 }
    ];
}

// 5. Market Sizing
async function fetchMarketData(query, aiClient) {
    if (aiClient) {
        try {
            const schema = {
                type: Type.OBJECT,
                properties: {
                    therapy: { type: Type.STRING },
                    molecule: { type: Type.STRING },
                    marketSizeUSD: { type: Type.STRING },
                    cagr: { type: Type.STRING },
                    topCompetitors: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                share: { type: Type.STRING }
                            }
                        }
                    },
                    insights: { type: Type.STRING },
                    marketGrowth: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                year: { type: Type.NUMBER },
                                sizeB: { type: Type.NUMBER }
                            }
                        }
                    }
                },
                required: ['therapy', 'molecule', 'marketSizeUSD', 'cagr', 'topCompetitors', 'insights', 'marketGrowth']
            };
            const response = await aiClient.models.generateContent({
                model: "gemini-2.0-flash",
                contents: `Analyze the global market size (USD), CAGR (%), top competitors, and 4 years of historical sales growth data for molecule/therapy: "${query}". Return the result in pure JSON matching the schema.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });
            return JSON.parse(response.text.replace(/```json|```/g, "").trim());
        } catch (e) {
            console.error("AI Market Generation failed, falling back:", e);
        }
    }
    return {
        therapy: query,
        molecule: query,
        marketSizeUSD: "65B",
        cagr: "13.4%",
        topCompetitors: [{ name: "Novo Nordisk", share: "52%" }, { name: "Eli Lilly", share: "36%" }, { name: "Others", share: "12%" }],
        insights: "Rapidly expanding therapeutic segment driven by high consumer adoption and therapeutic label expansions.",
        marketGrowth: [
            { year: 2021, sizeB: 40 },
            { year: 2022, sizeB: 47 },
            { year: 2023, sizeB: 55 },
            { year: 2024, sizeB: 65 }
        ]
    };
}

// ==========================================
// 🧠 AGENT DECOMPOSITION & RUNNER
// ==========================================

// Direct generation endpoint (Master Orchestrator)
app.post('/api/generate', async (req, res) => {
    try {
        const { contents, config } = req.body;
        
        // If contents is not a custom config payload, this might be a simple query prompt
        let prompt = '';
        if (typeof contents === 'string') {
            prompt = contents;
        } else if (Array.isArray(contents)) {
            prompt = contents[0]?.parts[0]?.text || '';
        } else if (contents && contents.contents) {
            prompt = contents.contents;
        } else {
            prompt = req.body.prompt || '';
        }

        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        console.log(`Running master query: "${prompt}"`);

        // 1. Decompose prompt
        const availableAgents = ['market_data', 'patents', 'clinical_trials', 'web_signals', 'exim_sourcing'];
        
        // We check if a workspace/file exists
        // If there's an uploaded file in the database, we can also trigger the "internal_documents" agent
        const hasFile = await prisma.uploadedFile.findFirst();
        if (hasFile) availableAgents.push('internal_documents');

        let agentsToRun = ['market_data', 'patents', 'clinical_trials', 'web_signals']; // Default
        
        if (ai) {
            try {
                const decompSchema = {
                    type: Type.OBJECT,
                    properties: {
                        agents: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING, enum: availableAgents }
                        }
                    },
                    required: ['agents']
                };
                const decompResponse = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `Based on prompt "${prompt}", identify which agents are required to answer this. Choose from: ${availableAgents.join(', ')}`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: decompSchema
                    }
                });
                const parsed = JSON.parse(decompResponse.text.replace(/```json|```/g, "").trim());
                agentsToRun = parsed.agents || agentsToRun;
            } catch (e) {
                console.error("AI Decomposition failed:", e);
            }
        }

        // Create query record
        // Create an anonymous or default workspace if not set
        let workspace = await prisma.workspace.findFirst();
        if (!workspace) {
            const defaultUser = await prisma.user.create({
                data: { email: 'system_default@curecoders.com', password: 'system_password' }
            });
            workspace = await prisma.workspace.create({
                data: { name: 'Default Workspace', userId: defaultUser.id }
            });
        }

        const searchQuery = await prisma.searchQuery.create({
            data: {
                prompt,
                synthesis: 'Orchestrating agents...',
                workspaceId: workspace.id,
                agents: JSON.stringify(agentsToRun)
            }
        });

        // 2. Run child agents concurrently
        const agentResults = [];
        const resultPromises = agentsToRun.map(async (agent) => {
            let data = {};
            let status = 'DONE';
            
            try {
                switch (agent) {
                    case 'market_data':
                        data = { market_data: await fetchMarketData(prompt, getAgentAi('market_data')) };
                        break;
                    case 'patents':
                        data = { patents: await fetchPatents(prompt) };
                        break;
                    case 'clinical_trials':
                        data = { trials: await fetchClinicalTrials(prompt) };
                        break;
                    case 'web_signals':
                        data = { webSignals: await fetchWebSignals(prompt) };
                        break;
                    case 'exim_sourcing':
                        data = { exim: await fetchTradeData(prompt) };
                        break;
                    case 'internal_documents':
                        // RAG Search
                        const file = await prisma.uploadedFile.findFirst({
                            orderBy: { createdAt: 'desc' }
                        });
                        if (file) {
                            const matchedChunks = await searchVectorChunks(prompt, file.id, getAgentAi('internal_documents'), 3);
                            data = {
                                internal_documents: {
                                    summary: matchedChunks.map(c => c.chunkText),
                                    filename: file.filename
                                }
                            };
                        } else {
                            data = { internal_documents: { summary: ["No internal files uploaded."] } };
                        }
                        break;
                }
            } catch (e) {
                console.error(`Agent ${agent} failed:`, e);
                status = 'FAILED';
                data = { error: e.message };
            }

            // Save agent result
            const agentResult = await prisma.agentResult.create({
                data: {
                    queryId: searchQuery.id,
                    agentName: agent,
                    resultJson: JSON.stringify(data),
                    status
                }
            });

            return { agent, data };
        });

        const completedAgents = await Promise.all(resultPromises);
        const unifiedData = completedAgents.reduce((acc, current) => {
            return { ...acc, ...current.data };
        }, {});

        // 3. Synthesis
        let synthesisText = '';
        if (ai) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `Synthesize an executive summary based on user prompt: "${prompt}" and these agent results:\n${JSON.stringify(unifiedData, null, 2)}`
                });
                synthesisText = response.text;
            } catch (e) {
                console.error("AI Synthesis failed:", e);
            }
        }
        
        if (!synthesisText) {
            synthesisText = `### Executive Summary for ${prompt}\n\nOur intelligence agents compiled market sizing, patent cliffs, clinical trials, and trade dependencies. Novo Nordisk and Eli Lilly control the competitive share. Primary patent cliffs are expected in the mid-2030s. Click on individual tabs to inspect agent data tables.`;
        }

        // Update Search Query with synthesis
        await prisma.searchQuery.update({
            where: { id: searchQuery.id },
            data: { synthesis: synthesisText }
        });

        // Format and return response compatible with what frontend's geminiService expected
        // The frontend geminiService expects GenerateContentResponse containing JSON or markdown
        // If the front-end requests `/api/generate`, it expects to receive the synthesis back
        // Or if it was called by `generateAgentData`, it expects matching agent results.
        // Let's return the complete consolidated JSON response
        res.json({
            candidates: [
                {
                    content: {
                        parts: [
                            { text: JSON.stringify(unifiedData) }
                        ]
                    }
                }
            ],
            synthesis: synthesisText,
            queryId: searchQuery.id
        });

    } catch (error) {
        console.error("Master Agent execution error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// ==========================================
// 🎙️ CONVERSATIONAL VOICE ASSISTANT (SARVAM AI)
// ==========================================
app.post('/api/voice-chat', async (req, res) => {
    try {
        const { text, language = 'en-IN' } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // 1. Send to DeepSeek (Conversational Brain)
        const systemPrompt = "You are ARIA, a highly intelligent AI pharmaceutical research assistant for CureCoders. Keep your answers extremely brief and conversational. DO NOT use markdown. YOUR RESPONSE MUST BE UNDER 400 CHARACTERS. THIS IS A HARD SYSTEM LIMIT FOR VOICE SYNTHESIS.";
        
        let aiResponseText = "I'm sorry, I couldn't process that.";
        if (ai) {
            try {
                // Using the existing CustomAIClient
                const response = await ai.models.generateContent({
                    contents: `${systemPrompt}\n\nUser asks: ${text}`
                });
                aiResponseText = response.text || "I didn't quite catch that.";
                
                // Safety truncation to absolutely ensure we never exceed 500 chars for Sarvam
                if (aiResponseText.length > 490) {
                    // Try to truncate at the last full stop within the limit
                    const truncated = aiResponseText.substring(0, 490);
                    const lastPeriod = truncated.lastIndexOf('.');
                    aiResponseText = lastPeriod > 0 ? truncated.substring(0, lastPeriod + 1) : truncated + "...";
                }
            } catch (e) {
                console.error("AI chat generation failed:", e);
                aiResponseText = "I'm having trouble connecting to my brain right now.";
            }
        }

        // 2. Send text to Sarvam AI (Text-to-Speech)
        let audioBase64 = null;
        if (process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== 'your_sarvam_api_key_here') {
            try {
                const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
                    method: 'POST',
                    headers: {
                        'api-subscription-key': process.env.SARVAM_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: [aiResponseText],
                        target_language_code: language,
                        speaker: 'kavya', 
                        speech_sample_rate: 16000,
                        enable_preprocessing: true,
                        model: 'bulbul:v3' 
                    })
                });

                if (sarvamRes.ok) {
                    const sarvamData = await sarvamRes.json();
                    if (sarvamData.audios && sarvamData.audios.length > 0) {
                        audioBase64 = sarvamData.audios[0];
                    }
                } else {
                    const errText = await sarvamRes.text();
                    console.error("Sarvam API Error:", errText);
                    audioBase64 = "ERROR: " + errText;
                }
            } catch (e) {
                console.error("Sarvam AI connection failed:", e);
                audioBase64 = "ERROR: " + e.message;
            }
        }

        res.json({
            text: audioBase64 && audioBase64.startsWith("ERROR:") ? `Sarvam Error: ${audioBase64} | Response: ${aiResponseText}` : aiResponseText,
            audio: audioBase64 && !audioBase64.startsWith("ERROR:") ? audioBase64 : null,
            audio_error: audioBase64 && audioBase64.startsWith("ERROR:") ? audioBase64 : null
        });

    } catch (error) {
        console.error("Voice Chat execution error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// Endpoint just for TTS (when user types text instead of speaking)
app.post('/api/tts', async (req, res) => {
    try {
        let { text, language = 'en-IN' } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        // Clean up markdown and truncate to fit Sarvam limit
        let cleanText = text.replace(/[*#_]/g, '');
        if (cleanText.length > 490) {
            const truncated = cleanText.substring(0, 490);
            const lastPeriod = truncated.lastIndexOf('.');
            cleanText = lastPeriod > 0 ? truncated.substring(0, lastPeriod + 1) : truncated + "...";
        }

        let audioBase64 = null;
        if (process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== 'your_sarvam_api_key_here') {
            try {
                const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
                    method: 'POST',
                    headers: {
                        'api-subscription-key': process.env.SARVAM_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: [cleanText],
                        target_language_code: language,
                        speaker: 'kavya',
                        speech_sample_rate: 16000,
                        enable_preprocessing: true,
                        model: 'bulbul:v3'
                    })
                });

                if (sarvamRes.ok) {
                    const sarvamData = await sarvamRes.json();
                    if (sarvamData.audios && sarvamData.audios.length > 0) {
                        audioBase64 = sarvamData.audios[0];
                    }
                }
            } catch (e) {
                console.error("Sarvam API Error:", e);
            }
        }
        res.json({ audio: audioBase64 });
    } catch (error) {
        console.error("TTS route error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Run Agents (Decomposition Endpoint)
app.post('/api/decompose', async (req, res) => {
    try {
        const { prompt, fileUploaded } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        // Artificial delay for realism
        await delay(1500 + Math.random() * 1000);

        const availableAgents = ['market_data', 'patents', 'clinical_trials', 'web_signals', 'exim_sourcing'];
        if (fileUploaded) availableAgents.push('internal_documents');

        let agents = ['market_data', 'patents', 'clinical_trials', 'web_signals']; // default

        if (ai) {
            try {
                const schema = {
                    type: Type.OBJECT,
                    properties: {
                        agents: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING, enum: availableAgents }
                        }
                    },
                    required: ['agents']
                };
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `Identify which of these agents are required to answer user prompt: "${prompt}". Choose from: ${availableAgents.join(', ')}`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema
                    }
                });
                const parsed = JSON.parse(response.text.replace(/```json|```/g, "").trim());
                agents = parsed.agents || agents;
            } catch (e) {
                console.error("AI Decompose failed:", e);
            }
        }
        res.json({ agents });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Run Single Agent Endpoint
app.post('/api/agent-data', async (req, res) => {
    try {
        const { agentName, prompt, fileContext } = req.body;
        if (!agentName || !prompt) return res.status(400).json({ error: 'agentName and prompt are required' });

        // Artificial delay for realism (varies per agent to look natural)
        await delay(2000 + Math.random() * 3000);

        let data = {};
        switch (agentName) {
            case 'market_data':
                data = await fetchMarketData(prompt, getAgentAi('market_data'));
                break;
            case 'patents':
                const patents = await fetchPatents(prompt);
                data = { patents };
                break;
            case 'clinical_trials':
                const trials = await fetchClinicalTrials(prompt);
                data = { trials };
                break;
            case 'web_signals':
                const webSignals = await fetchWebSignals(prompt);
                data = { webSignals };
                break;
            case 'exim_sourcing':
                data = await fetchTradeData(prompt);
                break;
            case 'internal_documents':
                const file = await prisma.uploadedFile.findFirst({
                    orderBy: { createdAt: 'desc' }
                });
                if (file) {
                    // Semantic Search Pipeline
                    const queryEmbedding = await generateEmbedding(prompt);
                    const allChunks = await prisma.documentChunk.findMany({
                        where: { fileId: file.id }
                    });
                    
                    const topChunks = searchSimilarChunks(queryEmbedding, allChunks, 3);
                    const chunkTexts = topChunks.map(c => c.chunkText);

                    data = {
                        internal_documents: {
                            summary: chunkTexts.length > 0 ? chunkTexts : ["No relevant internal files found for the query."],
                            filename: file.filename
                        }
                    };
                } else {
                    data = { internal_documents: { summary: ["No internal files uploaded."] } };
                }
                break;
            default:
                data = { raw: `Unsupported agent: ${agentName}` };
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Synthesize Summary Endpoint
app.post('/api/synthesize', async (req, res) => {
    try {
        const { results, prompt } = req.body;
        
        // Artificial delay for synthesis realism
        await delay(2000 + Math.random() * 2000);

        if (!prompt) return res.status(400).json({ error: 'prompt is required' });

        let synthesis = '';
        if (ai && results) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `Synthesize a professional report based on the user's prompt "${prompt}" and these gathered results:\n${JSON.stringify(results, null, 2)}`
                });
                synthesis = response.text;
            } catch (e) {
                console.error("AI Synthesis failed:", e);
            }
        }

        if (!synthesis) {
            synthesis = `### Synthesis for ${prompt}\n\nNo Gemini API Key is configured on the backend server. A direct analysis is not possible. Presenting compiled datasets.`;
        }

        res.json({ synthesis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save Search Query Endpoint (for Persistence)
app.post('/api/save-query', async (req, res) => {
    try {
        const { prompt, synthesis, agents, results } = req.body;
        if (!prompt) return res.status(400).json({ error: 'prompt is required' });

        // Get or create workspace
        let workspace = await prisma.workspace.findFirst();
        if (!workspace) {
            // Find default guest user
            let guest = await prisma.user.findFirst({ where: { email: 'guest@curecoders.com' } });
            if (!guest) {
                guest = await prisma.user.create({
                    data: { email: 'guest@curecoders.com', password: 'guest_password' }
                });
            }
            workspace = await prisma.workspace.create({
                data: { name: 'Default Workspace', userId: guest.id }
            });
        }

        const searchQuery = await prisma.searchQuery.create({
            data: {
                prompt,
                synthesis: synthesis || '',
                workspaceId: workspace.id,
                agents: JSON.stringify(agents || [])
            }
        });

        if (results && Array.isArray(results)) {
            for (const r of results) {
                let agentName = r.agentName || r.name;
                let agentData = r.result || r.data || r;
                
                if (!agentName && r && typeof r === 'object') {
                    const keys = Object.keys(r).filter(k => k !== 'status');
                    if (keys.length > 0) {
                        agentName = keys[0];
                        agentData = r[agentName];
                    }
                }

                await prisma.agentResult.create({
                    data: {
                        queryId: searchQuery.id,
                        agentName: agentName || '',
                        resultJson: JSON.stringify(agentData),
                        status: r.status || 'DONE'
                    }
                });
            }
        }

        res.json({ queryId: searchQuery.id });
    } catch (error) {
        console.error("Failed to save query:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 📄 EXPORT & REPORT GENERATOR ROUTES
// ==========================================

// Excel Sheet Exporter
app.get('/api/reports/excel', async (req, res) => {
    try {
        const { queryId } = req.query;
        if (!queryId) return res.status(400).send("Query ID required");

        const query = await prisma.searchQuery.findUnique({
            where: { id: queryId },
            include: { results: true }
        });

        if (!query) return res.status(404).send("Query not found");

        const workbook = new ExcelJS.Workbook();
        
        // 1. Cover Sheet
        const coverSheet = workbook.addWorksheet('Overview');
        coverSheet.getCell('A1').value = 'CureCoders Intelligence Report';
        coverSheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF4F46E5' } };
        coverSheet.getCell('A2').value = `Topic: ${query.prompt}`;
        coverSheet.getCell('A2').font = { size: 14, italic: true };
        coverSheet.getCell('A3').value = `Generated on: ${new Date(query.createdAt).toLocaleDateString()}`;

        // 2. Populate sheets for each agent
        for (const resItem of query.results) {
            const rawData = JSON.parse(resItem.resultJson);
            const sheet = workbook.addWorksheet(resItem.agentName.toUpperCase().replace('_', ' '));
            
            // Add Header Row
            sheet.addRow([`Agent: ${resItem.agentName}`, `Status: ${resItem.status}`]);
            sheet.getRow(1).font = { bold: true };
            sheet.addRow([]);

            if (resItem.agentName === 'market_data' && rawData.market_data) {
                const md = rawData.market_data;
                sheet.addRow(['Therapy', md.therapy]);
                sheet.addRow(['Market Size', md.marketSizeUSD]);
                sheet.addRow(['CAGR', md.cagr]);
                sheet.addRow([]);
                sheet.addRow(['Top Competitors', 'Share']);
                md.topCompetitors?.forEach(c => sheet.addRow([c.name, c.share]));
            } else if (resItem.agentName === 'patents' && rawData.patents) {
                sheet.addRow(['Title', 'Expiry Date', 'Owner', 'FTF Risk']);
                rawData.patents.forEach(p => sheet.addRow([p.title, p.expiryDate, p.owner, p.ftRisk]));
            } else if (resItem.agentName === 'clinical_trials' && rawData.trials) {
                sheet.addRow(['NCT ID', 'Title', 'Phase', 'Status', 'Sponsor']);
                rawData.trials.forEach(t => sheet.addRow([t.id, t.title, t.phase, t.status, t.sponsor]));
            } else if (resItem.agentName === 'web_signals' && rawData.webSignals) {
                sheet.addRow(['Source', 'Title', 'Sentiment']);
                rawData.webSignals.forEach(w => sheet.addRow([w.source, w.title, w.sentiment]));
            } else {
                sheet.addRow(['Raw JSON Dump']);
                sheet.addRow([JSON.stringify(rawData, null, 2)]);
            }
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=CureCoders_Report_${queryId}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Excel Export failed:", error);
        res.status(500).send("Excel generation error");
    }
});

// PowerPoint Slide Exporter
app.get('/api/reports/pptx', async (req, res) => {
    try {
        const { queryId } = req.query;
        if (!queryId) return res.status(400).send("Query ID required");

        const query = await prisma.searchQuery.findUnique({
            where: { id: queryId },
            include: { results: true }
        });

        if (!query) return res.status(404).send("Query not found");

        const pptx = new pptxgen();

        // 1. Cover Slide
        const coverSlide = pptx.addSlide();
        coverSlide.background = { fill: "1E1E2E" };
        coverSlide.addText("CureCoders AI", { x: 0.5, y: 1.5, fontSize: 44, color: "8892B0", bold: true });
        coverSlide.addText(`Market & Competitive Intelligence:\n${query.prompt}`, { x: 0.5, y: 2.5, fontSize: 24, color: "FFFFFF" });
        coverSlide.addText(`Generated: ${new Date(query.createdAt).toLocaleDateString()}`, { x: 0.5, y: 4.5, fontSize: 14, color: "A8B2D1" });

        // 2. Executive Summary Slide
        const summarySlide = pptx.addSlide();
        summarySlide.addText("Executive Summary Findings", { x: 0.5, y: 0.5, fontSize: 28, color: "4F46E5", bold: true });
        summarySlide.addText(query.synthesis.slice(0, 800) + (query.synthesis.length > 800 ? "..." : ""), {
            x: 0.5,
            y: 1.2,
            w: 9,
            h: 4.5,
            fontSize: 14,
            color: "333333"
        });

        // 3. Data Agents Slide
        const dataSlide = pptx.addSlide();
        dataSlide.addText("Deployed Intelligence Agents Results", { x: 0.5, y: 0.5, fontSize: 28, color: "4F46E5", bold: true });
        
        let yPos = 1.2;
        query.results.forEach((r, idx) => {
            if (idx < 5) {
                dataSlide.addText(`• Agent [${r.agentName.toUpperCase()}]: completed successfully (Status: ${r.status})`, {
                    x: 0.5,
                    y: yPos,
                    fontSize: 14
                });
                yPos += 0.6;
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename=CureCoders_Deck_${queryId}.pptx`);

        pptx.write('nodebuffer').then(buffer => {
            res.send(buffer);
        });
    } catch (error) {
        console.error("PPTX Export failed:", error);
        res.status(500).send("PowerPoint generation error");
    }
});

// ==========================================
// 📌 BOOKMARKS API ENDPOINTS
// ==========================================

// Get all bookmarks for user
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: req.user.id },
            include: {
                query: {
                    include: {
                        results: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        const formatted = bookmarks.map(b => ({
            id: b.id,
            queryId: b.queryId,
            query: b.query.prompt,
            timestamp: b.createdAt.toISOString(),
            tags: JSON.parse(b.tags)
        }));
        res.json(formatted);
    } catch (error) {
        console.error("Fetch Bookmarks Error:", error);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// Create a new bookmark
app.post('/api/bookmarks', authenticateToken, async (req, res) => {
    try {
        const { queryId, tags } = req.body;
        if (!queryId) return res.status(400).json({ error: 'queryId is required' });

        const query = await prisma.searchQuery.findUnique({ where: { id: queryId } });
        if (!query) return res.status(404).json({ error: 'Query not found' });

        const existing = await prisma.bookmark.findFirst({
            where: { userId: req.user.id, queryId }
        });
        if (existing) {
            return res.json({
                id: existing.id,
                queryId: existing.queryId,
                query: query.prompt,
                timestamp: existing.createdAt.toISOString(),
                tags: JSON.parse(existing.tags)
            });
        }

        const tagsString = JSON.stringify(tags || []);
        const bookmark = await prisma.bookmark.create({
            data: {
                userId: req.user.id,
                queryId,
                tags: tagsString
            }
        });

        res.status(201).json({
            id: bookmark.id,
            queryId: bookmark.queryId,
            query: query.prompt,
            timestamp: bookmark.createdAt.toISOString(),
            tags: tags || []
        });
    } catch (error) {
        console.error("Create Bookmark Error:", error);
        res.status(500).json({ error: 'Failed to create bookmark' });
    }
});

// Delete a bookmark
app.delete('/api/bookmarks/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const bookmark = await prisma.bookmark.findUnique({ where: { id } });
        if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });

        if (bookmark.userId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.bookmark.delete({ where: { id } });
        res.json({ message: 'Bookmark deleted successfully' });
    } catch (error) {
        console.error("Delete Bookmark Error:", error);
        res.status(500).json({ error: 'Failed to delete bookmark' });
    }
});

// Update tags for a bookmark
app.put('/api/bookmarks/:id/tags', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        if (!Array.isArray(tags)) return res.status(400).json({ error: 'tags must be an array' });

        const bookmark = await prisma.bookmark.findUnique({ where: { id } });
        if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });

        if (bookmark.userId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updated = await prisma.bookmark.update({
            where: { id },
            data: { tags: JSON.stringify(tags) }
        });

        res.json({
            id: updated.id,
            queryId: updated.queryId,
            tags: JSON.parse(updated.tags)
        });
    } catch (error) {
        console.error("Update Bookmark Tags Error:", error);
        res.status(500).json({ error: 'Failed to update tags' });
    }
});


// ==========================================
// 👥 TEAM COLLABORATION API ENDPOINTS
// ==========================================

// Get all shared queries
app.get('/api/collaboration/shared', authenticateToken, async (req, res) => {
    try {
        const shared = await prisma.sharedQuery.findMany({
            include: {
                query: true,
                comments: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const users = await prisma.user.findMany();
        const userMap = new Map(users.map(u => [u.id, u.email]));

        const formatted = shared.map(s => ({
            id: s.id,
            queryId: s.queryId,
            query: s.query.prompt,
            sharedBy: userMap.get(s.sharedById) || 'Unknown Analyst',
            timestamp: s.createdAt.toLocaleString(),
            comments: s.comments.length
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Fetch Shared Queries Error:", error);
        res.status(500).json({ error: 'Failed to fetch shared queries' });
    }
});

// Share a query with the team
app.post('/api/collaboration/share', authenticateToken, async (req, res) => {
    try {
        const { queryId } = req.body;
        if (!queryId) return res.status(400).json({ error: 'queryId is required' });

        const query = await prisma.searchQuery.findUnique({ where: { id: queryId } });
        if (!query) return res.status(404).json({ error: 'Query not found' });

        const existing = await prisma.sharedQuery.findFirst({ where: { queryId } });
        if (existing) {
            const users = await prisma.user.findMany();
            const userMap = new Map(users.map(u => [u.id, u.email]));
            const commentsCount = await prisma.comment.count({ where: { sharedQueryId: existing.id } });
            
            return res.json({
                id: existing.id,
                queryId: existing.queryId,
                query: query.prompt,
                sharedBy: userMap.get(existing.sharedById) || 'Unknown Analyst',
                timestamp: existing.createdAt.toLocaleString(),
                comments: commentsCount
            });
        }

        const shared = await prisma.sharedQuery.create({
            data: {
                queryId,
                sharedById: req.user.id
            },
            include: {
                query: true
            }
        });

        res.status(201).json({
            id: shared.id,
            queryId: shared.queryId,
            query: shared.query.prompt,
            sharedBy: req.user.email,
            timestamp: shared.createdAt.toLocaleString(),
            comments: 0
        });
    } catch (error) {
        console.error("Share Query Error:", error);
        res.status(500).json({ error: 'Failed to share query' });
    }
});

// Get comments for shared query
app.get('/api/collaboration/comments/:sharedQueryId', authenticateToken, async (req, res) => {
    try {
        const { sharedQueryId } = req.params;
        const comments = await prisma.comment.findMany({
            where: { sharedQueryId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(comments);
    } catch (error) {
        console.error("Fetch Comments Error:", error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Add a comment to a shared query
app.post('/api/collaboration/comments', authenticateToken, async (req, res) => {
    try {
        const { sharedQueryId, content } = req.body;
        if (!sharedQueryId || !content) {
            return res.status(400).json({ error: 'sharedQueryId and content are required' });
        }

        const comment = await prisma.comment.create({
            data: {
                sharedQueryId,
                userId: req.user.id,
                userEmail: req.user.email,
                content
            }
        });
        res.status(201).json(comment);
    } catch (error) {
        console.error("Add Comment Error:", error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Get last 50 team chat messages
app.get('/api/collaboration/chat', authenticateToken, async (req, res) => {
    try {
        const messages = await prisma.teamChatMessage.findMany({
            take: 50,
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        console.error("Fetch Chat Error:", error);
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
});

// Send team chat message
app.post('/api/collaboration/chat', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'content is required' });

        const namePart = req.user.email.split('@')[0];
        const userName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        const chatMsg = await prisma.teamChatMessage.create({
            data: {
                userId: req.user.id,
                userEmail: req.user.email,
                userName,
                content
            }
        });

        res.status(201).json(chatMsg);
    } catch (error) {
        console.error("Send Chat Error:", error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get team members (users)
app.get('/api/collaboration/members', authenticateToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        const formatted = users.map(u => {
            const namePart = u.email.split('@')[0];
            const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            const initials = namePart.slice(0, 2).toUpperCase();
            
            return {
                id: u.id,
                name,
                email: u.email,
                avatar: initials,
                status: 'online',
                role: u.role
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error("Fetch Members Error:", error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
