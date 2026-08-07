import { useCallback } from "react";
import { useVoiceAssistant } from "../context/VoiceAssistantContext";
import { VOICE_STATES, VoiceState } from "../services/voiceService";

/**
 * Reusable voice-chat hook built on top of the existing VoiceAssistantContext.
 *
 * It exposes a clean, UI-agnostic interface for the Sarvam AI voice flow:
 *   record → STT → AI chat → TTS → playback.
 *
 * All API calls and state live in VoiceAssistantContext / voiceService — this
 * hook only surfaces the pieces UI components need, so no logic is duplicated.
 */
export const useVoiceChat = () => {
  const {
    isEnabled,
    isSpeaking,
    isListening,
    voiceState,
    lastTranscript,
    lastResponse,
    startListening,
    stopListening,
    playSarvamAudio,
    speakSarvam,
    speak,
    stopSpeaking,
    toggleVoice,
  } = useVoiceAssistant();

  /** True while the mic is actively capturing audio. */
  const isRecording = voiceState === VOICE_STATES.RECORDING;

  /** True while speech is being converted to text (Sarvam STT). */
  const isConverting = voiceState === VOICE_STATES.CONVERTING;

  /** True while the AI is generating a response text. */
  const isResponding = voiceState === VOICE_STATES.RESPONDING;

  /** True while Sarvam TTS audio is being played back. */
  const isSpeakingAudio = voiceState === VOICE_STATES.SPEAKING || isSpeaking;

  /** True if any step of the voice pipeline is in progress. */
  const isProcessing =
    isRecording || isConverting || isResponding || isSpeakingAudio;

  /** Start the mic. No-op if already recording or disabled. */
  const startRecording = useCallback(() => {
    if (!isEnabled || isRecording) return;
    startListening();
  }, [isEnabled, isRecording, startListening]);

  /** Stop the mic (triggers STT → AI → TTS → playback). */
  const stopRecording = useCallback(() => {
    stopListening();
  }, [stopListening]);

  /** Toggle recording on/off. */
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isEnabled,
    isSpeaking,
    isListening,
    isRecording,
    isConverting,
    isResponding,
    isSpeakingAudio,
    isProcessing,
    voiceState,
    lastTranscript,
    lastResponse,
    startRecording,
    stopRecording,
    toggleRecording,
    playSarvamAudio,
    speakSarvam,
    speak,
    stopSpeaking,
    toggleVoice,
  };
};

export type { VoiceState };
export { VOICE_STATES };
export default useVoiceChat;
