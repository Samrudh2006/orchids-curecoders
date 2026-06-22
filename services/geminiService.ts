import { AgentName, AgentResultData } from "../types";
import { getApiUrl, getAuthHeaders } from "./apiConfig";

const BACKEND_URL = getApiUrl();

// Custom error for better feedback
class AgentError extends Error {
    suggestion?: string;
    constructor(message: string, suggestion?: string) {
        super(message);
        this.name = 'AgentError';
        this.suggestion = suggestion;
    }
}

// In-memory chat history representation
interface ChatPart {
    text: string;
}
interface ChatMessageObj {
    role: 'user' | 'model';
    parts: ChatPart[];
}

let chatHistory: ChatMessageObj[] = [];

export const decomposePrompt = async (prompt: string, fileUploaded: boolean): Promise<AgentName[]> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/decompose`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ prompt, fileUploaded })
        });
        
        if (!response.ok) {
            throw new Error(`Decomposition server responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Map backend names ('market_data', 'patents', etc.) to frontend AgentName enum
        return (data.agents || []).map((name: string) => {
            switch (name) {
                case 'market_data': return AgentName.MARKET_DATA;
                case 'patents': return AgentName.PATENTS;
                case 'clinical_trials': return AgentName.CLINICAL;
                case 'web_signals': return AgentName.WEB;
                case 'exim_sourcing': return AgentName.EXIM;
                case 'internal_documents': return AgentName.INTERNAL;
                default: return name;
            }
        }) as AgentName[];
    } catch (error) {
        console.error("Error in decomposePrompt:", error);
        throw new AgentError(
            "The Master Agent failed to understand the prompt.",
            "Please try rephrasing your query to be more specific about the drug, therapy area, or type of analysis you need."
        );
    }
};

export const generateAgentData = async (agentName: AgentName, prompt: string, fileContext?: string): Promise<AgentResultData> => {
    try {
        // Map AgentName enum to backend names
        let backendName = agentName as string;
        if (agentName === AgentName.MARKET_DATA) backendName = 'market_data';
        else if (agentName === AgentName.PATENTS) backendName = 'patents';
        else if (agentName === AgentName.CLINICAL) backendName = 'clinical_trials';
        else if (agentName === AgentName.WEB) backendName = 'web_signals';
        else if (agentName === AgentName.EXIM) backendName = 'exim_sourcing';
        else if (agentName === AgentName.INTERNAL) backendName = 'internal_documents';

        const response = await fetch(`${BACKEND_URL}/api/agent-data`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ agentName: backendName, prompt, fileContext })
        });

        if (!response.ok) {
            throw new Error(`Agent server responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Make sure returning structure wraps properly inside [agentName] key
        if (data[agentName]) return data;
        return { [agentName]: data };
    } catch (error) {
        console.error(`Error in generateAgentData for ${agentName}:`, error);
        throw error;
    }
};

export const synthesizeResults = async (results: AgentResultData[], prompt: string): Promise<string> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/synthesize`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ results, prompt })
        });

        if (!response.ok) {
            throw new Error(`Synthesis server responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data.synthesis || '';
    } catch (error) {
        console.error("Error in synthesizeResults:", error);
        throw new AgentError(
            "The Synthesis Agent failed to generate a summary.",
            "This usually happens if the worker agents did not return enough data. Check if individual agents have errors and try again."
        );
    }
};

export const saveQueryResults = async (prompt: string, synthesis: string, agents: string[], results: AgentResultData[]): Promise<string> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/save-query`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ prompt, synthesis, agents, results })
        });
        if (!response.ok) throw new Error("Failed to save query on server");
        const data = await response.json();
        return data.queryId || '';
    } catch (error) {
        console.error("Failed to save query:", error);
        return '';
    }
};

export const initializeChat = (prompt: string, results: AgentResultData[], summary: string) => {
    const context = `You are a pharmaceutical industry analyst AI. The user's initial query was: "${prompt}". After running several data agents, the following executive summary was generated: "${summary}". Here is the raw data that informed the summary: ${JSON.stringify(results, null, 2)}. Your role is to answer follow-up questions concisely based ONLY on the provided context. Do not invent new data. If the answer is not in the context, state that clearly.`;

    chatHistory = [
        { role: 'user', parts: [{ text: context }] },
        { role: 'model', parts: [{ text: "Understood. I've analyzed the report and the underlying data. I'm ready for your follow-up questions." }] }
    ];
};

export const sendMessage = async (message: string): Promise<string> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ message, history: chatHistory })
        });

        if (!response.ok) {
            throw new Error(`Chat server responded with status: ${response.status}`);
        }

        const data = await response.json();
        const text = data.text || '';
        
        // Append message and response to local chat session history
        chatHistory.push({ role: 'user', parts: [{ text: message }] });
        chatHistory.push({ role: 'model', parts: [{ text }] });

        return text;
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return `[Connection Error] Could not connect to backend assistant. Detailed error: ${(error as any).message}`;
    }
};