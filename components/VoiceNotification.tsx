import React, { useState, useRef, useEffect } from 'react';
import { Volume2, X, Send } from './Icons';
import getApiUrl from '../services/apiConfig';

interface VoiceNotificationProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNotificationSent?: (notification: any) => void;
}

export default function VoiceNotification({
  isOpen = true,
  onClose,
  onNotificationSent,
}: VoiceNotificationProps) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [language, setLanguage] = useState('en-IN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAudioUrl(null);

    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${getApiUrl()}/api/voice-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          language,
          priority,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate voice notification');
      }

      const data = await response.json();

      if (data.audio) {
        // Convert base64 to blob and create object URL
        const audioBlob = await (await fetch(`data:audio/mpeg;base64,${data.audio}`)).blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Auto-play the notification
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 100);
      }

      onNotificationSent?.(data);
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to create voice notification');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-500" />
            Voice Notification
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSendNotification} className="space-y-4">
          {/* Message Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the notification message..."
              maxLength={490}
              rows={4}
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              {message.length}/490 characters
            </p>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'normal', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-500 text-white'
                        : p === 'normal'
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">Hindi</option>
              <option value="ta-IN">Tamil</option>
              <option value="te-IN">Telugu</option>
              <option value="ml-IN">Malayalam</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Spanish</option>
            </select>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Audio Playback */}
          {audioUrl && (
            <div>
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
              <button
                type="button"
                onClick={togglePlayback}
                className={`w-full py-2 px-4 rounded-lg font-bold text-sm transition-all ${
                  isPlaying
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isPlaying ? 'Stop' : 'Play'} Notification
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Creating voice notification...' : 'Generate Voice Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
