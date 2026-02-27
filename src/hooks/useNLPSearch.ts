"use client";

import { useState, useCallback } from "react";
import { useFilterStore } from "@/stores/filterStore";
import type { NLPResponse } from "@/lib/nlp-schema";

interface NLPSearchState {
  isLoading: boolean;
  error: string | null;
  unmappedConstraints: string[];
}

interface NLPParseResult {
  success: boolean;
  filters?: NLPResponse;
  error?: string;
}

export function useNLPSearch() {
  const [state, setState] = useState<NLPSearchState>({
    isLoading: false,
    error: null,
    unmappedConstraints: [],
  });

  const hydrateFromNLP = useFilterStore((s) => s.hydrateFromNLP);
  const clearAllFilters = useFilterStore((s) => s.clearAllFilters);

  const parseQuery = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < 3) {
        setState((s) => ({ ...s, error: "Please enter a longer description" }));
        return;
      }

      setState({ isLoading: true, error: null, unmappedConstraints: [] });

      // Clear existing filters before hydrating with NLP results
      clearAllFilters();

      try {
        const response = await fetch("/api/nlp-parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed (${response.status})`);
        }

        const result: NLPParseResult = await response.json();

        if (!result.success || !result.filters) {
          throw new Error(result.error || "Failed to parse query");
        }

        // Hydrate the filter store with parsed results
        hydrateFromNLP(result.filters);

        setState({
          isLoading: false,
          error: null,
          unmappedConstraints: result.filters.unmappedConstraints || [],
        });
      } catch (err) {
        setState({
          isLoading: false,
          error: err instanceof Error ? err.message : "Something went wrong",
          unmappedConstraints: [],
        });
      }
    },
    [hydrateFromNLP, clearAllFilters],
  );

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    parseQuery,
    clearError,
    isLoading: state.isLoading,
    error: state.error,
    unmappedConstraints: state.unmappedConstraints,
  };
}
