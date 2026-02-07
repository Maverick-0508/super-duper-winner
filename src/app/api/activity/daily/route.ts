import { NextRequest, NextResponse } from "next/server";
import { getEvents, EventType } from "@/lib/eventsStore";
import { getUserIdFromApiKey } from "@/lib/authApiKey";

interface DailyActivity {
  day: string; // YYYY-MM-DD
  count: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const apiKey = searchParams.get("apiKey");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const typeParam = searchParams.get("type");

  // Validate API key
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing apiKey query parameter" },
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

  // Parse date range with sensible defaults
  // Default from: very early date (beginning of Unix epoch)
  const fromDate = fromParam ? new Date(fromParam) : new Date("1970-01-01");
  // Default to: now
  const toDate = toParam ? new Date(toParam) : new Date();

  // Validate dates
  if (isNaN(fromDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid 'from' date format. Use YYYY-MM-DD or ISO format." },
      { status: 400 }
    );
  }
  if (isNaN(toDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid 'to' date format. Use YYYY-MM-DD or ISO format." },
      { status: 400 }
    );
  }

  // Parse event type filter
  let eventType: EventType | undefined;
  if (typeParam && typeParam !== "all") {
    const validTypes: EventType[] = ["post", "comment", "reaction"];
    if (!validTypes.includes(typeParam as EventType)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}, all` },
        { status: 400 }
      );
    }
    eventType = typeParam as EventType;
  }

  // Query events
  const events = getEvents(userId, fromDate, toDate, eventType);

  // Aggregate by calendar day
  const dailyCountsMap = new Map<string, number>();

  events.forEach((event) => {
    const eventDate = new Date(event.timestamp);
    const day = eventDate.toISOString().split("T")[0]; // YYYY-MM-DD
    dailyCountsMap.set(day, (dailyCountsMap.get(day) || 0) + 1);
  });

  // Convert to array and sort by date
  const dailyActivity: DailyActivity[] = Array.from(
    dailyCountsMap.entries()
  ).map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return NextResponse.json(dailyActivity);
}
