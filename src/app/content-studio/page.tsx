"use client";

import { useState, useEffect } from "react";
import {
  TalkingPoint,
  SavedSuggestion,
  Category,
  Priority,
  ContentType,
  Tone,
  ContentLength,
  GeneratedContent,
} from "@/lib/types/contentStudio";
import {
  getTalkingPoints,
  addTalkingPoint,
  updateTalkingPoint,
  deleteTalkingPoint,
  getSavedSuggestions,
  addSavedSuggestion,
  deleteSavedSuggestion,
} from "@/lib/storage";

export default function ContentStudio() {
  const [activeTab, setActiveTab] = useState<"talking-points" | "generator" | "saved">("talking-points");
  
  // Talking Points State
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<TalkingPoint | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  // Generator State
  const [contentType, setContentType] = useState<ContentType>("post");
  const [tone, setTone] = useState<Tone>("professional");
  const [length, setLength] = useState<ContentLength>("medium");
  const [selectedPointId, setSelectedPointId] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Saved Suggestions State
  const [savedSuggestions, setSavedSuggestions] = useState<SavedSuggestion[]>([]);
  const [savedSearchTerm, setSavedSearchTerm] = useState("");
  const [filterContentType, setFilterContentType] = useState<ContentType | "all">("all");

  // Load data on mount
  useEffect(() => {
    setTalkingPoints(getTalkingPoints());
    setSavedSuggestions(getSavedSuggestions());
  }, []);

  // Talking Points Functions
  const handleAddTalkingPoint = (point: Omit<TalkingPoint, "id" | "createdAt" | "updatedAt">) => {
    const newPoint: TalkingPoint = {
      ...point,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTalkingPoint(newPoint);
    setTalkingPoints(getTalkingPoints());
    setShowAddForm(false);
  };

  const handleUpdateTalkingPoint = (id: string, updates: Partial<TalkingPoint>) => {
    updateTalkingPoint(id, updates);
    setTalkingPoints(getTalkingPoints());
    setEditingPoint(null);
  };

  const handleDeleteTalkingPoint = (id: string) => {
    if (confirm("Are you sure you want to delete this talking point?")) {
      deleteTalkingPoint(id);
      setTalkingPoints(getTalkingPoints());
    }
  };

  // Generator Functions
  const handleGenerateContent = async () => {
    const topic = selectedPointId 
      ? talkingPoints.find(p => p.id === selectedPointId)?.title || ""
      : customTopic;

    if (!topic.trim()) {
      setGenerateError("Please select a talking point or enter a custom topic");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetch("/api/content-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          tone,
          length,
          topic,
          talkingPointId: selectedPointId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      setGeneratedContent(data);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGenerated = () => {
    if (!generatedContent) return;

    const selectedPoint = selectedPointId ? talkingPoints.find(p => p.id === selectedPointId) : null;

    const suggestion: SavedSuggestion = {
      id: Date.now().toString(),
      content: generatedContent.content,
      contentType,
      tone,
      length,
      talkingPointId: selectedPointId || undefined,
      talkingPointTitle: selectedPoint?.title,
      hooks: generatedContent.hooks,
      hashtags: generatedContent.hashtags,
      engagementPrediction: generatedContent.engagementPrediction,
      generatedAt: new Date().toISOString(),
    };

    addSavedSuggestion(suggestion);
    setSavedSuggestions(getSavedSuggestions());
    alert("Content saved successfully!");
  };

  // Saved Suggestions Functions
  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  const handleDeleteSuggestion = (id: string) => {
    if (confirm("Are you sure you want to delete this saved suggestion?")) {
      deleteSavedSuggestion(id);
      setSavedSuggestions(getSavedSuggestions());
    }
  };

  // Filter Functions
  const filteredTalkingPoints = talkingPoints.filter((point) => {
    const matchesSearch = point.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         point.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         point.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || point.category === filterCategory;
    const matchesPriority = filterPriority === "all" || point.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const filteredSuggestions = savedSuggestions.filter((suggestion) => {
    const matchesSearch = suggestion.content.toLowerCase().includes(savedSearchTerm.toLowerCase());
    const matchesType = filterContentType === "all" || suggestion.contentType === filterContentType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Content Studio
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              AI-powered LinkedIn content creation and management
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-200 dark:border-zinc-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("talking-points")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "talking-points"
                    ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                Talking Points
              </button>
              <button
                onClick={() => setActiveTab("generator")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "generator"
                    ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                AI Generator
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "saved"
                    ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                Saved Suggestions ({savedSuggestions.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "talking-points" && (
              <TalkingPointsTab
                points={filteredTalkingPoints}
                showAddForm={showAddForm}
                setShowAddForm={setShowAddForm}
                editingPoint={editingPoint}
                setEditingPoint={setEditingPoint}
                onAdd={handleAddTalkingPoint}
                onUpdate={handleUpdateTalkingPoint}
                onDelete={handleDeleteTalkingPoint}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
              />
            )}

            {activeTab === "generator" && (
              <GeneratorTab
                talkingPoints={talkingPoints}
                contentType={contentType}
                setContentType={setContentType}
                tone={tone}
                setTone={setTone}
                length={length}
                setLength={setLength}
                selectedPointId={selectedPointId}
                setSelectedPointId={setSelectedPointId}
                customTopic={customTopic}
                setCustomTopic={setCustomTopic}
                generatedContent={generatedContent}
                isGenerating={isGenerating}
                generateError={generateError}
                onGenerate={handleGenerateContent}
                onSave={handleSaveGenerated}
              />
            )}

            {activeTab === "saved" && (
              <SavedSuggestionsTab
                suggestions={filteredSuggestions}
                searchTerm={savedSearchTerm}
                setSearchTerm={setSavedSearchTerm}
                filterContentType={filterContentType}
                setFilterContentType={setFilterContentType}
                onCopy={handleCopyToClipboard}
                onDelete={handleDeleteSuggestion}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Talking Points Tab Component
interface TalkingPointsTabProps {
  points: TalkingPoint[];
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  editingPoint: TalkingPoint | null;
  setEditingPoint: (point: TalkingPoint | null) => void;
  onAdd: (point: Omit<TalkingPoint, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate: (id: string, updates: Partial<TalkingPoint>) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: Category | "all";
  setFilterCategory: (category: Category | "all") => void;
  filterPriority: Priority | "all";
  setFilterPriority: (priority: Priority | "all") => void;
}

function TalkingPointsTab({
  points,
  showAddForm,
  setShowAddForm,
  editingPoint,
  setEditingPoint,
  onAdd,
  onUpdate,
  onDelete,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterPriority,
  setFilterPriority,
}: TalkingPointsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search talking points..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Category | "all")}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
        >
          <option value="all">All Categories</option>
          <option value="events">Events</option>
          <option value="achievements">Achievements</option>
          <option value="industry_news">Industry News</option>
          <option value="ideas">Ideas</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-700 text-white rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-600"
        >
          Add Talking Point
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingPoint) && (
        <TalkingPointForm
          point={editingPoint}
          onSubmit={(data) => {
            if (editingPoint) {
              onUpdate(editingPoint.id, data);
            } else {
              onAdd(data);
            }
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPoint(null);
          }}
        />
      )}

      {/* Talking Points List */}
      {points.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No talking points found. Add your first one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {points.map((point: TalkingPoint) => (
            <TalkingPointCard
              key={point.id}
              point={point}
              onEdit={() => setEditingPoint(point)}
              onDelete={() => onDelete(point.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Talking Point Form Component
interface TalkingPointFormProps {
  point: TalkingPoint | null;
  onSubmit: (data: Omit<TalkingPoint, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

function TalkingPointForm({ point, onSubmit, onCancel }: TalkingPointFormProps) {
  const [title, setTitle] = useState(point?.title || "");
  const [description, setDescription] = useState(point?.description || "");
  const [category, setCategory] = useState<Category>(point?.category || "ideas");
  const [tags, setTags] = useState(point?.tags?.join(", ") || "");
  const [priority, setPriority] = useState<Priority>(point?.priority || "medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      priority,
    });
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        {point ? "Edit Talking Point" : "Add New Talking Point"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
            >
              <option value="events">Events</option>
              <option value="achievements">Achievements</option>
              <option value="industry_news">Industry News</option>
              <option value="ideas">Ideas</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ai, technology, innovation"
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-700 text-white rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-600"
          >
            {point ? "Update" : "Add"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Talking Point Card Component
interface TalkingPointCardProps {
  point: TalkingPoint;
  onEdit: () => void;
  onDelete: () => void;
}

function TalkingPointCard({ point, onEdit, onDelete }: TalkingPointCardProps) {
  const priorityColors = {
    high: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    low: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  };

  const categoryLabels = {
    events: "Events",
    achievements: "Achievements",
    industry_news: "Industry News",
    ideas: "Ideas",
    other: "Other",
  };

  return (
    <div className="bg-white dark:bg-zinc-700 rounded-lg p-4 border border-zinc-200 dark:border-zinc-600 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {point.title}
        </h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[point.priority]}`}>
          {point.priority}
        </span>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
        {point.description}
      </p>

      <div className="mb-3">
        <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded text-xs">
          {categoryLabels[point.category]}
        </span>
      </div>

      {point.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {point.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-zinc-100 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-600">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-1 bg-zinc-100 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded text-sm hover:bg-zinc-200 dark:hover:bg-zinc-500"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// Generator Tab Component
interface GeneratorTabProps {
  talkingPoints: TalkingPoint[];
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  tone: Tone;
  setTone: (tone: Tone) => void;
  length: ContentLength;
  setLength: (length: ContentLength) => void;
  selectedPointId: string;
  setSelectedPointId: (id: string) => void;
  customTopic: string;
  setCustomTopic: (topic: string) => void;
  generatedContent: GeneratedContent | null;
  isGenerating: boolean;
  generateError: string | null;
  onGenerate: () => void;
  onSave: () => void;
}

function GeneratorTab({
  talkingPoints,
  contentType,
  setContentType,
  tone,
  setTone,
  length,
  setLength,
  selectedPointId,
  setSelectedPointId,
  customTopic,
  setCustomTopic,
  generatedContent,
  isGenerating,
  generateError,
  onGenerate,
  onSave,
}: GeneratorTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Content Settings
          </h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
            >
              <option value="post">Post</option>
              <option value="article">Article</option>
              <option value="comment">Comment</option>
              <option value="poll">Poll</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="inspiring">Inspiring</option>
              <option value="thought_provoking">Thought-Provoking</option>
              <option value="storytelling">Storytelling</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Length
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as ContentLength)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
            >
              <option value="short">Short (100-150 words)</option>
              <option value="medium">Medium (200-300 words)</option>
              <option value="long">Long (400-500 words)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Topic Source
            </label>
            <select
              value={selectedPointId}
              onChange={(e) => {
                setSelectedPointId(e.target.value);
                if (e.target.value) setCustomTopic("");
              }}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
            >
              <option value="">Custom Topic (enter below)</option>
              {talkingPoints.map((point: TalkingPoint) => (
                <option key={point.id} value={point.id}>
                  {point.title}
                </option>
              ))}
            </select>
          </div>

          {!selectedPointId && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Custom Topic
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter your topic here..."
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
              />
            </div>
          )}

          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-zinc-900 dark:bg-zinc-700 text-white rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate Content"}
          </button>

          {generateError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{generateError}</p>
            </div>
          )}
        </div>

        {/* Generated Content Preview */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Generated Content
          </h2>

          {isGenerating && (
            <div className="flex justify-center items-center h-64">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
            </div>
          )}

          {!isGenerating && !generatedContent && (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
              <p className="text-zinc-600 dark:text-zinc-400">
                Configure your settings and click &quot;Generate Content&quot; to see the AI-generated content here.
              </p>
            </div>
          )}

          {!isGenerating && generatedContent && (
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-2">Content</h3>
                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {generatedContent.content}
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-2">Hooks</h3>
                <ul className="space-y-1">
                  {generatedContent.hooks.map((hook, idx) => (
                    <li key={idx} className="text-zinc-700 dark:text-zinc-300 text-sm">
                      • {hook}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-2">Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                  Engagement Prediction
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {generatedContent.engagementPrediction.likes}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {generatedContent.engagementPrediction.comments}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {generatedContent.engagementPrediction.shares}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Shares</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onSave}
                className="w-full px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600"
              >
                Save to Suggestions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Saved Suggestions Tab Component
interface SavedSuggestionsTabProps {
  suggestions: SavedSuggestion[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterContentType: ContentType | "all";
  setFilterContentType: (type: ContentType | "all") => void;
  onCopy: (content: string) => void;
  onDelete: (id: string) => void;
}

function SavedSuggestionsTab({
  suggestions,
  searchTerm,
  setSearchTerm,
  filterContentType,
  setFilterContentType,
  onCopy,
  onDelete,
}: SavedSuggestionsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search saved suggestions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
        />
        <select
          value={filterContentType}
          onChange={(e) => setFilterContentType(e.target.value as ContentType | "all")}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
        >
          <option value="all">All Types</option>
          <option value="post">Post</option>
          <option value="article">Article</option>
          <option value="comment">Comment</option>
          <option value="poll">Poll</option>
        </select>
      </div>

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No saved suggestions yet. Generate some content to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion: SavedSuggestion) => (
            <SavedSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onCopy={() => onCopy(suggestion.content)}
              onDelete={() => onDelete(suggestion.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Saved Suggestion Card Component
interface SavedSuggestionCardProps {
  suggestion: SavedSuggestion;
  onCopy: () => void;
  onDelete: () => void;
}

function SavedSuggestionCard({ suggestion, onCopy, onDelete }: SavedSuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-700 rounded-lg p-4 border border-zinc-200 dark:border-zinc-600">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-zinc-900 dark:bg-zinc-600 text-white rounded text-xs">
            {suggestion.contentType}
          </span>
          <span className="px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded text-xs">
            {suggestion.tone.replace(/_/g, " ")}
          </span>
          <span className="px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded text-xs">
            {suggestion.length}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {new Date(suggestion.generatedAt).toLocaleDateString()}
        </span>
      </div>

      {suggestion.talkingPointTitle && (
        <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
          Topic: {suggestion.talkingPointTitle}
        </div>
      )}

      <div className="mb-3">
        <p className={`text-zinc-700 dark:text-zinc-300 ${!expanded && "line-clamp-3"}`}>
          {suggestion.content}
        </p>
        {suggestion.content.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 mt-1"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {suggestion.hashtags.map((tag: string, idx: number) => (
          <span
            key={idx}
            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-zinc-50 dark:bg-zinc-600 rounded">
        <div className="text-center">
          <div className="font-bold text-zinc-900 dark:text-zinc-50">
            {suggestion.engagementPrediction.likes}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Likes</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-zinc-900 dark:text-zinc-50">
            {suggestion.engagementPrediction.comments}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Comments</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-zinc-900 dark:text-zinc-50">
            {suggestion.engagementPrediction.shares}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Shares</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCopy}
          className="flex-1 px-3 py-1 bg-zinc-900 dark:bg-zinc-600 text-white rounded text-sm hover:bg-zinc-800 dark:hover:bg-zinc-500"
        >
          Copy to Clipboard
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
