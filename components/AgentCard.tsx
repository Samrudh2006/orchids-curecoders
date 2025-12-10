import React, { useState, useMemo } from 'react';
import { Agent, AgentStatus, AgentName, AgentResultData } from '../types';
import { CheckCircle, Clock, XCircle, Zap, BrainCircuit, Microscope, BarChart, FileText, Globe, Ship, AlertTriangle, Download, Calendar, Filter, Info, ChevronUp, ChevronDown } from './Icons';
import { Skeleton } from './Skeleton';

interface AgentCardProps {
    agent: Agent;
}

const getStatusIcon = (status: AgentStatus) => {
    switch(status) {
        case AgentStatus.QUEUED:
            return <Clock className="w-5 h-5 text-slate-500" />;
        case AgentStatus.RUNNING:
            return (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
            );
        case AgentStatus.DONE:
            return <CheckCircle className="w-5 h-5 text-secondary" />;
        case AgentStatus.FAILED:
            return <XCircle className="w-5 h-5 text-red-500" />;
    }
};

const getAgentInfo = (name: AgentName) => {
    const iconClass = "w-6 h-6 text-primary shrink-0";
    switch(name) {
        case AgentName.DECOMPOSITION: return { icon: <BrainCircuit className={iconClass} />, source: "Master Agent" };
        case AgentName.SYNTHESIS: return { icon: <Zap className={iconClass} />, source: "Master Agent" };
        case AgentName.MARKET_DATA: return { icon: <BarChart className={iconClass} />, source: "Source: IQVIA Database" };
        case AgentName.PATENTS: return { icon: <FileText className={iconClass} />, source: "Source: USPTO Database" };
        case AgentName.CLINICAL: return { icon: <Microscope className={iconClass} />, source: "Source: ClinicalTrials.gov" };
        case AgentName.EXIM: return { icon: <Ship className={iconClass} />, source: "Source: EXIM Trade Data" };
        case AgentName.WEB: return { icon: <Globe className={iconClass} />, source: "Source: Live Web Search" };
        case AgentName.INTERNAL: return { icon: <FileText className={iconClass} />, source: "Source: Internal Document" };
        case AgentName.REPORT_GENERATOR: return { icon: <Download className={iconClass} />, source: "Master Agent" };
        default: return { icon: <BrainCircuit className={iconClass} />, source: "System" };
    }
}

const Tooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {text}
        </div>
    </div>
);

export const KeyValue: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-200/50 dark:border-slate-700/50">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-semibold text-right text-slate-700 dark:text-slate-200">{value}</span>
    </div>
);

export const CompetitorPieChart: React.FC<{ data: { name: string; share: string }[] }> = ({ data }) => {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1', '#34D399'];
    let cumulativePercent = 0;
    const gradients = data.map((item, index) => {
        const percent = parseFloat(item.share);
        const start = cumulativePercent;
        const end = cumulativePercent + percent;
        cumulativePercent = end;
        return `${colors[index % colors.length]} ${start}% ${end}%`;
    });

    return (
        <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full" style={{ background: `conic-gradient(${gradients.join(', ')})` }}></div>
            <div className="text-sm">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span>{item.name}: <strong>{item.share}</strong></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MarketGrowthChart: React.FC<{ data: { year: number; sizeB: number }[] }> = ({ data }) => {
    if (!data || data.length < 2) return null;

    const maxVal = Math.max(...data.map(d => d.sizeB));
    const minVal = Math.min(...data.map(d => d.sizeB));
    const range = maxVal - minVal;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.sizeB - minVal) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <h5 className="font-semibold text-sm mb-2 text-slate-600 dark:text-slate-300">Market Size Growth (USD Billions)</h5>
            <svg viewBox="0 0 100 100" className="w-full h-40" preserveAspectRatio="none">
                <polyline fill="none" stroke="var(--color-primary, #4F46E5)" strokeWidth="2" points={points} />
            </svg>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{data[0].year}</span>
                <span>{data[data.length - 1].year}</span>
            </div>
        </div>
    );
};


