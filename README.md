# LinkedIn Activity Tracker (MVP)

A minimal viable product dashboard and backend API for tracking LinkedIn activity events. This app receives activity events from a browser extension and displays a daily activity summary.

## Features

- **Backend API** for receiving and aggregating activity events
- **Dashboard** displaying daily activity counts and current streak
- **In-memory storage** for quick MVP development (data cleared on server restart)
- **Data Integrity & Deduplication**: Prevents duplicate events with intelligent deduplication logic
- **Streak Tracking**: Accurate calculation of current activity streaks
- **Rate Limiting**: Built-in rate limit tracking for future LinkedIn API integrations
- **Multi-Source Support**: Handles events from LinkedIn API, browser extension, and manual entry

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Maverick-0508/super-duper-winner.git
cd super-duper-winner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure your API keys if needed. The default demo key is `demo-key-12345`.

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## API Documentation

### POST /api/events

Submit a new activity event from the browser extension.

**Request Body:**
```json
{
  "apiKey": "demo-key-12345",
  "type": "post",
  "timestamp": "2026-02-07T10:30:00Z",
  "source": "extension",
  "externalId": "linkedin-post-12345"
}
```

**Parameters:**
- `apiKey` (required): Your API authentication key
- `type` (required): Event type - must be one of: `post`, `comment`, `reaction`
- `timestamp` (optional): ISO 8601 timestamp. Defaults to current server time if not provided
- `source` (optional): Event source - `linkedin_api`, `extension`, or `manual`. Defaults to `"extension"`
- `externalId` (optional): External ID from LinkedIn API. Used for deduplication of API events

**Response:**
```json
{
  "success": true,
  "duplicate": false
}
```

The `duplicate` field indicates whether the event was rejected as a duplicate:
- For `linkedin_api` events: duplicate if same userId + externalId
- For `manual`/`extension` events: duplicate if same userId + source + type + calendar day

**Error Responses:**
- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Invalid API key

### GET /api/activity/daily

Retrieve aggregated daily activity counts.

**Query Parameters:**
- `apiKey` (required): Your API authentication key
- `from` (optional): Start date in YYYY-MM-DD or ISO format. Defaults to beginning of time
- `to` (optional): End date in YYYY-MM-DD or ISO format. Defaults to now
- `type` (optional): Filter by event type (`post`, `comment`, `reaction`, or `all`). Defaults to `all`

**Example Request:**
```
GET /api/activity/daily?apiKey=demo-key-12345&from=2026-01-01&to=2026-02-07
```

**Response:**
```json
{
  "daily": [
    { "day": "2026-02-01", "count": 5 },
    { "day": "2026-02-02", "count": 3 },
    { "day": "2026-02-07", "count": 7 }
  ],
  "currentStreak": 3
}
```

The response includes:
- `daily`: Array of daily activity counts sorted by date
- `currentStreak`: Number of consecutive days with activity, counting back from today or yesterday

**Error Responses:**
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Invalid API key

## Browser Extension Integration

Your browser extension should POST events to `/api/events` whenever LinkedIn activity is detected:

```javascript
// Example browser extension code
const API_KEY = "demo-key-12345";
const API_ENDPOINT = "http://localhost:3000/api/events";

async function trackActivity(type) {
  await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: API_KEY,
      type: type, // "post", "comment", or "reaction"
      timestamp: new Date().toISOString(),
      source: "extension"
    })
  });
}
```

## Data Integrity & Deduplication

The event store implements intelligent deduplication to prevent duplicate entries:

### Deduplication Rules

- **LinkedIn API Events** (`source: "linkedin_api"`): Events are considered duplicates if they have the same `userId`, `source`, and `externalId`. This allows the system to reconcile events from the LinkedIn API with manually tracked events.

- **Manual/Extension Events** (`source: "manual"` or `source: "extension"`): Events are considered duplicates if they have the same `userId`, `source`, `type`, and occur on the same calendar day (YYYY-MM-DD).

### Event Reconciliation

When LinkedIn API events are received with an `externalId`, the system can automatically mark corresponding manual events as reconciled using the `reconcileManualEventsWithApi` function. This helps maintain data integrity when events are tracked from multiple sources.

### Streak Calculation

The current streak represents consecutive days with activity:
- Counts backward from today (if today has activity) or yesterday (if yesterday has activity but not today)
- A missing day in the past breaks the streak
- The absence of activity today does NOT break the streak if yesterday had activity

### Rate Limiting

The system includes built-in rate limit tracking utilities in `lib/rateLimit.ts` for future LinkedIn API integrations. Rate limits are tracked per user with configurable request counts and time windows.

## Development Notes

⚠️ **Important**: This is an MVP implementation with in-memory storage. All data will be lost when the server restarts. For production use, implement a proper database backend.

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── events/route.ts         # POST endpoint for events
│   │   │   └── activity/daily/route.ts # GET endpoint for daily stats with streak
│   │   ├── page.tsx                    # Dashboard UI
│   │   └── layout.tsx
│   └── lib/
│       ├── eventsStore.ts              # In-memory event storage with deduplication
│       ├── authApiKey.ts               # API key authentication
│       ├── streak.ts                   # Streak calculation utilities
│       └── rateLimit.ts                # Rate limiting utilities
├── .env.example                        # Environment variables template
└── README.md
```
