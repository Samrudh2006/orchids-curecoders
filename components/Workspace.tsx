import React, { useState, useRef } from 'react';
import { AgentName, AgentStatus } from '../types';
import { QUICK_PROMPTS } from '../constants';
import AgentCard from './AgentCard';
import Dashboard from './Dashboard';
import Report from './Report';
import { Sparkles, UploadCloud, X, History as HistoryIcon, ChevronDown } from './Icons';
import { useAppContext } from '../hooks/useAppContext';

const Workspace = () => {
    const { 
        agents, 
        summary, 
        isOrchestrating, 
        isReportReady, 
        error, 
        currentRunPrompt, 
        uploadedFile, 
        setUploadedFile,
        runMasterAgent,
        searchHistory,
    } = useAppContext();

    const [prompt, setPrompt] = useState('');
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingPpt, setIsExportingPpt] = useState(false);
    const [showAllPrompts, setShowAllPrompts] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setUploadedFile(event.target.files[0]);
        }
    };
    
    const handleReplay = (pastPrompt: string) => {
        setPrompt(pastPrompt);
        runMasterAgent(pastPrompt);
    };

    const handleDownloadPdf = async () => {
        const reportElement = reportRef.current;

        // @ts-ignore
        if (!reportElement || typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            console.error("html2canvas or jspdf is not defined");
            alert("PDF libraries not loaded. Please refresh the page and try again.");
            return;
        }

        setIsDownloadingPdf(true);

        const reportContainer = reportElement.parentElement;
        if (reportContainer) {
            reportContainer.style.visibility = 'visible';
            reportContainer.style.position = 'absolute';
            reportContainer.style.left = '0';
            reportContainer.style.top = '0';
            reportContainer.style.zIndex = '-1';
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            // @ts-ignore
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: true,
                width: reportElement.scrollWidth,
                height: reportElement.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            // @ts-ignore
            const { jsPDF } = window.jspdf;

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            const pdf = new jsPDF('p', 'mm', 'a4');

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`CureCoders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (e) {
             console.error("Error generating PDF:", e);
             alert(`Failed to generate PDF: ${e.message || 'Unknown error'}`);
        } finally {
            if (reportContainer) {
                reportContainer.style.visibility = 'hidden';
                reportContainer.style.position = 'fixed';
                reportContainer.style.left = '-9999px';
                reportContainer.style.zIndex = '';
            }
            setIsDownloadingPdf(false);
        }
    };

    const handleExportExcel = () => {
        // @ts-ignore
        if (typeof XLSX === 'undefined') return;

        setIsExportingExcel(true);
        try {
            // @ts-ignore
            const wb = XLSX.utils.book_new();
            
            const cleanSummary = summary.replace(/\*\*(.*?)\*\*/g, '$1').replace(/<br \/>/g, '\n');
            const summaryData = [{ Section: "Initial Query", Content: currentRunPrompt }, { Section: "Executive Summary", Content: cleanSummary }];
            // @ts-ignore
            const summaryWs = XLSX.utils.json_to_sheet(summaryData, { header: ["Section", "Content"], skipHeader: true });
            // @ts-ignore
            XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

            agents.forEach(agent => {
                if (agent.status === AgentStatus.DONE && agent.result) {
                    let sheetData: any[] | null = null;
                    const sheetName = agent.name.replace(/[\\/*?[\]:]/g, "").substring(0, 31);

                    switch (agent.name) {
                        case AgentName.MARKET_DATA: sheetData = agent.result[AgentName.MARKET_DATA]?.topCompetitors || null; break;
                        case AgentName.PATENTS: sheetData = agent.result[AgentName.PATENTS]?.patents || null; break;
                        case AgentName.CLINICAL: sheetData = agent.result[AgentName.CLINICAL]?.trials || null; break;
                        case AgentName.EXIM: 
                           const eximData = agent.result[AgentName.EXIM];
                           if (eximData) {
                               sheetData = [
                                   ...eximData.exportVolumes.map(d => ({ Type: "Export Volume", ...d })),
                                   ...eximData.topSourcingCountries.map(d => ({ Type: "Sourcing Country", ...d }))
                               ];
                           }
                           break;
                    }

                    if (sheetData && sheetData.length > 0) {
                        // @ts-ignore
                        const ws = XLSX.utils.json_to_sheet(sheetData);
                        // @ts-ignore
                        XLSX.utils.book_append_sheet(wb, ws, sheetName);
                    }
                }
            });

            // @ts-ignore
            XLSX.writeFile(wb, `CureCoders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (e) {
            console.error("Error exporting to Excel:", e);
        } finally {
            setIsExportingExcel(false);
        }
    };

    const handleExportPpt = () => {
        // @ts-ignore
        if (typeof PptxGenJS === 'undefined') return;

        setIsExportingPpt(true);
        try {
            // @ts-ignore
            let pptx = new PptxGenJS();
            pptx.layout = 'LAYOUT_WIDE';
            
            pptx.addSlide().addText([
                { text: "CureCoders AI Research Report", options: { fontSize: 32, bold: true, color: "4338CA" } },
                { text: `Query: ${currentRunPrompt}`, options: { fontSize: 18, breakLine: true, color: "64748B" } }
            ], { x: 0.5, y: 2.0, w: '90%' });

            const cleanSummary = summary.replace(/\*\*(.*?)\*\*/g, '$1');
            pptx.addSlide()
                .addText("Executive Summary", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "4338CA" })
                .addText(cleanSummary, { x: 0.5, y: 1.2, w: '90%', h: '75%', fontSize: 14 });

            agents.forEach(agent => {
                if (agent.status === AgentStatus.DONE && agent.result && agent.name !== AgentName.DECOMPOSITION && agent.name !== AgentName.SYNTHESIS && agent.name !== AgentName.REPORT_GENERATOR) {
                    const slide = pptx.addSlide();
                    slide.addText(agent.name, { x: 0.5, y: 0.5, w: '90%', fontSize: 20, bold: true, color: "4338CA" });

                    switch (agent.name) {
                        case AgentName.MARKET_DATA:
                            const iqviaData = agent.result[AgentName.MARKET_DATA];
                            if (iqviaData?.topCompetitors) {
                                const rows = [["Competitor", "Market Share"]];
                                iqviaData.topCompetitors.forEach(c => rows.push([c.name, c.share]));
                                slide.addTable(rows, { x: 0.5, y: 1.2, w: 5.5, colW: [3, 2.5] });
                                const chartData = iqviaData.topCompetitors.map(c => ({
                                    name: c.name,
                                    labels: ['Share'],
                                    values: [parseFloat(c.share.replace('%','')) || 0]
                                }));
                                slide.addChart(pptx.ChartType.bar, chartData, { x: 6.5, y: 1.2, w: 4, h: 3, title: 'Competitor Share' });
                            }
                            break;
                        case AgentName.PATENTS:
                            const patentData = agent.result[AgentName.PATENTS];
                            if (patentData?.patents) {
                                const rows = [["Title", "Owner", "Expiry", "Risk"]];
                                patentData.patents.forEach(p => rows.push([p.title, p.owner, p.expiryDate, p.ftRisk]));
                                slide.addTable(rows, { x: 0.5, y: 1.2, w: '90%', colW: [4, 2, 2, 1] });
                            }
                            break;
                        case AgentName.CLINICAL:
                            const clinicalData = agent.result[AgentName.CLINICAL];
                            if (clinicalData?.trials) {
                                const rows = [["ID", "Title", "Phase", "Status", "Sponsor"]];
                                clinicalData.trials.forEach(t => rows.push([t.id, t.title, t.phase, t.status, t.sponsor]));
                                slide.addTable(rows, { x: 0.5, y: 1.2, w: '90%', colW: [1, 3.5, 0.75, 1.25, 2.5] });
                            }
                            break;
                    }
                }
            });

            pptx.writeFile({ fileName: `CureCoders_Presentation_${new Date().toISOString().split('T')[0]}.pptx` });

        } catch (e) {
            console.error("Error exporting to PowerPoint:", e);
        } finally {
            setIsExportingPpt(false);
        }
    };


    return (
        <div id="workspace" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-16">
            <div className="max-w-4xl mx-auto">
                { agents.length === 0 && (
                    <>
                        <h2 className="font-display text-3xl font-bold text-center">Master Agent Workspace</h2>
                        <p className="mt-4 text-center text-slate-500 dark:text-slate-400">
                            Enter your research query, upload an internal document, and deploy autonomous AI agents.
                        </p>
                    </>
                )}

                <div className="mt-8">
                    { agents.length === 0 && (
                        <>
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., Show market size trends for GLP-1 agonists in obesity."
                                    rows={4}
                                    className="w-full p-4 pr-32 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary focus:ring-primary dark:focus:border-primary transition duration-300"
                                    disabled={isOrchestrating}
                                />
                                <button
                                    onClick={() => runMasterAgent(prompt)}
                                    disabled={!prompt.trim() || isOrchestrating}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-light disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                                >
                                <Sparkles className="w-5 h-5" />
                                {isOrchestrating ? 'Running...' : 'Run Agents'}
                                </button>
                            </div>
                            
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isOrchestrating}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                                >
                                    <UploadCloud className="w-5 h-5" />
                                    {uploadedFile ? 'Change Document' : 'Upload Internal Document'}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                {uploadedFile && (
                                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded max-w-xs">
                                        <span className="truncate">{uploadedFile.name}</span>
                                        <button onClick={() => setUploadedFile(null)} className="ml-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 text-center sm:text-left">
                                    Or, try one of our instant queries:
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {(showAllPrompts ? QUICK_PROMPTS : QUICK_PROMPTS.slice(0, 6)).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => { setPrompt(p); runMasterAgent(p); }}
                                            disabled={isOrchestrating}
                                            className="text-left text-sm p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary-light transition-all duration-200 disabled:opacity-50"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                {QUICK_PROMPTS.length > 6 && (
                                    <div className="mt-4 text-center">
                                        <button 
                                            onClick={() => setShowAllPrompts(!showAllPrompts)}
                                            className="flex items-center gap-2 mx-auto text-sm font-semibold text-primary hover:underline"
                                        >
                                            {showAllPrompts ? 'Show Fewer Queries' : 'Show All 30+ Queries'}
                                            <ChevronDown className={`w-4 h-4 transition-transform ${showAllPrompts ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {searchHistory.length > 0 && !isOrchestrating && agents.length === 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Recent Queries</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {searchHistory.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleReplay(item.prompt)}
                                    disabled={isOrchestrating}
                                    className="flex items-center gap-2 pl-3 pr-2 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 disabled:opacity-50 transition-colors"
                                >
                                    <span className="truncate max-w-xs">{item.prompt}</span>
                                    <HistoryIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {error && (
                    <div className="mt-8 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 rounded-lg">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {isOrchestrating && agents.length > 0 && (
                    <div className="mt-12">
                        <div className="text-center mb-6">
                             <h3 className="font-display text-2xl font-bold">AI Agents at Work...</h3>
                             <p className="text-slate-500 dark:text-slate-400">Your request is being processed by our autonomous agent team.</p>
                        </div>
                        <div className="space-y-4">
                            {agents.map((agent) => (
                               <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    </div>
                )}
                
                {!isOrchestrating && summary && (
                    <Dashboard 
                        prompt={currentRunPrompt}
                        summary={summary}
                        agents={agents}
                        isReportReady={isReportReady}
                        isDownloadingPdf={isDownloadingPdf}
                        isExportingExcel={isExportingExcel}
                        isExportingPpt={isExportingPpt}
                        onDownloadPdf={handleDownloadPdf}
                        onExportExcel={handleExportExcel}
                        onExportPpt={handleExportPpt}
                    />
                )}
                
                {isReportReady && (
                    <div style={{ position: 'fixed', left: '-9999px', top: 0, visibility: 'hidden' }}>
                        <div ref={reportRef}>
                            <Report prompt={currentRunPrompt} summary={summary} agents={agents} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workspace;
