import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Agent, AgentName, AgentStatus, AgentResultData, AgentError, ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import { useVoiceAssistant } from './VoiceAssistantContext';
import { getApiUrl, getAuthHeaders } from '../services/apiConfig';
import { useQueryLimit } from './QueryLimitContext';

interface SearchHistoryItem {
    id: string;
    prompt: string;
}

interface AppContextType {
    prompt: string;
    setPrompt: (prompt: string) => void;
    currentRunPrompt: string;
    agents: Agent[];
    summary: string;
    isOrchestrating: boolean;
    isReportReady: boolean;
    error: string | null;
    uploadedFile: File | null;
    setUploadedFile: (file: File | null) => void;
    searchHistory: SearchHistoryItem[];
    runMasterAgent: (prompt: string) => void;
    chatHistory: ChatMessage[];
    isChatting: boolean;
    sendChatMessage: (message: string) => void;
    queryId: string | null;
    token: string | null;
    user: { email: string } | null;
    login: (token: string, user: { email: string }) => void;
    logout: () => void;
    loadSearchHistory: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { canQuery, incrementQuery } = useQueryLimit();
    const [prompt, setPrompt] = useState('');
    const [currentRunPrompt, setCurrentRunPrompt] = useState('');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [summary, setSummary] = useState('');
    const [isOrchestrating, setIsOrchestrating] = useState(false);
    const [isReportReady, setIsReportReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatting, setIsChatting] = useState(false);
    const [queryId, setQueryId] = useState<string | null>(null);

