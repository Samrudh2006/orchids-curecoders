import React, { useState } from "react";
import { Mic, MicOff, X, Sparkles, Check } from "./Icons";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { VOICE_STATES } from "../services/voiceService";

/**
 * Modern floating voice-chat widget for CureCoders.
 *
 * Reuses the Sarvam AI voice flow from VoiceAssistantContext via useVoiceChat:
 *   record → STT → AI chat → TTS → automatic playback.
 *
 * Provides:
 *  - A floating microphone button (toggle recording)
 *  - Animated recording indicator (pulsing rings)
 *  - Loading states for converting / responding / speaking
 *  - Live transcription + AI response panels
 *  - Graceful error and disabled states
 */
const VoiceChatWidget: React.FC = () => {
  const {
    isEnabled,
    isRecording,
    isConverting,
    isResponding,
    isSpeakingAudio,
    isProcessing,
    voiceState,
    lastTranscript,
    lastResponse,
    toggleRecording,
    toggleVoice,
    startRecording,
  } = useVoiceChat();

  const [isExpanded, setIsExpanded] = useState(false);

  const statusLabel = (): string => {
    switch (voiceState) {
      case VOICE_STATES.RECORDING:
        return "Listening…";
      case VOICE_STATES.CONVERTING:
        return "Transcribing…";
      case VOICE_STATES.RESPONDING:
        return "Thinking…";
      case VOICE_STATES.SPEAKING:
        return "Speaking…";
      case VOICE_STATES.ERROR:
        return "Something went wrong";
      default:
        return isEnabled ? "Tap to talk to ARIA" : "Voice assistant disabled";
    }
  };

  const handleMicClick = () => {
    if (!isEnabled) {
      toggleVoice();
      // Start recording shortly after enabling so the UX is seamless.
      setTimeout(() => startRecording(), 350);
      return;
    }
    toggleRecording();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded status panel */}
      {isExpanded && (
        <div className="mb-4 w-80 max-w-[85vw] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  ARIA Voice Assistant
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Powered by Sarvam AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Status indicator */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording || isSpeakingAudio
                    ? "bg-red-500 animate-pulse"
                    : isProcessing
                      ? "bg-amber-500 animate-pulse"
                      : "bg-green-500"
                }`}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {statusLabel()}
              </span>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-1 mt-3">
              {[
                {
                  key: "record",
                  label: "Record",
                  active: isRecording,
                  done: !!lastTranscript || isProcessing,
                },
                {
                  key: "convert",
                  label: "Convert",
                  active: isConverting,
                  done: !!lastTranscript,
                },
                {
                  key: "respond",
                  label: "Respond",
                  active: isResponding,
                  done: !!lastResponse,
                },
                {
                  key: "speak",
                  label: "Speak",
                  active: isSpeakingAudio,
                  done: isSpeakingAudio,
                },
              ].map((step, i) => (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                        step.done
                          ? "bg-green-500 text-white"
                          : step.active
                            ? "bg-cyan-500 text-white animate-pulse"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {step.done && !step.active ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">
                      {step.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className="w-4 h-px bg-slate-200 dark:bg-slate-700 -mt-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Transcripts */}
          <div className="px-4 py-3 space-y-3 max-h-44 overflow-y-auto">
            {lastTranscript && (
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  You said
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2">
                  “{lastTranscript}”
                </p>
              </div>
            )}
            {lastResponse && (
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  ARIA
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 px-3 py-2">
                  {lastResponse}
                </p>
              </div>
            )}
            {!lastTranscript && !lastResponse && (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
                Tap the microphone and speak naturally. ARIA will reply in a
                human-like voice.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <div className="flex items-center gap-3">
        {/* Expand / collapse toggle */}
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          title={isExpanded ? "Hide details" : "Show details"}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Main mic button */}
        <button
          onClick={handleMicClick}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${
            isRecording
              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
              : isProcessing
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                : isEnabled
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          }`}
          title={statusLabel()}
        >
          {/* Pulsing rings while recording */}
          {isRecording && (
            <>
              <span className="absolute inset-0 rounded-full animate-ping bg-red-400/50" />
              <span
                className="absolute inset-0 rounded-full animate-ping bg-red-400/40"
                style={{ animationDelay: "0.3s" }}
              />
            </>
          )}
          {/* Speaking equalizer bars */}
          {isSpeakingAudio && !isRecording && (
            <span className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          )}

          {isRecording ? (
            <div className="relative flex items-end space-x-1 h-6">
              <span className="w-1 bg-white rounded-full animate-bounce h-6" />
              <span
                className="w-1 bg-white rounded-full animate-bounce h-4"
                style={{ animationDelay: "0.1s" }}
              />
              <span
                className="w-1 bg-white rounded-full animate-bounce h-5"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          ) : isProcessing ? (
            <div className="relative flex space-x-1.5">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          ) : isEnabled ? (
            <Mic className="w-8 h-8" />
          ) : (
            <MicOff className="w-8 h-8" />
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceChatWidget;
