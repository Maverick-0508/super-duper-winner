import { NextRequest, NextResponse } from "next/server";
import { ContentGenerationRequest } from "@/lib/types/contentStudio";

interface ParsedResponse {
  content: string;
  hooks: string[];
  hashtags: string[];
  engagementPrediction: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ContentGenerationRequest = await request.json();
    const { contentType, tone, length, topic } = body;

    // Validate required fields
    if (!contentType || !tone || !length || !topic) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // If no API key, return mock data for demo purposes
      return NextResponse.json(generateMockContent(body));
    }

    // Call OpenAI API
    const prompt = buildPrompt(contentType, tone, length, topic);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional LinkedIn content creator. Generate engaging, authentic content with hooks, hashtags, and engagement predictions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      // Fall back to mock data
      return NextResponse.json(generateMockContent(body));
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(generateMockContent(body));
    }

    // Parse the AI response
    const parsed = parseAIResponse(aiResponse, body);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

function buildPrompt(
  contentType: string,
  tone: string,
  length: string,
  topic: string
): string {
  const lengthMap = {
    short: "100-150 words",
    medium: "200-300 words",
    long: "400-500 words",
  };

  return `Create a LinkedIn ${contentType} about "${topic}" with a ${tone} tone. 
Length: ${lengthMap[length as keyof typeof lengthMap]}.

Please provide the response in this JSON format:
{
  "content": "the main content text",
  "hooks": ["hook1", "hook2", "hook3"],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "engagementPrediction": {
    "likes": estimated_number,
    "comments": estimated_number,
    "shares": estimated_number
  }
}

Make the content authentic, engaging, and valuable. Include 3 compelling hooks/opening lines and 3-5 relevant hashtags.`;
}

function parseAIResponse(aiResponse: string, request: ContentGenerationRequest): ParsedResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ParsedResponse;
    }
  } catch {
    // If parsing fails, fall back to mock
  }
  return generateMockContent(request);
}

function generateMockContent(request: ContentGenerationRequest): ParsedResponse {
  const { tone, topic } = request;

  const mockContent = {
    post: {
      professional: `I'm excited to share insights about ${topic}.\n\nIn today's rapidly evolving landscape, understanding ${topic} has become crucial for professional growth. Here are three key takeaways:\n\n1. Innovation drives progress\n2. Collaboration amplifies impact\n3. Continuous learning is essential\n\nWhat's your experience with ${topic}? I'd love to hear your thoughts in the comments.`,
      casual: `Just had a great realization about ${topic}! 💡\n\nHere's the thing - we often overcomplicate it. After working in this space for a while, I've learned that the best approach is to keep it simple and authentic.\n\nWhat do you think? Drop your thoughts below! 👇`,
      inspiring: `Every journey begins with a single step. 🌟\n\nWhen I first encountered ${topic}, I never imagined where it would lead me. But here's what I've learned: growth happens when we embrace challenges and stay curious.\n\nYour potential is limitless. Keep pushing forward! 💪`,
      thought_provoking: `Here's a question that's been on my mind: What if we've been thinking about ${topic} all wrong?\n\nThe conventional wisdom says one thing, but recent developments suggest we might need to reconsider our approach. This could reshape how we think about professional development.\n\nWhat's your take? Let's discuss. 🤔`,
      storytelling: `Let me tell you a story about ${topic}.\n\nThree years ago, I faced a challenge that would change my perspective forever. I was working on a project that seemed impossible, but through persistence and collaboration, we found a way.\n\nThe lesson? Sometimes the obstacles we face become our greatest teachers. Keep moving forward, even when the path isn't clear. ✨`,
    },
  };

  const contentMap = mockContent.post;
  const content = contentMap[tone as keyof typeof contentMap] || contentMap.professional;

  const hooks = [
    `${topic}: What you need to know in 2024`,
    `The surprising truth about ${topic}`,
    `3 lessons I learned about ${topic}`,
  ];

  const hashtags = [
    "#LinkedIn",
    `#${topic.replace(/\s+/g, "")}`,
    "#ProfessionalDevelopment",
    "#CareerGrowth",
    "#Leadership",
  ];

  // Generate realistic engagement predictions based on content type and tone
  const baseEngagement = {
    professional: { likes: 150, comments: 12, shares: 8 },
    casual: { likes: 200, comments: 18, shares: 12 },
    inspiring: { likes: 300, comments: 25, shares: 20 },
    thought_provoking: { likes: 180, comments: 30, shares: 15 },
    storytelling: { likes: 250, comments: 22, shares: 18 },
  };

  const engagement = baseEngagement[tone as keyof typeof baseEngagement] || baseEngagement.professional;

  return {
    content,
    hooks,
    hashtags,
    engagementPrediction: engagement,
  };
}
