import React, { useState, useEffect } from 'react';
import { Download, Eye, Trash2, FileText, Image, Film, File } from './Icons';

interface StoredDocument {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    base64Data: string;
}

interface DocumentManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDocument?: (doc: StoredDocument) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ isOpen, onClose, onSelectDocument }) => {
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [previewDocument, setPreviewDocument] = useState<StoredDocument | null>(null);

    useEffect(() => {
        loadDocuments();
    }, [isOpen]);

    const loadDocuments = () => {
        const stored = localStorage.getItem('curecoders_documents');
        if (stored) {
            setDocuments(JSON.parse(stored));
        }
    };

    const saveDocuments = (docs: StoredDocument[]) => {
        localStorage.setItem('curecoders_documents', JSON.stringify(docs));
        setDocuments(docs);
    };

    const deleteDocument = (id: string) => {
        const updated = documents.filter(doc => doc.id !== id);
        saveDocuments(updated);
    };

    const downloadDocument = (doc: StoredDocument) => {
        try {
            // Convert base64 to blob
            const byteCharacters = atob(doc.base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: doc.type });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document. Please try again.');
        }
    };

    const previewDoc = (doc: StoredDocument) => {
        setPreviewDocument(doc);
    };

    const closePreview = () => {
        setPreviewDocument(null);
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
        if (type.startsWith('video/')) return <Film className="w-5 h-5" />;
        if (type.includes('pdf') || type.includes('text') || type.includes('document')) return <FileText className="w-5 h-5" />;
        return <File className="w-5 h-5" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const canPreview = (type: string) => {
        return type.startsWith('image/') || 
               type === 'application/pdf' || 
               type.startsWith('text/') ||
               type === 'application/json';
    };

    const renderPreview = (doc: StoredDocument) => {
        const dataUrl = `data:${doc.type};base64,${doc.base64Data}`;
        
        if (doc.type.startsWith('image/')) {
            return <img src={dataUrl} alt={doc.name} className="max-w-full max-h-96 object-contain" />;
        }
        
        if (doc.type === 'application/pdf') {
            return (
                <iframe 
                    src={dataUrl} 
                    className="w-full h-96 border border-slate-300 rounded-lg"
                    title={doc.name}
                />
            );
        }
        
        if (doc.type.startsWith('text/') || doc.type === 'application/json') {
            try {
                const text = atob(doc.base64Data);
                return (
                    <pre className="text-sm bg-slate-50 p-4 rounded-lg max-h-96 overflow-auto whitespace-pre-wrap">
                        {text}
                    </pre>
                );
            } catch (error) {
                return <div className="text-slate-500 p-4">Unable to preview text content</div>;
            }
        }
        
        return <div className="text-slate-500 p-4">Preview not available for this file type</div>;
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FileText className="w-8 h-8" />
                                <div>
                                    <h2 className="text-2xl font-bold">Document Manager</h2>
                                    <p className="text-cyan-100">
                                        {documents.length === 0 
                                            ? "No documents stored" 
                                            : `${documents.length} document${documents.length > 1 ? 's' : ''} stored`
                                        }
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="text-white hover:text-cyan-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                        {documents.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-600 mb-2">No documents uploaded</h3>
                                <p className="text-slate-500">Upload documents through the main interface to see them here.</p>
                                <div className="mt-6 text-sm text-slate-400">
                                    <p className="mb-2">📄 <strong>Supported formats:</strong></p>
                                    <p>PDF, Word, Excel, PowerPoint, Images, Text files</p>
                                    <p className="mt-2">🔍 <strong>Features:</strong></p>
                                    <p>Preview, Download, Search, Categorize</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start space-x-3">
                                            <div className="text-cyan-500 mt-1">
                                                {getFileIcon(doc.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-slate-900 truncate" title={doc.name}>
                                                    {doc.name}
                                                </h4>
                                                <p className="text-sm text-slate-500">
                                                    {formatFileSize(doc.size)}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(doc.uploadDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2 mt-4">
                                            {canPreview(doc.type) && (
                                                <button
                                                    onClick={() => previewDoc(doc)}
                                                    className="flex-1 flex items-center justify-center space-x-1 bg-cyan-50 text-cyan-600 px-3 py-2 rounded-lg hover:bg-cyan-100 transition-colors text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Preview</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => downloadDocument(doc)}
                                                className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>Download</span>
                                            </button>
                                            {onSelectDocument && (
                                                <button
                                                    onClick={() => {
                                                        onSelectDocument(doc);
                                                        onClose();
                                                    }}
                                                    className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm"
                                                >
                                                    Select
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this document?')) {
                                                        deleteDocument(doc.id);
                                                    }
                                                }}
                                                className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
                        <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {getFileIcon(previewDocument.type)}
                                <div>
                                    <h3 className="font-medium">{previewDocument.name}</h3>
                                    <p className="text-sm text-slate-300">{formatFileSize(previewDocument.size)}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => downloadDocument(previewDocument)}
                                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                                <button 
                                    onClick={closePreview}
                                    className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 max-h-[calc(95vh-80px)] overflow-auto">
                            {renderPreview(previewDocument)}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DocumentManager;