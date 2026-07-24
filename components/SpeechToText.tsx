import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, X } from './Icons';
import getApiUrl from '../services/apiConfig';

interface SpeechToTextProps {
  onTranscription?: (text: string) => void;
  onAnalysis?: (analysis: any) => void;
  language?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SpeechToText({
  onTranscription,
  onAnalysis,
  language = 'en-IN',
  isOpen = true,
  onClose,
}: SpeechToTextProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError('');
    setTranscription('');
    setAnalysis(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        handleAudioChunks();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setError(`Microphone access failed: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleAudioChunks = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onload = async () => {
      const audioBase64 = reader.result as string;

      try {
        setIsLoading(true);
        setError('');

        // Call speech-to-text API
        const sttResponse = await fetch(`${getApiUrl()}/api/speech-to-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: audioBase64,
            language,
          }),
        });

        if (!sttResponse.ok) {
          const errData = await sttResponse.json();
          throw new Error(errData.error || 'Speech-to-text failed');
        }

        const sttData = await sttResponse.json();
        setTranscription(sttData.text);
        onTranscription?.(sttData.text);

        // Call voice analysis API for deeper insights
        const analysisResponse = await fetch(`${getApiUrl()}/api/voice-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: audioBase64,
            language,
          }),
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setAnalysis(analysisData.analysis);
          onAnalysis?.(analysisData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to process audio');
      } finally {
        setIsLoading(false);
      }
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-500" />
            Voice Input
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Recording Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white font-bold transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <>
                <Square className="w-8 h-8" />
                <span className="absolute -bottom-8 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Recording...
                </span>
              </>
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Transcription */}
        {transcription && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Transcription
            </label>
            <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
              {transcription}
            </p>
          </div>
        )}

        {/* Analysis */}
        {analysis && (
          <div className="space-y-2 mb-4">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Voice Analysis
            </label>
            <div className="space-y-1.5 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Sentiment:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                  {analysis.sentiment}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Tone:</span>
                <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                  {analysis.tone}
                </span>
              </div>
              {analysis.keywords && analysis.keywords.length > 0 && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.keywords.map((keyword: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center gap-2 text-slate-600 dark:text-slate-400">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
            <span className="text-sm">Processing audio...</span>
          </div>
        )}
      </div>
    </div>
  );
}
