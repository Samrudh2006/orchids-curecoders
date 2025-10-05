import React from 'react';
import { Agent, AgentName, AgentStatus } from '../types';
import { ResultDisplay } from './AgentCard';
import { Logo } from '../assets/logo';

interface ReportProps {
    prompt: string;
    summary: string;
    agents: Agent[];
}

const Report: React.FC<ReportProps> = ({ prompt, summary, agents }) => {

    const successfulAgents = agents.filter(a =>
        a.status === AgentStatus.DONE &&
        a.name !== AgentName.DECOMPOSITION &&
        a.name !== AgentName.SYNTHESIS &&
        a.name !== AgentName.REPORT_GENERATOR &&
        a.result
    );

    const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
        const htmlContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(\r\n|\n\r|\r|\n)/g, '<br />');
        return <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    };

    return (
        <div className="relative bg-white p-8 font-sans" style={{ width: '800px', minHeight: '1000px' }}>
            {/* Background Image */}
            <div
                className="absolute inset-0 opacity-5 bg-cover bg-center pointer-events-none"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop')",
                    zIndex: 0
                }}
            />

            {/* Content Container */}
            <div className="relative" style={{ zIndex: 1 }}>
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                    <div className="flex items-center space-x-3">
                        <Logo className="w-12 h-12" />
                        <div>
                            <span className="font-display font-bold text-2xl text-slate-800">CureCoders</span>
                            <p className="text-xs text-gray-500">Smart Care, Powered by AI</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold font-display text-gray-800">AI Research Report</h1>
                        <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

            {/* Prompt Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold font-display text-gray-800 border-b border-gray-300 pb-2">Initial Query</h2>
                <p className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700 italic">"{prompt}"</p>
            </div>

            {/* Summary Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold font-display text-gray-800 border-b border-gray-300 pb-2">Executive Summary</h2>
                <div className="mt-3 prose prose-slate max-w-none">
                    <MarkdownRenderer content={summary} />
                </div>
            </div>
            
            {/* Agent Details Section */}
            {successfulAgents.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold font-display text-gray-800 border-b border-gray-300 pb-2">Detailed Agent Findings</h2>
                    <div className="space-y-6 mt-4">
                        {successfulAgents.map(agent => (
                            <div key={agent.id} className="p-4 border border-gray-300 rounded-lg break-inside-avoid bg-gray-50">
                                 <h3 className="font-semibold text-base text-primary mb-3">{agent.name}</h3>
                                 <div className="mt-3">
                                    {agent.result && <ResultDisplay agentName={agent.name} result={agent.result} />}
                                 </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-gray-400 pt-4 border-t border-gray-300">
                     <p>&copy; {new Date().getFullYear()} CureCoders. Confidential report for internal use only.</p>
                     <p className="mt-1">Powered by Advanced AI Analytics</p>
                </div>
            </div>
        </div>
    );
};

export default Report;