    // Auth States
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('curecoders_auth_token'));
    const [user, setUser] = useState<{ email: string } | null>(() => {
        const stored = localStorage.getItem('curecoders_user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = (newToken: string, newUser: { email: string }) => {
        localStorage.setItem('curecoders_auth_token', newToken);
        localStorage.setItem('curecoders_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        window.dispatchEvent(new CustomEvent('auth-change'));
    };

    const logout = () => {
        localStorage.removeItem('curecoders_auth_token');
        localStorage.removeItem('curecoders_user');
        setToken(null);
        setUser(null);
        setSearchHistory([]);
        window.dispatchEvent(new CustomEvent('auth-change'));
    };

    const loadSearchHistory = useCallback(async () => {
        try {
            const response = await fetch(`${getApiUrl()}/api/history`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setSearchHistory(data.slice(0, 5).map((item: any) => ({ id: item.id, prompt: item.prompt })));
                }
            }
        } catch (err) {
            console.error("Failed to load search history from DB:", err);
        }
    }, [token]);

    useEffect(() => {
        loadSearchHistory();
    }, [loadSearchHistory]);

    const handleSetUploadedFile = useCallback(async (file: File | null) => {
        setUploadedFile(file);
        if (file) {
            console.log("Uploading file to backend for RAG indexing...");
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await fetch(`${getApiUrl()}/api/upload`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: formData
                });
                if (response.ok) {
                    console.log("File uploaded and indexed successfully on the backend!");
                } else {
                    console.error("Backend file upload failed.");
                }
            } catch (err) {
                console.error("Error uploading file to backend:", err);
            }
        }
    }, []);

    const runMasterAgent = useCallback(async (currentPrompt: string) => {
        if (!currentPrompt.trim() || isOrchestrating) return;

        // Check query limit for guest users
        if (!localStorage.getItem('curecoders_auth_token')) {
            if (!canQuery) {
                setError("out.of.free.queries");
                return;
            }
        }

        setIsOrchestrating(true);
        setIsReportReady(false);
        setAgents([]);
        setSummary('');
        setError(null);
        setCurrentRunPrompt(currentPrompt);
        setChatHistory([]);
        
        // Scroll to workspace if not already visible
        document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });

        try {
            const decompositionAgent: Agent = { id: 'decomp', name: AgentName.DECOMPOSITION, status: AgentStatus.RUNNING, result: null };
            setAgents([decompositionAgent]);

            const requiredAgentNames = await geminiService.decomposePrompt(currentPrompt, !!uploadedFile);
            setAgents(prev => prev.map(a => a.id === 'decomp' ? {...a, status: AgentStatus.DONE} : a));

            if (requiredAgentNames.length === 0) {
                 setSummary("No agents were identified as necessary to answer your query. Please try a different prompt.");
                 setIsOrchestrating(false);
                 return;
            }

            const workerAgents: Agent[] = requiredAgentNames.map((name, index) => ({
                id: `agent-${index}`,
                name,
                status: AgentStatus.QUEUED,
                result: null,
            }));
            setAgents(prev => [...prev, ...workerAgents]);

            const successfulResults: AgentResultData[] = [];
            for (const agent of workerAgents) {
                setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: AgentStatus.RUNNING } : a));
                try {
                    let result: AgentResultData;
                    if (agent.name === AgentName.INTERNAL && uploadedFile) {
                         const fileContext = `File name: ${uploadedFile.name}, File size: ${uploadedFile.size} bytes, File type: ${uploadedFile.type}`;
                         result = await geminiService.generateAgentData(agent.name, currentPrompt, fileContext);
                    } else {
                         result = await geminiService.generateAgentData(agent.name, currentPrompt);
                    }
                    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: AgentStatus.DONE, result } : a));
                    successfulResults.push(result);
                } catch (e) {
                    const error: AgentError = {
                        message: e instanceof Error ? e.message : 'An unknown error occurred',
                        suggestion: (e as any).suggestion,
                    };
                    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: AgentStatus.FAILED, error } : a));
                }
            }

            let finalSummary = '';

            if (successfulResults.length > 0) {
                const synthesisAgent: Agent = { id: 'synth', name: AgentName.SYNTHESIS, status: AgentStatus.RUNNING, result: null };
                setAgents(prev => [...prev, synthesisAgent]);

                finalSummary = await geminiService.synthesizeResults(successfulResults, currentPrompt);
                setSummary(finalSummary);
                setAgents(prev => prev.map(a => a.id === 'synth' ? {...a, status: AgentStatus.DONE} : a));

                geminiService.initializeChat(currentPrompt, successfulResults, finalSummary);
                setChatHistory([{
                    sender: 'ai',
                    text: "I've analyzed the report. Feel free to ask any follow-up questions about these findings.",
                    id: `ai-init-${Date.now()}`
                }]);

                const reportAgent: Agent = { id: 'report', name: AgentName.REPORT_GENERATOR, status: AgentStatus.DONE, result: null };
                setAgents(prev => [...prev, reportAgent]);

                setIsReportReady(true);

                // Save results to backend DB
                const savedQueryId = await geminiService.saveQueryResults(
                    currentPrompt,
                    finalSummary,
                    requiredAgentNames,
                    successfulResults
                );
                setQueryId(savedQueryId);

                // Increment free query limit counter for guests
                if (!localStorage.getItem('curecoders_auth_token')) {
                    incrementQuery();
                }

                // Refresh history list
                loadSearchHistory();
            } else {
                setError("All agents failed to produce results.");
            }

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : 'An orchestration error occurred';
            setError(errorMsg);
            const agentError: AgentError = {
                message: errorMsg,
                suggestion: (e as any).suggestion,
            };
            setAgents(prev => prev.map(a => a.status === AgentStatus.RUNNING ? {...a, status: AgentStatus.FAILED, error: agentError } : a));
        } finally {
            setIsOrchestrating(false);
        }
    }, [isOrchestrating, uploadedFile, canQuery, loadSearchHistory]);
    
    const sendChatMessage = useCallback(async (message: string) => {
        if (!message.trim() || isChatting) return;

        setIsChatting(true);
        const userMessage: ChatMessage = { sender: 'user', text: message, id: `user-${Date.now()}` };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            const aiResponseText = await geminiService.sendMessage(message);
            const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText, id: `ai-${Date.now()}` };
            setChatHistory(prev => [...prev, aiMessage]);
        } catch (err) {
            const errorText = err instanceof Error ? err.message : "An unexpected error occurred.";
            const errorMessage: ChatMessage = { sender: 'ai', text: `Sorry, I encountered an error: ${errorText}`, id: `err-${Date.now()}` };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatting(false);
        }
    }, [isChatting]);

    const value = {
        prompt,
        setPrompt,
        currentRunPrompt,
        agents,
        summary,
        isOrchestrating,
        isReportReady,
        error,
        uploadedFile,
        setUploadedFile: handleSetUploadedFile,
        searchHistory,
        runMasterAgent,
        chatHistory,
        isChatting,
        sendChatMessage,
        queryId,
        token,
        user,
        login,
        logout,
        loadSearchHistory
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};