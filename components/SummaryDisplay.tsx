import React, { useState, useRef, useEffect } from 'react';
import { Clipboard, ClipboardCheck, Download, FileSpreadsheet, FilePresentation, ChevronDown, Bookmark, Share2 } from './Icons';
import { Spinner } from './Spinner';
import { useAppContext } from '../hooks/useAppContext';
import getApiUrl, { getAuthHeaders } from '../services/apiConfig';

interface SummaryDisplayProps {
    summary: string;
    onDownloadPdf: () => void;
    onExportExcel: () => void;
    onExportPpt: () => void;
    isReportReady: boolean;
    isDownloadingPdf: boolean;
    isExportingExcel: boolean;
    isExportingPpt: boolean;
}

// A simple markdown-to-html renderer
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-sm">$1</code>')
        .replace(/(\r\n|\n\r|\r|\n)/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, onDownloadPdf, onExportExcel, onExportPpt, isReportReady, isDownloadingPdf, isExportingExcel, isExportingPpt }) => {
    const [copied, setCopied] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { queryId } = useAppContext();

    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isShared, setIsShared] = useState(false);

    const isLoading = isDownloadingPdf || isExportingExcel || isExportingPpt;

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBookmark = async () => {
        if (!queryId) return;
        try {
            const response = await fetch(`${getApiUrl()}/api/bookmarks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ queryId, tags: [] })
            });
            if (response.ok) {
                setIsBookmarked(true);
            }
        } catch (err) {
            console.error("Failed to bookmark query:", err);
        }
    };

    const handleShare = async () => {
        if (!queryId) return;
        setIsSharing(true);
        try {
            const response = await fetch(`${getApiUrl()}/api/collaboration/share`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ queryId })
            });
            if (response.ok) {
                setIsShared(true);
                alert("Query successfully shared with your team!");
            }
        } catch (err) {
            console.error("Failed to share query:", err);
        } finally {
            setIsSharing(false);
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (queryId) {
            fetch(`${getApiUrl()}/api/bookmarks`, {
                headers: getAuthHeaders()
            })
                .then(res => res.json())
                .then(bookmarks => {
                    if (Array.isArray(bookmarks)) {
                        setIsBookmarked(bookmarks.some(b => b.queryId === queryId));
                    }
                })
                .catch(err => console.error("Error checking bookmark status:", err));

            fetch(`${getApiUrl()}/api/collaboration/shared`, {
                headers: getAuthHeaders()
            })
                .then(res => res.json())
                .then(shared => {
                    if (Array.isArray(shared)) {
                        setIsShared(shared.some(s => s.queryId === queryId));
                    }
                })
                .catch(err => console.error("Error checking shared status:", err));
        } else {
            setIsBookmarked(false);
            setIsShared(false);
        }
    }, [queryId]);


    return (
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
            <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-display text-xl font-bold">Synthesis & AI Recommendations</h3>
                <div className="flex items-center gap-2">
                    {queryId && (
                        <>
                            <button
                                onClick={handleBookmark}
                                disabled={isBookmarked}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    isBookmarked
                                        ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
                                        : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                            </button>
                            <button
                                onClick={handleShare}
                                disabled={isShared || isSharing}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    isShared
                                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30'
                                        : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                <Share2 className="w-4 h-4" />
                                {isSharing ? 'Sharing...' : isShared ? 'Shared' : 'Share to Team'}
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        {copied ? <ClipboardCheck className="w-4 h-4 text-secondary" /> : <Clipboard className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    
                    <div ref={dropdownRef} className="relative">
                         <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={!isReportReady || isLoading}
                            className="flex items-center gap-2 pl-3 pr-2 py-1.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Export Options"
                         >
                           {isDownloadingPdf ? <><Spinner className="w-4 h-4" /> PDF...</> :
                            isExportingExcel ? <><Spinner className="w-4 h-4" /> Excel...</> :
                            isExportingPpt ? <><Spinner className="w-4 h-4" /> PPT...</> :
                            <> <Download className="w-4 h-4" /> Export</>
                           }
                           <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                         </button>
                         {isDropdownOpen && (
                             <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10">
                                 <button onClick={() => { onDownloadPdf(); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                     <Download className="w-4 h-4" /> Download PDF
                                 </button>
                                 <button onClick={() => { onExportExcel(); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                     <FileSpreadsheet className="w-4 h-4" /> Export to Excel
                                 </button>
                                 <button onClick={() => { onExportPpt(); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                     <FilePresentation className="w-4 h-4" /> Export to PPT
                                 </button>
                             </div>
                         )}
                    </div>
                </div>
            </div>
            <div className="p-6 prose prose-slate dark:prose-invert max-w-none">
                <MarkdownRenderer content={summary} />
            </div>
        </div>
    );
};

export default SummaryDisplay;