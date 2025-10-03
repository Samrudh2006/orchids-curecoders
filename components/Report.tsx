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
        a.result
    );

    const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
        const htmlContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/(\r\n|\n\r|\r|\n)/g, '<br />');
        return <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    };

    return (
        <div className="bg-white p-8 font-sans" style={{ width: '800px' }}>
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center space-x-3">
                    <Logo className="w-10 h-10" />
                    <span className="font-display font-bold text-xl text-slate-800">CureCoders</span>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold font-display text-gray-800">AI Research Report</h1>
                    <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Prompt Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold font-display text-gray-800 border-b pb-2">Initial Query</h2>
                <p className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700 italic">"{prompt}"</p>
            </div>
            
            {/* Summary Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold font-display text-gray-800 border-b pb-2">Executive Summary</h2>
                <div className="mt-3 prose prose-slate max-w-none">
                    <MarkdownRenderer content={summary} />
                </div>
            </div>
            
            {/* Agent Details Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold font-display text-gray-800 border-b pb-2">Detailed Agent Findings</h2>
                <div className="space-y-6 mt-4">
                    {successfulAgents.map(agent => (
                        <div key={agent.id} className="p-4 border border-gray-200 rounded-lg break-inside-avoid">
                             <h3 className="font-semibold text-base text-primary">{agent.name}</h3>
                             <div className="mt-3">
                                {agent.result && <ResultDisplay agentName={agent.name} result={agent.result} />}
                             </div>
                        </div>
                    ))}
                </div>
            </div>

             {/* Footer */}
            <div className="mt-12 text-center text-xs text-gray-400 pt-4 border-t">
                 <p>&copy; {new Date().getFullYear()} CureCoders. Confidential report for internal use only.</p>
            </div>
        </div>
    );
};

export default Report;
