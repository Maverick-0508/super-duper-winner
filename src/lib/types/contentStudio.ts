// Content Studio Types

export type Category = "events" | "achievements" | "industry_news" | "ideas" | "other";
export type Priority = "high" | "medium" | "low";
export type ContentType = "post" | "article" | "comment" | "poll";
export type Tone = "professional" | "casual" | "inspiring" | "thought_provoking" | "storytelling";
export type ContentLength = "short" | "medium" | "long";

export interface TalkingPoint {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementPrediction {
  likes: number;
  comments: number;
  shares: number;
}

export interface GeneratedContent {
  content: string;
  hooks: string[];
  hashtags: string[];
  engagementPrediction: EngagementPrediction;
}

export interface SavedSuggestion {
  id: string;
  content: string;
  contentType: ContentType;
  tone: Tone;
  length: ContentLength;
  talkingPointId?: string;
  talkingPointTitle?: string;
  hooks: string[];
  hashtags: string[];
  engagementPrediction: EngagementPrediction;
  actualEngagement?: EngagementPrediction;
  generatedAt: string;
  updatedAt?: string;
}

export interface ContentGenerationRequest {
  contentType: ContentType;
  tone: Tone;
  length: ContentLength;
  topic: string;
  talkingPointId?: string;
}
