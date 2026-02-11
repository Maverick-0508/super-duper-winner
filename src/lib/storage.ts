// Local Storage utilities for Content Studio

import { TalkingPoint, SavedSuggestion } from "./types/contentStudio";

const TALKING_POINTS_KEY = "content_studio_talking_points";
const SAVED_SUGGESTIONS_KEY = "content_studio_saved_suggestions";

// Talking Points Storage
export const getTalkingPoints = (): TalkingPoint[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(TALKING_POINTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTalkingPoints = (points: TalkingPoint[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TALKING_POINTS_KEY, JSON.stringify(points));
};

export const addTalkingPoint = (point: TalkingPoint): void => {
  const points = getTalkingPoints();
  points.push(point);
  saveTalkingPoints(points);
};

export const updateTalkingPoint = (id: string, updates: Partial<TalkingPoint>): void => {
  const points = getTalkingPoints();
  const index = points.findIndex(p => p.id === id);
  if (index !== -1) {
    points[index] = { ...points[index], ...updates, updatedAt: new Date().toISOString() };
    saveTalkingPoints(points);
  }
};

export const deleteTalkingPoint = (id: string): void => {
  const points = getTalkingPoints();
  const filtered = points.filter(p => p.id !== id);
  saveTalkingPoints(filtered);
};

// Saved Suggestions Storage
export const getSavedSuggestions = (): SavedSuggestion[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SAVED_SUGGESTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSuggestions = (suggestions: SavedSuggestion[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_SUGGESTIONS_KEY, JSON.stringify(suggestions));
};

export const addSavedSuggestion = (suggestion: SavedSuggestion): void => {
  const suggestions = getSavedSuggestions();
  suggestions.unshift(suggestion); // Add to beginning
  saveSuggestions(suggestions);
};

export const updateSavedSuggestion = (id: string, updates: Partial<SavedSuggestion>): void => {
  const suggestions = getSavedSuggestions();
  const index = suggestions.findIndex(s => s.id === id);
  if (index !== -1) {
    suggestions[index] = { ...suggestions[index], ...updates, updatedAt: new Date().toISOString() };
    saveSuggestions(suggestions);
  }
};

export const deleteSavedSuggestion = (id: string): void => {
  const suggestions = getSavedSuggestions();
  const filtered = suggestions.filter(s => s.id !== id);
  saveSuggestions(filtered);
};