export const MarketDataResult: React.FC<{ data: AgentResultData[AgentName.MARKET_DATA] }> = ({ data }) => {
    if (!data) return null;
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Market Overview</h4>
                    <div className="space-y-1">
                        <KeyValue label="Therapy Area" value={data.therapy} />
                        <KeyValue label="Molecule" value={data.molecule} />
                        <KeyValue label="Market Size (USD)" value={data.marketSizeUSD} />
                        <KeyValue label="CAGR" value={data.cagr} />
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">AI Insights</h4>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 italic">"{data.insights}"</p>
                </div>
                 <MarketGrowthChart data={data.marketGrowth} />
            </div>
             <div>
                <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Top Competitors</h4>
                <CompetitorPieChart data={data.topCompetitors} />
            </div>
        </div>
    );
};

const getRiskBadgeClass = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
        case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
};

export const PatentTimeline: React.FC<{ patents: { expiryDate: string, title: string }[] }> = ({ patents }) => {
    if (!patents || patents.length === 0) return null;
    const sortedPatents = [...patents].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    const firstYear = new Date(sortedPatents[0].expiryDate).getFullYear();
    const lastYear = new Date(sortedPatents[sortedPatents.length - 1].expiryDate).getFullYear();
    const yearRange = lastYear - firstYear;

    return (
        <div className="mt-6">
            <h4 className="font-semibold mb-4 text-slate-700 dark:text-slate-200">Patent Expiry Timeline</h4>
            <div className="relative h-24 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                {sortedPatents.map((patent, index) => {
                    const patentYear = new Date(patent.expiryDate).getFullYear();
                    const position = yearRange > 0 ? ((patentYear - firstYear) / yearRange) * 100 : 50;
                    return (
                        <Tooltip key={index} text={`${patent.title} - ${patentYear}`} >
                            <div className="absolute w-4 h-4 bg-primary rounded-full -ml-2 transform -translate-x-1/2" style={{ top: `${position}%` }}>
                                 <div className="absolute left-full ml-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{patentYear}</div>
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
};

export const PatentsResult: React.FC<{ data: AgentResultData[AgentName.PATENTS] }> = ({ data }) => {
    const [filters, setFilters] = useState({ owner: '', ftRisk: 'All', expiryYear: '' });
    if (!data || !data.patents) return null;

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value }));
    };

    const filteredPatents = useMemo(() => {
        return data.patents.filter(p => {
            const ownerMatch = p.owner.toLowerCase().includes(filters.owner.toLowerCase());
            const riskMatch = filters.ftRisk === 'All' || p.ftRisk === filters.ftRisk;
            const yearMatch = !filters.expiryYear || new Date(p.expiryDate).getFullYear().toString() === filters.expiryYear;
            return ownerMatch && riskMatch && yearMatch;
        });
    }, [data.patents, filters]);

    const riskLevels = ['All', 'Low', 'Medium', 'High'];

    return (
        <div>
            <div className="grid sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-t-md border-b border-slate-200 dark:border-slate-700">
                <input type="text" name="owner" placeholder="Filter by owner..." value={filters.owner} onChange={handleFilterChange} className="w-full text-sm p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"/>
                <input type="number" name="expiryYear" placeholder="Filter by expiry year..." value={filters.expiryYear} onChange={handleFilterChange} className="w-full text-sm p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"/>
                <select name="ftRisk" value={filters.ftRisk} onChange={handleFilterChange} className="w-full text-sm p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary">
                    {riskLevels.map(r => <option key={r} value={r}>{r} Risk</option>)}
                </select>
            </div>
            <div className="overflow-x-auto rounded-b-md border border-slate-200 dark:border-slate-700 border-t-0">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-left text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="p-2">Title</th>
                            <th className="p-2">Owner</th>
                            <th className="p-2">Expiry</th>
                            <th className="p-2">FTF Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatents.map((p, i) => (
                            <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                                <td className="p-2 font-medium text-slate-800 dark:text-slate-200"><a href={p.url} target="_blank" rel="noreferrer" className="hover:underline">{p.title}</a></td>
                                <td className="p-2">{p.owner}</td>
                                <td className="p-2">{p.expiryDate}</td>
                                <td className="p-2">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRiskBadgeClass(p.ftRisk)}`}>{p.ftRisk}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredPatents.length === 0 && <p className="p-4 text-center text-slate-500">No patents match the current filters.</p>}
            </div>
            <PatentTimeline patents={filteredPatents} />
        </div>
    );
};

export const ClinicalResult: React.FC<{ data: AgentResultData[AgentName.CLINICAL] }> = ({ data }) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
    const [filters, setFilters] = useState({ sponsor: '', status: 'All', phase: 'All' });

    if (!data || !data.trials) return null;

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value }));
    };

    const sortedAndFilteredTrials = useMemo(() => {
        let sortableItems = [...data.trials].filter(t => {
            const sponsorMatch = t.sponsor.toLowerCase().includes(filters.sponsor.toLowerCase());
            const statusMatch = filters.status === 'All' || t.status === filters.status;
            const phaseMatch = filters.phase === 'All' || t.phase === filters.phase;
            return sponsorMatch && statusMatch && phaseMatch;
        });

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data.trials, sortConfig, filters]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };
    
    const uniqueStatuses = ['All', ...Array.from(new Set(data.trials.map(t => t.status)))];
    const uniquePhases = ['All', ...Array.from(new Set(data.trials.map(t => t.phase)))];

    const SortableHeader: React.FC<{ columnKey: string, children: React.ReactNode }> = ({ columnKey, children }) => {
        const isSorted = sortConfig?.key === columnKey;
        return (
            <th className="p-2">
                <button onClick={() => requestSort(columnKey)} className="flex items-center gap-1 group">
                    {children}
                    {isSorted ? (sortConfig?.direction === 'ascending' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>) : <Filter className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />}
                </button>
            </th>
        );
    };

    return (
        <div>
            <div className="grid sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-t-md border-b border-slate-200 dark:border-slate-700">
                <input type="text" name="sponsor" placeholder="Filter by sponsor..." value={filters.sponsor} onChange={handleFilterChange} className="w-full text-sm p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"/>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full text-sm p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary">
                    {uniqueStatuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                </select>
                <select name="phase" value={filters.phase} onChange={handleFilterChange} className="w-full text-sm p-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary">
                    {uniquePhases.map(p => <option key={p} value={p}>{p === 'All' ? 'All Phases' : p}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto rounded-b-md border border-slate-200 dark:border-slate-700 border-t-0">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-left text-slate-500 dark:text-slate-400">
                        <tr>
                            <SortableHeader columnKey="id">ID</SortableHeader>
                            <SortableHeader columnKey="title">Title</SortableHeader>
                            <SortableHeader columnKey="phase">Phase</SortableHeader>
                            <SortableHeader columnKey="status">Status</SortableHeader>
                            <SortableHeader columnKey="sponsor">Sponsor</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredTrials.map((t, i) => (
                            <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                                <td className="p-2 font-mono">{t.id}</td><td className="p-2">{t.title}</td><td className="p-2">{t.phase}</td><td className="p-2">{t.status}</td><td className="p-2">{t.sponsor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedAndFilteredTrials.length === 0 && <p className="p-4 text-center text-slate-500">No trials match the current filters.</p>}
            </div>
        </div>
    );
};

export const EximResult: React.FC<{ data: AgentResultData[AgentName.EXIM] }> = ({ data }) => {
    if (!data) return null;
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                 <KeyValue label="API Name" value={data.apiName} />
                 <KeyValue label="Import Dependency" value={data.importDependency} />
            </div>
            <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Export Volumes</h4>
                    {data.exportVolumes.map((item, i) => <KeyValue key={i} label={item.country} value={item.value} />)}
                </div>
                 <div>
                    <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Top Sourcing Countries</h4>
                    {data.topSourcingCountries.map((item, i) => <KeyValue key={i} label={item.country} value={item.share} />)}
                </div>
            </div>
        </div>
    );
}

const SentimentBar: React.FC<{ score: number }> = ({ score }) => {
    const width = `${score * 100}%`;
    const color = score > 0.6 ? 'bg-secondary' : score > 0.3 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width }}></div>
        </div>
    );
};

export const WebResult: React.FC<{ data: AgentResultData[AgentName.WEB] }> = ({ data }) => {
     if (!data || !data.webSignals) return null;
     return (
        <div className="space-y-4">
            {data.webSignals.map((s, i) => (
                <div key={i} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold hover:underline">{s.title}</a>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.source}</p>
                    <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">{s.excerpt}</p>
                    <div className="mt-3">
                         <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                           <span>Sentiment</span>
                           <span>{s.sentiment > 0.6 ? 'Positive' : s.sentiment > 0.3 ? 'Neutral' : 'Negative'}</span>
                         </div>
                         <SentimentBar score={s.sentiment} />
                    </div>
                </div>
            ))}
        </div>
     );
}

export const InternalResult: React.FC<{ data: AgentResultData[AgentName.INTERNAL] }> = ({ data }) => {
    if (!data || !data.summary) return null;
    return (
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
            {data.summary.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    );
}


export const ResultDisplay: React.FC<{ agentName: AgentName, result: AgentResultData }> = ({ agentName, result }) => {
    switch (agentName) {
        case AgentName.MARKET_DATA: return <MarketDataResult data={result[AgentName.MARKET_DATA]} />;
        case AgentName.PATENTS: return <PatentsResult data={result[AgentName.PATENTS]} />;
        case AgentName.CLINICAL: return <ClinicalResult data={result[AgentName.CLINICAL]} />;
        case AgentName.EXIM: return <EximResult data={result[AgentName.EXIM]} />;
        case AgentName.WEB: return <WebResult data={result[AgentName.WEB]} />;
        case AgentName.INTERNAL: return <InternalResult data={result[AgentName.INTERNAL]} />;
        default:
            return <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>;
    }
};


const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const hasResult = agent.result && Object.keys(agent.result).length > 0 && agent.status === AgentStatus.DONE;
    
    React.useEffect(() => {
        if (hasResult && agent.name !== AgentName.DECOMPOSITION && agent.name !== AgentName.SYNTHESIS) {
            setIsExpanded(false);
        }
    }, [hasResult, agent.name]);
    
    const { icon: agentIcon, source: agentSource } = getAgentInfo(agent.name);
    
    const canExpand = hasResult && agent.name !== AgentName.DECOMPOSITION && agent.name !== AgentName.SYNTHESIS && agent.name !== AgentName.REPORT_GENERATOR;

    return (
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg transition-all duration-300">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {agentIcon}
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{agent.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{agentSource}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {canExpand && (
                        <button 
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                    )}
                    {getStatusIcon(agent.status)}
                </div>
            </div>
            {agent.status === AgentStatus.RUNNING && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary to-secondary animate-gradient-x" style={{backgroundSize: '200% 200%'}}></div>
                </div>
            )}
            {isExpanded && hasResult && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 text-sm">
                    <ResultDisplay agentName={agent.name} result={agent.result} />
                </div>
            )}
             {agent.status === AgentStatus.FAILED && agent.error && (
                <div className="border-t border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4 text-sm">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-700 dark:text-red-300">{agent.error.message}</p>
                            {agent.error.suggestion && (
                                <p className="mt-2 text-slate-600 dark:text-slate-400">{agent.error.suggestion}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentCard;