# LinkedIn Activity Tracker (MVP)

A minimal viable product dashboard and backend API for tracking LinkedIn activity events. This app receives activity events from a browser extension and displays a daily activity summary.

## Features

- **Backend API** for receiving and aggregating activity events
- **Dashboard** displaying daily activity counts
- **In-memory storage** for quick MVP development (data cleared on server restart)

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
  "source": "linkedin"
}
```

**Parameters:**
- `apiKey` (required): Your API authentication key
- `type` (required): Event type - must be one of: `post`, `comment`, `reaction`
- `timestamp` (optional): ISO 8601 timestamp. Defaults to current server time if not provided
- `source` (optional): Event source. Defaults to `"linkedin"`

**Response:**
```json
{
  "success": true
}
```

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
[
  { "day": "2026-02-01", "count": 5 },
  { "day": "2026-02-02", "count": 3 },
  { "day": "2026-02-07", "count": 7 }
]
```

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
      source: "linkedin"
    })
  });
}
```

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
│   │   │   └── activity/daily/route.ts # GET endpoint for daily stats
│   │   ├── page.tsx                    # Dashboard UI
│   │   └── layout.tsx
│   └── lib/
│       ├── eventsStore.ts              # In-memory event storage
│       └── authApiKey.ts               # API key authentication
├── .env.example                        # Environment variables template
└── README.md
```
