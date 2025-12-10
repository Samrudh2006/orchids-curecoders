import React, { useState, useEffect } from 'react';

const AnimatedArchitectureVideo: React.FC<{ onReplay?: () => void }> = ({ onReplay }) => {
    const [phase, setPhase] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    // Extended Timeline (total ~60 seconds)
    // 0: Start (User Query) - 0s
    // 1: Master Orchestrator (Decomposition) - 5s
    // 2: Agent Selection - 12s
    // 3: Workers Launch (Parallel) - 18s
    // 4: Workers Processing (Mid-way updates) - 25s
    // 5: Workers Complete (Data return) - 40s
    // 6: Synthesis (Report Gen) - 45s
    // 7: Final Output - 55s
    const TIMELINE = [0, 5000, 12000, 18000, 25000, 40000, 45000, 55000, 65000];

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
    };

    useEffect(() => {
        if (!isPlaying) return;

        const timers: NodeJS.Timeout[] = [];
        setPhase(0);
        setLogs([]);

        // Independent Log Events to make it feel alive
        const logEvents = [
            { t: 500, m: "System initialized. Listening for queries..." },
            { t: 1500, m: "User input received: 'Analyze GLP-1 market'" },
            { t: 5500, m: "Master Agent: Analyzing intent..." },
            { t: 8000, m: "Master Agent: Intent classified as 'Market Analysis'" },
            { t: 12500, m: "Selecting best agents for task..." },
            { t: 14000, m: "Selected: IQVIA, EXIM, Patent, Trials, Web" },
            { t: 18500, m: "Dispatching parallel tasks to 7 agents..." },
            { t: 20000, m: "IQVIA Agent: Querying database..." },
            { t: 22000, m: "Patent Agent: Searching USPTO..." },
            { t: 26000, m: "Web Agent: Crawling live news sources..." },
            { t: 30000, m: "Clinical Agent: Found 12 matching trials..." },
            { t: 35000, m: "Internal Agent: Parsing uploaded PDF..." },
            { t: 40500, m: "All agents reported success. 100% complete." },
            { t: 45500, m: "Synthesizing 7 data streams..." },
            { t: 48000, m: "Generating unified request context..." },
            { t: 52000, m: "Drafting Executive Summary..." },
            { t: 55500, m: "Formatting Final Report (PDF, XLS, Dashboard)..." },
            { t: 60000, m: "Process finished successfully." },
        ];

        logEvents.forEach(evt => {
            const timer = setTimeout(() => addLog(evt.m), evt.t);
            timers.push(timer);
        });

        // Phase Transitions
        TIMELINE.forEach((time, index) => {
            if (index === 0) return;
            const timer = setTimeout(() => {
                setPhase(index);
                if (index === TIMELINE.length - 1) setIsPlaying(false);
            }, time);
            timers.push(timer);
        });

        return () => timers.forEach(clearTimeout);
    }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleReplay = () => {
        setPhase(0);
        setLogs([]);
        setIsPlaying(true);
        if (onReplay) onReplay();
    };

    return (
        <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative flex flex-col font-sans select-none border border-slate-800 shadow-2xl">
            {/* Header / Timeline */}
            <div className="bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        <h3 className="text-slate-200 font-bold text-lg tracking-wide">Orchestration Trace</h3>
                    </div>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    <div className="flex gap-1.5">
                        {TIMELINE.slice(0, -1).map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-16 h-1.5 rounded-full transition-all duration-700 ${phase >= idx ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Live Console */}
                <div className="hidden md:flex flex-col items-end w-96">
                    <div className="font-mono text-[10px] text-slate-500 mb-1 uppercase tracking-wider">System Logs</div>
                    <div className="font-mono text-xs text-cyan-400/80 text-right w-full whitespace-nowrap overflow-hidden">
                        {logs.slice(-1)[0] || "Ready..."}
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative p-12 flex flex-col items-center justify-center gap-12 overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">

                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>
                <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)"></div>

                {/* 1. User Query Node */}
                <div className={`relative z-10 transition-all duration-1000 transform ${phase >= 0 ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 -translate-y-8 blur-sm'}`}>
                    <div className="bg-slate-800/80 backdrop-blur border border-blue-500/30 rounded-full px-8 py-4 flex items-center gap-5 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20">
                        <span className="text-3xl filter drop-shadow-md">👤</span>
                        <div className="text-left">
                            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-0.5">Input Stream</div>
                            <div className="text-white font-mono text-lg">"Analyze GLP-1 market in obesity"</div>
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className={`absolute left-1/2 -bottom-12 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 transform -translate-x-1/2 ${phase >= 1 ? 'h-12 opacity-100' : 'h-0 opacity-0'}`}>
                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7] ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                </div>

                {/* 2. Master Orchestrator */}
                <div className={`relative z-10 transition-all duration-1000 delay-200 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 w-80 shadow-[0_0_40px_rgba(168,85,247,0.1)] relative overflow-hidden group">
                        {/* Scanning line effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20 animate-scan"></div>

                        <div className="flex justify-between items-center mb-4">
                            <span className="text-3xl">🧠</span>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-purple-300 font-bold uppercase">Orchestrator</span>
                                <span className="text-[9px] text-purple-500">v2.4.0-stable</span>
                            </div>
                        </div>

                        {/* Orchestration Steps */}
                        <div className="space-y-3 font-mono text-sm">
                            <div className={`flex items-center gap-3 transition-all duration-500 ${phase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${phase >= 1 ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' : 'bg-slate-700'}`}></div>
                                <span className="text-slate-300">Decomposing Query</span>
                                {phase >= 1 && <span className="text-purple-400 ml-auto animate-pulse">...</span>}
                            </div>
                            <div className={`flex items-center gap-3 transition-all duration-500 delay-1000 ${phase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${phase >= 2 ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' : 'bg-slate-700'}`}></div>
                                <span className="text-slate-300">Routing Agents</span>
                                {phase >= 2 && <span className="text-green-400 ml-auto text-xs">READY</span>}
                            </div>
                        </div>
                    </div>

                    {/* Fan-out Lines */}
                    <div className={`absolute top-full left-1/2 w-full h-12 transform -translate-x-1/2 transition-all duration-1000 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                        <svg className="w-[800px] h-16 -ml-[268px] overflow-visible">
                            <defs>
                                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#22d3ee" />
                                </linearGradient>
                            </defs>
                            {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
                                <path
                                    key={i}
                                    d={`M400,0 C400,20 ${400 + (i * 110)},20 ${400 + (i * 110)},60`}
                                    fill="none"
                                    stroke="url(#lineGrad)"
                                    strokeWidth="1.5"
                                    className="drop-shadow-[0_0_3px_rgba(168,85,247,0.5)]"
                                    strokeDasharray="100"
                                    strokeDashoffset={phase >= 3 ? 0 : 100}
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                            ))}
                        </svg>
                    </div>
                </div>

                {/* 3. Worker Agents */}
                <div className={`grid grid-cols-7 gap-3 w-full max-w-5xl relative z-10 transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {[
                        { id: 'IQ', name: 'IQVIA', color: 'text-indigo-400', border: 'border-indigo-500/30', icon: '📊' },
                        { id: 'EX', name: 'EXIM', color: 'text-emerald-400', border: 'border-emerald-500/30', icon: '🚢' },
                        { id: 'Pa', name: 'Patent', color: 'text-amber-400', border: 'border-amber-500/30', icon: '📜' },
                        { id: 'Tr', name: 'Trials', color: 'text-red-400', border: 'border-red-500/30', icon: '🔬' },
                        { id: 'In', name: 'Internal', color: 'text-violet-400', border: 'border-violet-500/30', icon: '📁' },
                        { id: 'We', name: 'Web', color: 'text-pink-400', border: 'border-pink-500/30', icon: '🌐' },
                        { id: 'Re', name: 'Report', color: 'text-cyan-400', border: 'border-cyan-500/30', icon: '📝' }
                    ].map((agent, i) => (
                        <div key={agent.id}
                            className={`bg-slate-900/80 backdrop-blur rounded-lg p-3 border ${agent.border} flex flex-col items-center gap-2 transition-all duration-500 relative overflow-hidden group hover:bg-slate-800`}
                            style={{
                                transitionDelay: `${i * 150}ms`,
                                transform: phase >= 3 ? 'scale(1)' : 'scale(0.9)',
                                boxShadow: phase >= 3 && phase < 5 ? `0 0 20px -5px ${agent.color.replace('text-', '#')}` : 'none'
                            }}
                        >
                            {/* Active Pulse Background */}
                            <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-current opacity-5 pointer-events-none transition-opacity duration-500 ${phase >= 3 && phase < 5 ? 'opacity-20' : 'opacity-0'}`} style={{ color: agent.color.replace('text-', '') }}></div>

                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-800/50 ${agent.color} border border-white/5`}>
                                {agent.icon}
                            </div>
                            <div className="text-xs text-white font-bold tracking-wider">{agent.id}</div>
                            <div className="text-[9px] text-slate-500 uppercase">{agent.name}</div>

                            {/* Processing Indicator */}
                            {phase >= 3 && phase < 5 && (
                                <div className="w-full flex justify-center mt-2">
                                    <div className="flex gap-1">
                                        <div className={`w-1 h-1 rounded-full ${agent.color.replace('text-', 'bg-')} animate-bounce`} style={{ animationDelay: '0s' }}></div>
                                        <div className={`w-1 h-1 rounded-full ${agent.color.replace('text-', 'bg-')} animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                                        <div className={`w-1 h-1 rounded-full ${agent.color.replace('text-', 'bg-')} animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Done Check */}
                            {phase >= 5 && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_8px_#22c55e] animate-scale-in">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 4. Synthesis & Output */}
                <div className={`relative z-10 transition-all duration-1000 ${phase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    {/* Connecting Lines */}
                    <div className={`absolute bottom-full left-1/2 w-full h-12 transform -translate-x-1/2 transition-all duration-1000 ${phase >= 6 ? 'opacity-100' : 'opacity-0'}`}>
                        <svg className="w-[800px] h-16 -ml-[268px] overflow-visible">
                            {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
                                <path
                                    key={i}
                                    d={`M${400 + (i * 110)},0 C${400 + (i * 110)},40 400,20 400,60`}
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="1"
                                    opacity="0.3"
                                />
                            ))}
                        </svg>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.15)] flex items-center gap-10 min-w-[600px] relative overflow-hidden">
                        {/* Shimmer border */}
                        <div className="absolute inset-0 border-2 border-transparent rounded-2xl bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent w-[200%] animate-shimmer pointer-events-none"></div>

                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center text-4xl shadow-lg ring-4 ring-cyan-500/20">
                                📄
                            </div>
                            <div className="text-white font-bold text-lg">Final Output</div>
                        </div>

                        <div className="h-20 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

                        <div className="flex-1 grid grid-cols-3 gap-6 relative z-10">
                            {[
                                { label: 'PDF Report', sub: 'Comprehensive', icon: '📊', delay: 0 },
                                { label: 'Excel Data', sub: 'Raw Dataset', icon: '📈', delay: 200 },
                                { label: 'Dashboard', sub: 'Interactive', icon: '🖥️', delay: 400 }
                            ].map((item) => (
                                <div key={item.label} className={`flex flex-col items-center gap-2 transition-all duration-500 transform ${phase >= 7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${item.delay}ms` }}>
                                    <div className="bg-slate-800 p-3 rounded-xl text-2xl shadow-inner border border-slate-700">{item.icon}</div>
                                    <div className="text-center">
                                        <div className="text-sm text-cyan-100 font-bold">{item.label}</div>
                                        <div className="text-[10px] text-cyan-400/60 uppercase tracking-wide">{item.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Control Bar */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                    <span>CPU: 12%</span>
                    <span>MEM: 480MB</span>
                    <span>NET: 450Mbps</span>
                </div>

                {!isPlaying ? (
                    <button
                        onClick={handleReplay}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        Replay Simulation
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-slate-300 text-sm font-medium">Running Simulation...</span>
                    </div>
                )}

                <div className="text-xs text-slate-600 font-mono">
                    ID: {new Date().getTime().toString().slice(-8)}
                </div>
            </div>

            <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
         @keyframes shimmer {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(-100%); }
          100% { width: 100%; transform: translateX(0); }
        }
        .animate-loading-bar {
          animation-name: loading-bar;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
        </div>
    );
};

export default AnimatedArchitectureVideo;
