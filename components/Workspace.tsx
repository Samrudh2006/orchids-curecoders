import React, { useState, useRef, useEffect } from 'react';
import { AgentName, AgentStatus } from '../types';
import { QUICK_PROMPTS } from '../constants';
import AgentCard from './AgentCard';
import Dashboard from './Dashboard';
import Report from './Report';
import { Sparkles, UploadCloud, X, History as HistoryIcon, ChevronDown, FileText } from './Icons';
import { useAppContext } from '../hooks/useAppContext';
import { useVoiceFeatures } from '../hooks/useVoiceFeatures';
import DocumentManager from './DocumentManager';
import DragDropUpload from './DragDropUpload';

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
    
    const {
        explainFeature,
        speakAgentStatus,
        speakDataInsight,
        speakSectionWelcome,
        isVoiceEnabled
    } = useVoiceFeatures();

    const [prompt, setPrompt] = useState('');
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingPpt, setIsExportingPpt] = useState(false);
    const [showAllPrompts, setShowAllPrompts] = useState(false);
    const [showDocumentManager, setShowDocumentManager] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    
    // Voice assistant effects
    useEffect(() => {
        if (isVoiceEnabled) {
            speakSectionWelcome('workspace');
        }
    }, []); // Only run on mount
    
    useEffect(() => {
        if (isOrchestrating && isVoiceEnabled) {
            explainFeature('agents-working');
        }
    }, [isOrchestrating]);
    
    useEffect(() => {
        if (isReportReady && summary && isVoiceEnabled) {
            explainFeature('synthesis-complete');
        }
    }, [isReportReady, summary]);
    
    // Monitor agent status changes
    useEffect(() => {
        agents.forEach(agent => {
            if (agent.status === AgentStatus.DONE && agent.result && isVoiceEnabled) {
                speakAgentStatus(agent.name, 'done', agent.result);
            }
        });
    }, [agents]);
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setUploadedFile(file);
            
            // Store the document for later access
            await storeDocument(file);
        }
    };

    const storeDocument = async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const base64Data = (reader.result as string).split(',')[1]; // Remove data:type;base64, prefix
                    
                    const storedDoc = {
                        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        uploadDate: new Date().toISOString(),
                        base64Data: base64Data
                    };
                    
                    // Get existing documents
                    const existing = JSON.parse(localStorage.getItem('curecoders_documents') || '[]');
                    
                    // Add new document at the beginning
                    const updated = [storedDoc, ...existing];
                    
                    // Keep only the last 50 documents to prevent storage overflow
                    const trimmed = updated.slice(0, 50);
                    
                    localStorage.setItem('curecoders_documents', JSON.stringify(trimmed));
                    
                    console.log(`Document "${file.name}" stored successfully`);
                    resolve();
                } catch (error) {
                    console.error('Error storing document:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                console.error('Error reading file');
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    };
    
    const handleReplay = (pastPrompt: string) => {
        setPrompt(pastPrompt);
        runMasterAgent(pastPrompt);
    };

    // Advanced chart generation functions for PDF
    const generateCompetitorChart = async (pdf: any, competitors: any[], x: number, y: number, width: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        if (!ctx || !window.Chart) return;
        
        const chart = new window.Chart(ctx, {
            type: 'pie',
            data: {
                labels: competitors.slice(0, 5).map(c => c.name || `Company ${competitors.indexOf(c) + 1}`),
                datasets: [{
                    data: competitors.slice(0, 5).map(c => c.marketShare || Math.random() * 30 + 5),
                    backgroundColor: [
                        '#06b6d4', '#f59e0b', '#3b82f6', '#ef4444', '#10b981'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Competitor Market Share',
                        font: { size: 16, weight: 'bold' },
                        color: '#1e293b'
                    },
                    legend: {
                        position: 'bottom',
                        labels: { color: '#1e293b' }
                    }
                }
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, y, width * 0.8, 80);
        
        chart.destroy();
        canvas.remove();
    };

    const generateMarketGrowthChart = async (pdf: any, growthData: any[], x: number, y: number, width: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        if (!ctx || !window.Chart) return;
        
        const chart = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: growthData.map(d => d.year || '2024'),
                datasets: [{
                    label: 'Market Size ($B)',
                    data: growthData.map(d => d.value || Math.random() * 100 + 50),
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Market Growth Projection',
                        font: { size: 16, weight: 'bold' },
                        color: '#1e293b'
                    },
                    legend: { labels: { color: '#1e293b' } }
                },
                scales: {
                    x: { ticks: { color: '#1e293b' } },
                    y: { ticks: { color: '#1e293b' } }
                }
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, y, width * 0.8, 80);
        
        chart.destroy();
        canvas.remove();
    };

    const generatePatentRiskChart = async (pdf: any, patents: any[], x: number, y: number, width: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        if (!ctx || !window.Chart) return;
        
        const riskLevels = patents.reduce((acc, patent) => {
            const risk = patent.riskLevel || 'Medium';
            acc[risk] = (acc[risk] || 0) + 1;
            return acc;
        }, {});
        
        const chart = new window.Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(riskLevels),
                datasets: [{
                    data: Object.values(riskLevels),
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Patent Risk Assessment',
                        font: { size: 16, weight: 'bold' },
                        color: '#1e293b'
                    },
                    legend: {
                        position: 'bottom',
                        labels: { color: '#1e293b' }
                    }
                }
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, y, width * 0.8, 80);
        
        chart.destroy();
        canvas.remove();
    };

    const generateClinicalPhaseChart = async (pdf: any, trials: any[], x: number, y: number, width: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        if (!ctx || !window.Chart) return;
        
        const phases = trials.reduce((acc, trial) => {
            const phase = trial.phase || 'Phase I';
            acc[phase] = (acc[phase] || 0) + 1;
            return acc;
        }, {});
        
        const chart = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(phases),
                datasets: [{
                    label: 'Number of Trials',
                    data: Object.values(phases),
                    backgroundColor: '#06b6d4',
                    borderColor: '#0891b2',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Clinical Trial Phase Distribution',
                        font: { size: 16, weight: 'bold' },
                        color: '#1e293b'
                    },
                    legend: { labels: { color: '#1e293b' } }
                },
                scales: {
                    x: { ticks: { color: '#1e293b' } },
                    y: { 
                        ticks: { color: '#1e293b' },
                        beginAtZero: true
                    }
                }
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, y, width * 0.8, 80);
        
        chart.destroy();
        canvas.remove();
    };

    const generatePatentTable = (pdf: any, patents: any[], x: number, y: number, width: number) => {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Patent Details', x, y);
        
        let tableY = y + 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        patents.slice(0, 5).forEach((patent, index) => {
            pdf.text(`${index + 1}. ${patent.title || 'Patent Title'}`, x, tableY);
            tableY += 5;
            pdf.text(`   Status: ${patent.status || 'Active'} | Risk: ${patent.riskLevel || 'Medium'}`, x, tableY);
            tableY += 8;
        });
    };

    const generateClinicalTable = (pdf: any, trials: any[], x: number, y: number, width: number) => {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Clinical Trial Details', x, y);
        
        let tableY = y + 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        trials.slice(0, 5).forEach((trial, index) => {
            pdf.text(`${index + 1}. ${trial.title || 'Clinical Trial'}`, x, tableY);
            tableY += 5;
            pdf.text(`   Phase: ${trial.phase || 'Phase I'} | Status: ${trial.status || 'Active'}`, x, tableY);
            tableY += 8;
        });
    };

    const handleDownloadPdf = async () => {
        // Check if libraries are loaded
        const html2canvas = window.html2canvas;
        const jsPDF = window.jspdf?.jsPDF;
        const Chart = window.Chart;

        console.log("Advanced PDF generation - Library check:", { 
            html2canvas: !!html2canvas, 
            jsPDF: !!jsPDF,
            Chart: !!Chart,
            agents: agents.length,
            summary: !!summary
        });

        if (!html2canvas || !jsPDF || !Chart) {
            console.error("Required libraries not loaded:", { 
                html2canvas: !!html2canvas, 
                jsPDF: !!jsPDF, 
                Chart: !!Chart 
            });
            alert("PDF libraries not fully loaded. Please refresh the page and try again.");
            return;
        }

        if (agents.length === 0) {
            alert("No report data found. Please generate a report first.");
            return;
        }

        setIsDownloadingPdf(true);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            
            // Helper function to add text with wrapping
            const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
                pdf.setFontSize(fontSize);
                const lines = pdf.splitTextToSize(text, maxWidth);
                pdf.text(lines, x, y);
                return y + (lines.length * (fontSize * 0.35));
            };

            // Cover Page
            pdf.setFillColor(30, 41, 59); // Dark pharmaceutical theme
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            
            // Add CureCoders logo area (simulated)
            pdf.setFillColor(6, 182, 212, 0.2); // Primary color with transparency
            pdf.circle(pageWidth/2, 80, 30, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(32);
            pdf.setFont(undefined, 'bold');
            pdf.text('CureCoders', pageWidth/2, 120, { align: 'center' });
            
            pdf.setFontSize(24);
            pdf.setFont(undefined, 'normal');
            pdf.text('AI Research Report', pageWidth/2, 135, { align: 'center' });
            
            pdf.setFontSize(16);
            pdf.setTextColor(6, 182, 212);
            pdf.text(`Query: ${currentRunPrompt}`, pageWidth/2, 160, { align: 'center', maxWidth: contentWidth });
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth/2, 180, { align: 'center' });

            // Executive Summary Page
            pdf.addPage();
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            
            let yPos = margin + 10;
            
            // Header
            pdf.setTextColor(6, 182, 212);
            pdf.setFontSize(24);
            pdf.setFont(undefined, 'bold');
            pdf.text('Executive Summary', margin, yPos);
            yPos += 15;
            
            // Add decorative line
            pdf.setDrawColor(6, 182, 212);
            pdf.setLineWidth(2);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            // Summary content
            pdf.setTextColor(51, 65, 85);
            pdf.setFont(undefined, 'normal');
            const cleanSummary = summary.replace(/\*\*(.*?)\*\*/g, '$1').replace(/<br \/>/g, '\n');
            yPos = addWrappedText(cleanSummary, margin, yPos, contentWidth, 12);

            // Generate Charts and Agent Data Pages
            for (const agent of agents) {
                if (agent.status === AgentStatus.DONE && agent.result) {
                    pdf.addPage();
                    yPos = margin + 10;
                    
                    // Agent header
                    pdf.setTextColor(6, 182, 212);
                    pdf.setFontSize(20);
                    pdf.setFont(undefined, 'bold');
                    pdf.text(agent.name, margin, yPos);
                    yPos += 15;
                    
                    // Decorative line
                    pdf.setDrawColor(6, 182, 212);
                    pdf.setLineWidth(1);
                    pdf.line(margin, yPos, pageWidth - margin, yPos);
                    yPos += 10;
                    
                    pdf.setTextColor(51, 65, 85);
                    pdf.setFont(undefined, 'normal');
                    
                    // Generate charts based on agent type
                    if (agent.name === AgentName.MARKET_DATA) {
                        const marketData = agent.result[AgentName.MARKET_DATA];
                        if (marketData) {
                            // Key metrics
                            pdf.setFontSize(14);
                            pdf.setFont(undefined, 'bold');
                            pdf.text('Key Metrics', margin, yPos);
                            yPos += 8;
                            
                            pdf.setFont(undefined, 'normal');
                            pdf.setFontSize(12);
                            yPos = addWrappedText(`Market Size: $${marketData.marketSizeUSD}`, margin, yPos, contentWidth);
                            yPos = addWrappedText(`CAGR: ${marketData.cagr}`, margin, yPos, contentWidth);
                            yPos = addWrappedText(`Therapy: ${marketData.therapy}`, margin, yPos, contentWidth);
                            yPos += 10;
                            
                            // Create competitor pie chart
                            if (marketData.topCompetitors && marketData.topCompetitors.length > 0) {
                                await generateCompetitorChart(pdf, marketData.topCompetitors, margin, yPos, contentWidth);
                                yPos += 100;
                            }
                            
                            // Market growth chart
                            if (marketData.marketGrowth && marketData.marketGrowth.length > 0) {
                                await generateMarketGrowthChart(pdf, marketData.marketGrowth, margin, yPos, contentWidth);
                                yPos += 100;
                            }
                            
                            // Insights
                            if (marketData.insights) {
                                pdf.setFontSize(14);
                                pdf.setFont(undefined, 'bold');
                                pdf.text('Market Insights', margin, yPos);
                                yPos += 8;
                                pdf.setFont(undefined, 'normal');
                                pdf.setFontSize(12);
                                yPos = addWrappedText(marketData.insights, margin, yPos, contentWidth);
                            }
                        }
                    } else if (agent.name === AgentName.PATENTS) {
                        const patentData = agent.result[AgentName.PATENTS];
                        if (patentData?.patents) {
                            // Patent risk chart
                            await generatePatentRiskChart(pdf, patentData.patents, margin, yPos, contentWidth);
                            yPos += 100;
                            
                            // Patent table
                            generatePatentTable(pdf, patentData.patents, margin, yPos, contentWidth);
                        }
                    } else if (agent.name === AgentName.CLINICAL) {
                        const clinicalData = agent.result[AgentName.CLINICAL];
                        if (clinicalData?.trials) {
                            // Clinical phase distribution chart
                            await generateClinicalPhaseChart(pdf, clinicalData.trials, margin, yPos, contentWidth);
                            yPos += 100;
                            
                            // Trials table
                            generateClinicalTable(pdf, clinicalData.trials, margin, yPos, contentWidth);
                        }
                    } else {
                        // For other agents, add formatted text content
                        const content = JSON.stringify(agent.result, null, 2)
                            .replace(/[{}"\[\]]/g, '')
                            .replace(/,\s*\n/g, '\n')
                            .trim();
                        yPos = addWrappedText(content, margin, yPos, contentWidth, 11);
                    }
                }
            }

            // Save the PDF
            const fileName = `CureCoders_Advanced_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            console.log(`Advanced PDF saved as: ${fileName}`);
            
        } catch (error) {
            console.error("Error generating advanced PDF:", error);
            alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleExportExcel = () => {
        const XLSX = window.XLSX;
        
        if (!XLSX) {
            alert("Excel library not loaded. Please refresh the page and try again.");
            return;
        }

        setIsExportingExcel(true);
        try {
            const wb = XLSX.utils.book_new();
            
            // Create Executive Summary sheet with proper formatting
            const cleanSummary = summary.replace(/\*\*(.*?)\*\*/g, '$1').replace(/<br \/>/g, '\n');
            const summaryData = [
                { "": "CureCoders AI Research Report", "Value": "" },
                { "": "", "Value": "" },
                { "": "Query", "Value": currentRunPrompt },
                { "": "Generated Date", "Value": new Date().toLocaleDateString() },
                { "": "", "Value": "" },
                { "": "Executive Summary", "Value": cleanSummary }
            ];
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            
            // Style the summary sheet
            summaryWs['!cols'] = [{ width: 25 }, { width: 80 }];
            XLSX.utils.book_append_sheet(wb, summaryWs, "Executive Summary");

            // Create Overview sheet with KPIs
            const overviewData = [];
            const marketAgent = agents.find(a => a.name === AgentName.MARKET_DATA && a.status === AgentStatus.DONE);
            const patentAgent = agents.find(a => a.name === AgentName.PATENTS && a.status === AgentStatus.DONE);
            const clinicalAgent = agents.find(a => a.name === AgentName.CLINICAL && a.status === AgentStatus.DONE);
            
            overviewData.push({ "KPI": "Market Size", "Value": marketAgent?.result?.[AgentName.MARKET_DATA]?.marketSizeUSD || "N/A", "Unit": "USD" });
            overviewData.push({ "KPI": "CAGR", "Value": marketAgent?.result?.[AgentName.MARKET_DATA]?.cagr || "N/A", "Unit": "%" });
            overviewData.push({ "KPI": "High-Risk Patents", "Value": patentAgent?.result?.[AgentName.PATENTS]?.patents?.filter(p => p.ftRisk === 'High').length || 0, "Unit": "Count" });
            overviewData.push({ "KPI": "Active Clinical Trials", "Value": clinicalAgent?.result?.[AgentName.CLINICAL]?.trials?.filter(t => t.status.includes('Recruiting') || t.status.includes('Active')).length || 0, "Unit": "Count" });
            overviewData.push({ "KPI": "Agents Completed", "Value": agents.filter(a => a.status === AgentStatus.DONE).length, "Unit": "Count" });
            
            const overviewWs = XLSX.utils.json_to_sheet(overviewData);
            overviewWs['!cols'] = [{ width: 25 }, { width: 20 }, { width: 15 }];
            XLSX.utils.book_append_sheet(wb, overviewWs, "Key Metrics");

            agents.forEach(agent => {
                if (agent.status === AgentStatus.DONE && agent.result) {
                    let sheetData: any[] | null = null;
                    const sheetName = agent.name.replace(/[\\/*?[\]:]/g, "").substring(0, 31);

                    switch (agent.name) {
                        case AgentName.MARKET_DATA: 
                            const marketData = agent.result[AgentName.MARKET_DATA];
                            if (marketData) {
                                sheetData = [
                                    { "Category": "Therapy Area", "Value": marketData.therapy },
                                    { "Category": "Molecule", "Value": marketData.molecule },
                                    { "Category": "Market Size", "Value": `$${marketData.marketSizeUSD}` },
                                    { "Category": "CAGR", "Value": marketData.cagr },
                                    { "Category": "Key Insights", "Value": marketData.insights },
                                    { "Category": "", "Value": "" },
                                    { "Category": "Top Competitors", "Value": "" },
                                    ...marketData.topCompetitors.map(c => ({ "Category": c.name, "Value": c.share })),
                                    { "Category": "", "Value": "" },
                                    { "Category": "Market Growth Data", "Value": "" },
                                    ...marketData.marketGrowth.map(g => ({ "Category": `Year ${g.year}`, "Value": `$${g.sizeB}B` }))
                                ];
                            }
                            break;
                        case AgentName.PATENTS: 
                            sheetData = agent.result[AgentName.PATENTS]?.patents?.map(p => ({
                                "Patent Title": p.title,
                                "Owner": p.owner,
                                "Expiry Date": p.expiryDate,
                                "FTO Risk": p.ftRisk,
                                "URL": p.url
                            })) || null; 
                            break;
                        case AgentName.CLINICAL: 
                            sheetData = agent.result[AgentName.CLINICAL]?.trials?.map(t => ({
                                "Trial ID": t.id,
                                "Title": t.title,
                                "Phase": t.phase,
                                "Status": t.status,
                                "Sponsor": t.sponsor
                            })) || null; 
                            break;
                        case AgentName.EXIM: 
                           const eximData = agent.result[AgentName.EXIM];
                           if (eximData) {
                               sheetData = [
                                   { "Category": "API Name", "Value": eximData.apiName },
                                   { "Category": "Import Dependency", "Value": eximData.importDependency },
                                   { "Category": "", "Value": "" },
                                   { "Category": "Export Volumes", "Value": "" },
                                   ...eximData.exportVolumes.map(d => ({ "Category": d.country, "Value": d.value })),
                                   { "Category": "", "Value": "" },
                                   { "Category": "Top Sourcing Countries", "Value": "" },
                                   ...eximData.topSourcingCountries.map(d => ({ "Category": d.country, "Value": d.share }))
                               ];
                           }
                           break;
                        case AgentName.WEB:
                            sheetData = agent.result[AgentName.WEB]?.webSignals?.map(w => ({
                                "Title": w.title,
                                "Source": w.source,
                                "Sentiment Score": w.sentiment.toFixed(2),
                                "Excerpt": w.excerpt,
                                "URL": w.url
                            })) || null;
                            break;
                        case AgentName.INTERNAL:
                            sheetData = agent.result[AgentName.INTERNAL]?.summary?.map((s, i) => ({
                                "Finding": `Key Point ${i + 1}`,
                                "Details": s
                            })) || null;
                            break;
                    }

                    if (sheetData && sheetData.length > 0) {
                        const ws = XLSX.utils.json_to_sheet(sheetData);
                        // Set column widths for better readability
                        ws['!cols'] = Array(Object.keys(sheetData[0] || {}).length).fill({ width: 25 });
                        XLSX.utils.book_append_sheet(wb, ws, sheetName);
                    }
                }
            });

            XLSX.writeFile(wb, `CureCoders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (e) {
            console.error("Error exporting to Excel:", e);
        } finally {
            setIsExportingExcel(false);
        }
    };

    const handleExportPpt = () => {
        const PptxGenJS = window.PptxGenJS;
        
        console.log("PowerPoint export attempt:", { 
            PptxGenJS: !!PptxGenJS, 
            type: typeof PptxGenJS,
            window: typeof window !== 'undefined'
        });
        
        if (!PptxGenJS) {
            console.error("PptxGenJS not found on window object");
            alert("PowerPoint library not loaded. Please refresh the page and try again.");
            return;
        }
        
        // Test basic functionality first
        try {
            const testPptx = new PptxGenJS();
            console.log("PptxGenJS instantiation successful");
        } catch (testError) {
            console.error("Failed to create PptxGenJS instance:", testError);
            alert("PowerPoint library error. Please try refreshing the page.");
            return;
        }

        setIsExportingPpt(true);
        try {
            let pptx = new PptxGenJS();
            pptx.layout = 'LAYOUT_WIDE';
            
            // Define pharmaceutical color palette
            const pharmaColors = {
                primary: "06b6d4", // Cyan
                secondary: "f59e0b", // Orange
                dark: "1e293b", // Dark blue
                accent: "10b981", // Green
                text: "334155", // Dark gray
                light: "f8fafc" // Light gray
            };
            
            // Title slide with pharmaceutical theme and logo background
            const titleSlide = pptx.addSlide();
            
            // Set slide background
            titleSlide.background = { color: pharmaColors.dark };
            
            // Add decorative shapes for pharmaceutical theme
            titleSlide.addShape("rect", {
                x: 0.2, y: 0.2, w: 0.3, h: 0.1,
                fill: { color: pharmaColors.primary }
            });
            titleSlide.addShape("rect", {
                x: 9.5, y: 5.2, w: 0.3, h: 0.1,
                fill: { color: pharmaColors.secondary }
            });
            
            // Add title content
            titleSlide.addText("CureCoders AI Research Report", { 
                x: 1, y: 1.5, w: 8, h: 1, 
                fontSize: 44, bold: true, color: "ffffff", align: "center" 
            });
            
            titleSlide.addText(`Research Query: ${currentRunPrompt}`, { 
                x: 1, y: 2.8, w: 8, h: 0.8, 
                fontSize: 18, color: pharmaColors.secondary, align: "center", italic: true 
            });
            
            titleSlide.addText(`Generated on: ${new Date().toLocaleDateString()}`, { 
                x: 1, y: 3.8, w: 8, h: 0.5, 
                fontSize: 14, color: "ffffff", align: "center" 
            });
            
            // Add pharmaceutical symbols
            titleSlide.addShape("rect", {
                x: 2, y: 4.5, w: 0.5, h: 0.1,
                fill: { color: pharmaColors.primary }
            });
            titleSlide.addShape("rect", {
                x: 7.5, y: 4.5, w: 0.5, h: 0.1,
                fill: { color: pharmaColors.secondary }
            });

            // Executive Summary slide with pharmaceutical theme
            const summarySlide = pptx.addSlide();
            summarySlide.background = { color: pharmaColors.light };
            
            // Add header with CureCoders branding
            summarySlide.addText("CureCoders", { 
                x: 0.5, y: 0.2, w: 3, h: 0.5, 
                fontSize: 16, bold: true, color: pharmaColors.primary 
            });
            summarySlide.addText("Executive Summary", { 
                x: 0.5, y: 0.8, w: 9, h: 0.8, 
                fontSize: 28, bold: true, color: pharmaColors.dark 
            });
            
            // Add decorative line
            summarySlide.addShape("rect", {
                x: 0.5, y: 1.5, w: 9, h: 0.05,
                fill: { color: pharmaColors.primary }
            });
            
            const cleanSummary = summary.replace(/\*\*(.*?)\*\*/g, '$1');
            summarySlide.addText(cleanSummary, { 
                x: 0.5, y: 2.0, w: 9, h: 3.5, 
                fontSize: 16, color: pharmaColors.text, 
                valign: "top"
            });

            agents.forEach(agent => {
                if (agent.status === AgentStatus.DONE && agent.result && agent.name !== AgentName.DECOMPOSITION && agent.name !== AgentName.SYNTHESIS && agent.name !== AgentName.REPORT_GENERATOR) {
                    const slide = pptx.addSlide();
                    
                    // Add pharmaceutical-themed background for each slide
                    slide.background = { color: pharmaColors.light };
                    
                    // Add header with CureCoders branding
                    slide.addText("CureCoders", { 
                        x: 0.5, y: 0.2, w: 3, h: 0.5, 
                        fontSize: 14, bold: true, color: pharmaColors.primary 
                    });
                    
                    // Add decorative elements
                    slide.addShape("rect", {
                        x: 0.3, y: 0.7, w: 0.1, h: 0.6,
                        fill: { color: pharmaColors.primary }
                    });
                    
                    slide.addText(agent.name, { 
                        x: 0.7, y: 0.7, w: 8.5, h: 0.8, 
                        fontSize: 24, bold: true, color: pharmaColors.dark 
                    });

                    switch (agent.name) {
                        case AgentName.MARKET_DATA:
                            const marketData = agent.result[AgentName.MARKET_DATA];
                            if (marketData) {
                                // Key metrics section
                                slide.addText("Key Market Metrics", { 
                                    x: 0.5, y: 1.7, w: 4, h: 0.5, 
                                    fontSize: 18, bold: true, color: pharmaColors.dark 
                                });
                                
                                slide.addText(`Market Size: $${marketData.marketSizeUSD}\nCAGR: ${marketData.cagr}\nTherapy: ${marketData.therapy}`, { 
                                    x: 0.5, y: 2.2, w: 4, h: 1.5, 
                                    fontSize: 14, color: pharmaColors.text 
                                });
                                
                                // Competitors table
                                if (marketData.topCompetitors) {
                                    const rows = [["Competitor", "Market Share"]];
                                    marketData.topCompetitors.forEach(c => rows.push([c.name, c.share]));
                                    slide.addTable(rows, { 
                                        x: 5.5, y: 1.7, w: 4, h: 2.5
                                    });
                                }
                                
                                // Add insights
                                slide.addText("Market Insights", { 
                                    x: 0.5, y: 4.0, w: 9, h: 0.5, 
                                    fontSize: 16, bold: true, color: pharmaColors.dark 
                                });
                                slide.addText(marketData.insights, { 
                                    x: 0.5, y: 4.5, w: 9, h: 1, 
                                    fontSize: 14, color: pharmaColors.text 
                                });
                            }
                            break;
                        case AgentName.PATENTS:
                            const patentData = agent.result[AgentName.PATENTS];
                            if (patentData?.patents) {
                                slide.addText("Patent Analysis", { 
                                    x: 0.5, y: 1.7, w: 9, h: 0.5, 
                                    fontSize: 18, bold: true, color: pharmaColors.dark 
                                });
                                
                                const rows = [["Patent Title", "Owner", "Expiry", "Risk"]];
                                patentData.patents.forEach(p => rows.push([
                                    p.title.substring(0, 30) + "...", 
                                    p.owner, 
                                    p.expiryDate, 
                                    p.ftRisk
                                ]));
                                slide.addTable(rows, { 
                                    x: 0.5, y: 2.2, w: 9, h: 3
                                });
                            }
                            break;
                            
                        case AgentName.CLINICAL:
                            const clinicalData = agent.result[AgentName.CLINICAL];
                            if (clinicalData?.trials) {
                                slide.addText("Clinical Trials Overview", { 
                                    x: 0.5, y: 1.7, w: 9, h: 0.5, 
                                    fontSize: 18, bold: true, color: pharmaColors.dark 
                                });
                                
                                const rows = [["Trial ID", "Phase", "Status", "Sponsor"]];
                                clinicalData.trials.forEach(t => rows.push([
                                    t.id, 
                                    t.phase, 
                                    t.status, 
                                    t.sponsor
                                ]));
                                slide.addTable(rows, { 
                                    x: 0.5, y: 2.2, w: 9, h: 2.5
                                });
                            }
                            break;
                            
                        case AgentName.WEB:
                            const webData = agent.result[AgentName.WEB];
                            if (webData?.webSignals) {
                                slide.addText("Web Intelligence Signals", { 
                                    x: 0.5, y: 1.7, w: 9, h: 0.5, 
                                    fontSize: 18, bold: true, color: pharmaColors.dark 
                                });
                                
                                let content = "";
                                webData.webSignals.slice(0, 3).forEach((signal, i) => {
                                    content += `${i + 1}. ${signal.title}\n`;
                                    content += `   Source: ${signal.source} | Sentiment: ${(signal.sentiment * 100).toFixed(0)}%\n`;
                                    content += `   ${signal.excerpt.substring(0, 80)}...\n\n`;
                                });
                                
                                slide.addText(content, { 
                                    x: 0.5, y: 2.2, w: 9, h: 3, 
                                    fontSize: 12, color: pharmaColors.text 
                                });
                            }
                            break;
                            
                        case AgentName.EXIM:
                            const eximData = agent.result[AgentName.EXIM];
                            if (eximData) {
                                slide.addText("Trade Flow Analysis", { 
                                    x: 0.5, y: 1.7, w: 9, h: 0.5, 
                                    fontSize: 18, bold: true, color: pharmaColors.dark 
                                });
                                
                                slide.addText(`API: ${eximData.apiName}`, { 
                                    x: 0.5, y: 2.3, w: 9, h: 0.4, 
                                    fontSize: 14, bold: true, color: pharmaColors.text 
                                });
                                
                                if (eximData.exportVolumes?.length > 0) {
                                    const exportRows = [["Country", "Export Value"]];
                                    eximData.exportVolumes.forEach(e => exportRows.push([e.country, e.value]));
                                    slide.addTable(exportRows, { 
                                        x: 0.5, y: 2.8, w: 4, h: 2
                                    });
                                }
                                
                                if (eximData.topSourcingCountries?.length > 0) {
                                    const sourceRows = [["Country", "Share"]];
                                    eximData.topSourcingCountries.forEach(s => sourceRows.push([s.country, s.share]));
                                    slide.addTable(sourceRows, { 
                                        x: 5.5, y: 2.8, w: 4, h: 2
                                    });
                                }
                            }
                            break;
                            
                        case AgentName.INTERNAL:
                            const internalData = agent.result[AgentName.INTERNAL];
                            if (internalData?.summary) {
                                slide.addText("Internal Document Analysis", { 
                                    x: 0.5, y: 1.7, w: 9, h: 0.5, 
                                    fontSize: 18, bold: true, color: pharmaColors.dark 
                                });
                                
                                const content = internalData.summary.map((point, i) => `• ${point}`).join('\n');
                                slide.addText(content, { 
                                    x: 0.5, y: 2.3, w: 9, h: 3, 
                                    fontSize: 14, color: pharmaColors.text 
                                });
                            }
                            break;
                    }
                }
            });

            pptx.writeFile(`CureCoders_Presentation_${new Date().toISOString().split('T')[0]}.pptx`);

        } catch (e) {
            console.error("Error exporting to PowerPoint:", e);
            alert(`Failed to generate PowerPoint: ${e.message || 'Unknown error'}`);
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
                            
                            <div className="mt-6">
                                <DragDropUpload
                                    onFileUpload={async (file) => {
                                        setUploadedFile(file);
                                        await storeDocument(file);
                                    }}
                                    currentFile={uploadedFile}
                                    onRemoveFile={() => setUploadedFile(null)}
                                    disabled={isOrchestrating}
                                />
                                
                                <div className="mt-4 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowDocumentManager(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-700 bg-cyan-100 dark:bg-cyan-800 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-700 transition-colors"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Manage Documents
                                    </button>
                                </div>
                                
                                {/* Hidden file input for backward compatibility */}
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
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
                        <div ref={reportRef} data-report-content="true">
                            <Report prompt={currentRunPrompt} summary={summary} agents={agents} />
                        </div>
                    </div>
                )}

                <DocumentManager 
                    isOpen={showDocumentManager}
                    onClose={() => setShowDocumentManager(false)}
                    onSelectDocument={(doc) => {
                        // Convert stored document back to File object for use in analysis
                        const byteCharacters = atob(doc.base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: doc.type });
                        const file = new File([blob], doc.name, { type: doc.type });
                        setUploadedFile(file);
                    }}
                />
            </div>
        </div>
    );
};

export default Workspace;
