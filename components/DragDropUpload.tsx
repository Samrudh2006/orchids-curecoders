import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from './Icons';

interface DragDropUploadProps {
    onFileUpload: (file: File) => void;
    currentFile: File | null;
    onRemoveFile: () => void;
    disabled?: boolean;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({ 
    onFileUpload, 
    currentFile, 
    onRemoveFile, 
    disabled = false 
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        
        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setIsUploading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload delay
                onFileUpload(files[0]);
            } finally {
                setIsUploading(false);
            }
        }
    }, [onFileUpload, disabled]);

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setIsUploading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload delay
                onFileUpload(files[0]);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileTypeColor = (type: string) => {
        if (type.includes('pdf')) return 'text-red-500';
        if (type.includes('word') || type.includes('document')) return 'text-blue-500';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-500';
        if (type.includes('powerpoint') || type.includes('presentation')) return 'text-orange-500';
        if (type.includes('image')) return 'text-purple-500';
        return 'text-slate-500';
    };

    if (currentFile && !isUploading) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-medium text-green-800 dark:text-green-200">
                                Document Uploaded Successfully
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                                <FileText className={`w-4 h-4 ${getFileTypeColor(currentFile.type)}`} />
                                <span className="font-medium">{currentFile.name}</span>
                                <span>({formatFileSize(currentFile.size)})</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onRemoveFile}
                        disabled={disabled}
                        className="p-2 text-green-600 dark:text-green-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove document"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={disabled || isUploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json"
            />
            
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                    ${isDragOver 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isUploading ? 'border-cyan-300 bg-cyan-50 dark:bg-cyan-900/20' : ''}
                `}
                onClick={() => !disabled && !isUploading && document.getElementById('file-upload')?.click()}
            >
                {isUploading ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-cyan-100 dark:bg-cyan-800 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-700 dark:text-cyan-300">
                                Uploading Document...
                            </h3>
                            <p className="text-sm text-cyan-600 dark:text-cyan-400 mt-1">
                                Please wait while we process your file
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                            isDragOver 
                                ? 'bg-primary text-white' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                        }`}>
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        
                        <div>
                            <h3 className={`text-lg font-semibold ${
                                isDragOver 
                                    ? 'text-primary' 
                                    : 'text-slate-700 dark:text-slate-300'
                            }`}>
                                {isDragOver ? 'Drop your file here' : 'Upload Internal Document'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isDragOver 
                                    ? 'Release to upload' 
                                    : 'Drag & drop your file here, or click to browse'
                                }
                            </p>
                        </div>
                        
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                            Supports: PDF, Word, Excel, PowerPoint, Text files
                        </div>

                        {!isDragOver && (
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                <UploadCloud className="w-4 h-4" />
                                Choose File
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DragDropUpload;