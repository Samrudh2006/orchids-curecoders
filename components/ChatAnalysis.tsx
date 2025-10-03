import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, BrainCircuit } from './Icons';
import { Spinner } from './Spinner';

interface ChatAnalysisProps {
    history: ChatMessage[];
    isChatting: boolean;
    onSendMessage: (message: string) => void;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-sm">$1</code>')
        .replace(/(\r\n|\n\r|\r|\n)/g, '<br />');

    return <div className="prose prose-sm prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};


const ChatAnalysis: React.FC<ChatAnalysisProps> = ({ history, isChatting, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {history.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <BrainCircuit className="w-5 h-5 text-primary" />
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-xl ${msg.sender === 'ai' ? 'bg-white dark:bg-slate-700' : 'bg-primary text-white'}`}>
                            <MarkdownRenderer content={msg.text} />
                        </div>
                    </div>
                ))}
                {isChatting && (
                     <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-5 h-5 text-primary" />
                        </div>
                        <div className="max-w-md p-3 rounded-xl bg-white dark:bg-slate-700">
                            <Spinner className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        disabled={isChatting}
                        className="w-full pl-4 pr-12 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary transition"
                    />
                    <button
                        type="submit"
                        disabled={isChatting || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-primary hover:bg-primary-light disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatAnalysis;