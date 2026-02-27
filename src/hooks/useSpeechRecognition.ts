"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone access denied. Check browser permissions.",
  "no-speech": "No speech detected. Try again.",
  "audio-capture": "No microphone found. Check your device.",
  "network": "Network error during speech recognition.",
  "aborted": "", // User-initiated, no error to show
};

function getSpeechRecognitionClass(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    transcript: "",
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = typeof window !== "undefined" && getSpeechRecognitionClass() !== null;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    if (!SpeechRecognitionClass) {
      setState((s) => ({ ...s, error: "Speech recognition not supported in this browser." }));
      return;
    }

    // Abort any existing session
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState({ isListening: true, transcript: "", error: null });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      setState((s) => ({ ...s, transcript: fullTranscript }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const message = ERROR_MESSAGES[event.error] ?? `Speech error: ${event.error}`;
      // Don't show error for user-initiated abort
      if (event.error === "aborted") {
        setState((s) => ({ ...s, isListening: false }));
      } else {
        setState((s) => ({ ...s, isListening: false, error: message || null }));
      }
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setState((s) => ({ ...s, isListening: false }));
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setState((s) => ({ ...s, error: "Failed to start speech recognition." }));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    error: state.error,
    isSupported,
    startListening,
    stopListening,
    clearError,
  };
}
