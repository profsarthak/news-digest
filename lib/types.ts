// Core data shapes for a daily compiled digest.

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export type Source = {
  outlet: string;
  headline: string;
  url: string;
};

export type Topic = {
  id: string;
  title: string;
  /** Plain-English explainer, compiled across outlets. */
  explainer: string;
  /** Web-search-backed background. */
  context: string;
  /** Web-search-informed "what this means / who's affected / what could follow". */
  implications: string;
  glossary: GlossaryEntry[];
  sources: Source[];
  /** True if context/implications were web-search-backed (vs. from articles). */
  researched: boolean;
};

export type Digest = {
  /** ISO date, e.g. "2026-06-09" (IST). */
  date: string;
  topics: Topic[];
};
