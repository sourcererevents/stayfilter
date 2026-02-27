"use client";

import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { Sparkles, Loader2, AlertCircle, X, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNLPSearch } from "@/hooks/useNLPSearch";
import { useSearch } from "@/hooks/useSearch";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

export function NLPSearchBox() {
  const [inputValue, setInputValue] = useState("");
  const { search } = useSearch();
  const { parseQuery, clearError, isLoading, error, unmappedConstraints } =
    useNLPSearch(search);
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: speechSupported,
    startListening,
    stopListening,
    clearError: clearSpeechError,
  } = useSpeechRecognition();

  // Track whether we should auto-submit when listening ends
  const wasListeningRef = useRef(false);

  // Update textarea with live transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setInputValue(transcript);
    }
  }, [isListening, transcript]);

  // Auto-submit when speech ends with a valid transcript
  useEffect(() => {
    if (wasListeningRef.current && !isListening && transcript.trim().length >= 3) {
      wasListeningRef.current = false;
      // Small delay so user sees the final transcript before it submits
      const timer = setTimeout(() => {
        parseQuery(transcript);
      }, 300);
      return () => clearTimeout(timer);
    }
    if (!isListening) {
      wasListeningRef.current = false;
    }
  }, [isListening, transcript, parseQuery]);

  function handleSubmit() {
    if (inputValue.trim().length >= 3 && !isLoading) {
      parseQuery(inputValue);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleMicClick() {
    if (isListening) {
      stopListening();
    } else {
      clearError();
      clearSpeechError();
      wasListeningRef.current = true;
      startListening();
    }
  }

  // Combine NLP and speech errors
  const displayError = error || speechError;
  const handleClearError = () => {
    clearError();
    clearSpeechError();
  };

  return (
    <div className="space-y-2.5">
      {/* Input box */}
      <div className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        isListening
          ? "border-rose-400 ring-2 ring-rose-500/30"
          : "border-zinc-200 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-300"
      }`}>
        <div className="flex items-start gap-3 p-3 sm:p-4">
          <Sparkles className="w-5 h-5 text-rose-500 mt-1.5 flex-shrink-0" />
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='I want a cabin within 1.5 hours from Vancouver that sleeps 4 and has a sauna'
            rows={2}
            className="flex-1 resize-none text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent border-0 outline-none focus:ring-0 leading-relaxed"
            disabled={isLoading || isListening}
          />

          {/* Mic button — only if browser supports Speech API */}
          {speechSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              className={`relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
              } ${isLoading ? "opacity-40 cursor-not-allowed" : ""}`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? (
                <>
                  <Mic className="w-4 h-4 relative z-10" />
                  {/* Pulsing ring */}
                  <span className="absolute inset-0 rounded-xl bg-rose-500 animate-ping opacity-30" />
                </>
              ) : speechError ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || inputValue.trim().length < 3}
            size="sm"
            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-semibold px-4 h-9 shadow-sm flex-shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Parse Filters"
            )}
          </Button>
        </div>

        {/* Loading bar */}
        {isLoading && (
          <div className="h-0.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 animate-pulse" />
        )}

        {/* Listening indicator bar */}
        {isListening && (
          <div className="h-0.5 bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500 animate-pulse" />
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
          <button onClick={handleClearError} className="ml-auto cursor-pointer">
            <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      {/* Unmapped constraints notice */}
      {unmappedConstraints.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">Couldn&apos;t map to filters: </span>
            {unmappedConstraints.map((c, i) => (
              <span key={i}>
                {i > 0 && ", "}
                <span className="italic">&ldquo;{c}&rdquo;</span>
              </span>
            ))}
            <span className="text-amber-600">
              {" "}&mdash; review manually.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
