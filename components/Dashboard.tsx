import React, { useState, ReactNode } from 'react';
import { Agent, AgentName, AgentStatus } from '../types';
import SummaryDisplay from './SummaryDisplay';
import ChatAnalysis from './ChatAnalysis';
import { ResultDisplay } from './AgentCard';
import { BarChart, ChevronDown, ChevronUp, FileText, Globe, LayoutGrid, Microscope, Ship, TrendingDown, TrendingUp, Zap, FileText as InternalIcon, BrainCircuit } from './Icons';
import { useAppContext } from '../hooks/useAppContext';

interface DashboardProps {
    prompt: string;
    summary: string;
    agents: Agent[];
    onDownloadPdf: () => void;
    onExportExcel: () => void;
    onExportPpt: () => void;
    isReportReady: boolean;
    isDownloadingPdf: boolean;
    isExportingExcel: boolean;
    isExportingPpt: boolean;
}

const KpiCard: React.FC<{ title: string; value: string; change?: string; changeType?: 'up' | 'down'; icon: ReactNode }> = ({ title, value, change, changeType = 'up', icon }) => (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-start justify-between">
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 mt-1">{value}</p>
            {change && (
                <div className={`flex items-center gap-1 mt-1 text-sm ${changeType === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {changeType === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{change}</span>
                </div>
            )}
        </div>
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
            {icon}
        </div>
    </div>
);

const DashboardSection: React.FC<{ title: string; subtitle: string; icon: ReactNode; children: ReactNode; defaultOpen?: boolean }> = ({ title, subtitle, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-transparent rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-4 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <div className="flex items-center gap-4">
                     <div className="text-primary">{icon}</div>
                     <div>
                        <h3 className="font-display text-lg font-bold">{title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            {isOpen && (
                <div className="p-4 md:p-6 bg-white dark:bg-slate-800/30">
                    {children}
                </div>
            )}
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { agents, summary, prompt } = props;
    const { chatHistory, isChatting, sendChatMessage } = useAppContext();

    const findAgent = (name: AgentName) => agents.find(a => a.name === name && a.status === AgentStatus.DONE);

    const marketAgent = findAgent(AgentName.MARKET_DATA);
    const patentAgent = findAgent(AgentName.PATENTS);
    const clinicalAgent = findAgent(AgentName.CLINICAL);
    const eximAgent = findAgent(AgentName.EXIM);
    const internalAgent = findAgent(AgentName.INTERNAL);
    const webAgent = findAgent(AgentName.WEB);

    const marketData = marketAgent?.result?.[AgentName.MARKET_DATA];
    const patentData = patentAgent?.result?.[AgentName.PATENTS];
    const clinicalData = clinicalAgent?.result?.[AgentName.CLINICAL];

    return (
        <div className="mt-8 animate-[fadeIn_0.5s_ease-in-out]">
            <h2 className="font-display text-3xl font-bold text-center">Intelligence Dashboard</h2>
            <p className="mt-2 text-center text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Showing results for your query: <span className="font-semibold text-primary dark:text-primary-light">"{prompt}"</span>
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Market Size" value={marketData ? `$${marketData.marketSizeUSD}` : 'N/A'} change={marketData ? `${marketData.cagr} CAGR` : undefined} changeType="up" icon={<BarChart className="w-5 h-5"/>} />
                <KpiCard title="High-Risk Patents" value={patentData ? `${patentData.patents.filter(p => p.ftRisk === 'High').length}` : 'N/A'} changeType="down" icon={<FileText className="w-5 h-5"/>} />
                <KpiCard title="Active Trials" value={clinicalData ? `${clinicalData.trials.filter(t => t.status.includes('Recruiting') || t.status.includes('Active')).length}` : 'N/A'} icon={<Microscope className="w-5 h-5"/>} />
                <KpiCard title="Agents Run" value={`${agents.filter(a => a.status === 'Done').length}`} icon={<Zap className="w-5 h-5"/>} />
            </div>

            <div className="mt-8 space-y-4">
                 <DashboardSection 
                    title="Synthesis & AI Recommendations" 
                    subtitle="Final analysis and strategic advice from the Master Agent"
                    icon={<BrainCircuit className="w-6 h-6"/>}
                    defaultOpen={true}
                >
                    <SummaryDisplay {...props} />
                </DashboardSection>

                {chatHistory.length > 0 && (
                    <DashboardSection 
                        title="Follow-up Chat Analysis"
                        subtitle="Ask clarifying questions about the report"
                        icon={<BrainCircuit className="w-6 h-6"/>}
                        defaultOpen={true}
                    >
                        <ChatAnalysis history={chatHistory} isChatting={isChatting} onSendMessage={sendChatMessage} />
                    </DashboardSection>
                )}

                {marketAgent && <DashboardSection title="Market & Competitor Analysis" subtitle="Market landscape overview and key players" icon={<BarChart className="w-6 h-6"/>}>
                    <ResultDisplay agentName={AgentName.MARKET_DATA} result={marketAgent.result!} />
                </DashboardSection>}

                {patentAgent && <DashboardSection title="Patent Landscape" subtitle="Intellectual property and freedom-to-operate risks" icon={<FileText className="w-6 h-6"/>}>
                    <ResultDisplay agentName={AgentName.PATENTS} result={patentAgent.result!} />
                </DashboardSection>}

                {clinicalAgent && <DashboardSection title="Clinical Trials" subtitle="Current and upcoming clinical studies and their status" icon={<Microscope className="w-6 h-6"/>}>
                    <ResultDisplay agentName={AgentName.CLINICAL} result={clinicalAgent.result!} />
                </DashboardSection>}

                {(eximAgent || webAgent || internalAgent) && (
                    <DashboardSection title="Extended Intelligence" subtitle="Data from trade flows, web signals, and internal documents" icon={<LayoutGrid className="w-6 h-6"/>}>
                        <div className="space-y-8">
                            {eximAgent && <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50"><h4 className="font-semibold mb-2 flex items-center gap-2"><Ship className="w-5 h-5 text-secondary"/>{AgentName.EXIM}</h4><ResultDisplay agentName={AgentName.EXIM} result={eximAgent.result!} /></div>}
                            {webAgent && <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50"><h4 className="font-semibold mb-2 flex items-center gap-2"><Globe className="w-5 h-5 text-secondary"/>{AgentName.WEB}</h4><ResultDisplay agentName={AgentName.WEB} result={webAgent.result!} /></div>}
                            {internalAgent && <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50"><h4 className="font-semibold mb-2 flex items-center gap-2"><InternalIcon className="w-5 h-5 text-secondary"/>{AgentName.INTERNAL}</h4><ResultDisplay agentName={AgentName.INTERNAL} result={internalAgent.result!} /></div>}
                        </div>
                    </DashboardSection>
                )}
            </div>
        </div>
    );
};

export default Dashboard;