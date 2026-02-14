import { NextRequest, NextResponse } from "next/server";
import { addEvent, EventType } from "@/lib/eventsStore";
import { getUserIdFromApiKey } from "@/lib/authApiKey";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, type, timestamp, source } = body;

    // Validate API key
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid apiKey" },
        { status: 400 }
      );
    }

    const userId = getUserIdFromApiKey(apiKey);
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Validate event type
    const validTypes: EventType[] = ["post", "comment", "reaction"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Use provided timestamp or current server time
    const eventTimestamp = timestamp || new Date().toISOString();

    // Validate timestamp format
    const eventDate = new Date(eventTimestamp);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid timestamp format. Use ISO 8601 format." },
        { status: 400 }
      );
    }

    // Validate that timestamp is not in the future
    const now = new Date();
    if (eventDate > now) {
      return NextResponse.json(
        { error: "Timestamp cannot be in the future" },
        { status: 400 }
      );
    }

    // Set source default to "linkedin"
    const eventSource = source || "linkedin";

    // Store the event (returns object with stored and duplicate flags)
    const result = addEvent({
      userId,
      type,
      timestamp: eventTimestamp,
      source: eventSource,
    });

    // Return success response with duplicate flag
    return NextResponse.json(
      { 
        success: true, 
        duplicate: result.duplicate 
      }, 
      { status: result.stored ? 201 : 200 }
    );
  } catch (error) {
    console.error("Error processing event:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
