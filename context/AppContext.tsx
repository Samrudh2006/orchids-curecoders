import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Agent, AgentName, AgentStatus, AgentResultData, AgentError, ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import { useVoiceAssistant } from './VoiceAssistantContext';

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
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [prompt, setPrompt] = useState('');
    const [currentRunPrompt, setCurrentRunPrompt] = useState('');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [summary, setSummary] = useState('');
    const [isOrchestrating, setIsOrchestrating] = useState(false);
    const [isReportReady, setIsReportReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
        const stored = localStorage.getItem('searchHistoryDetailed');
        if (stored) {
            const detailed = JSON.parse(stored);
            return detailed.slice(0, 5).map((item: any) => ({ id: item.id, prompt: item.prompt }));
        }
        return [];
    });
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatting, setIsChatting] = useState(false);


    const runMasterAgent = useCallback(async (currentPrompt: string) => {
        if (!currentPrompt.trim() || isOrchestrating) return;

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

                const historyItem = {
                    id: new Date().toISOString(),
                    prompt: currentPrompt,
                    summary: finalSummary,
                    timestamp: new Date().toISOString(),
                    agentCount: successfulResults.length
                };

                const detailedHistory = JSON.parse(localStorage.getItem('searchHistoryDetailed') || '[]');
                const updatedDetailed = [historyItem, ...detailedHistory.filter((item: any) => item.prompt !== currentPrompt)];
                localStorage.setItem('searchHistoryDetailed', JSON.stringify(updatedDetailed));

                setSearchHistory(prev => [{ id: historyItem.id, prompt: currentPrompt }, ...prev.filter(item => item.prompt !== currentPrompt)].slice(0, 5));
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
    }, [isOrchestrating, uploadedFile]);
    
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
        setUploadedFile,
        searchHistory,
        runMasterAgent,
        chatHistory,
        isChatting,
        sendChatMessage,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};