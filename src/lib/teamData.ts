export interface TeamMember {
  id: string;
  name: string;
  role: "admin" | "manager" | "member";
  weeklyTotal: number;
  totalActivities: number;
  currentStreak: number;
  qualityScore: number;
  recentDays: { day: string; count: number }[];
}

/**
 * Mock team data – replace with real API calls when a multi-user backend is available.
 * Structure matches TeamMember so the wiring is straightforward.
 */
export const MOCK_TEAM: TeamMember[] = [
  {
    id: "you",
    name: "You",
    role: "admin",
    weeklyTotal: 12,
    totalActivities: 145,
    currentStreak: 5,
    qualityScore: 82,
    recentDays: [
      { day: "Mon", count: 2 },
      { day: "Tue", count: 3 },
      { day: "Wed", count: 1 },
      { day: "Thu", count: 4 },
      { day: "Fri", count: 2 },
    ],
  },
  {
    id: "alice",
    name: "Alice",
    role: "manager",
    weeklyTotal: 9,
    totalActivities: 110,
    currentStreak: 3,
    qualityScore: 76,
    recentDays: [
      { day: "Mon", count: 1 },
      { day: "Tue", count: 2 },
      { day: "Wed", count: 3 },
      { day: "Thu", count: 2 },
      { day: "Fri", count: 1 },
    ],
  },
  {
    id: "bob",
    name: "Bob",
    role: "member",
    weeklyTotal: 6,
    totalActivities: 72,
    currentStreak: 1,
    qualityScore: 61,
    recentDays: [
      { day: "Mon", count: 0 },
      { day: "Tue", count: 1 },
      { day: "Wed", count: 2 },
      { day: "Thu", count: 1 },
      { day: "Fri", count: 2 },
    ],
  },
  {
    id: "carol",
    name: "Carol",
    role: "member",
    weeklyTotal: 14,
    totalActivities: 198,
    currentStreak: 8,
    qualityScore: 91,
    recentDays: [
      { day: "Mon", count: 3 },
      { day: "Tue", count: 3 },
      { day: "Wed", count: 2 },
      { day: "Thu", count: 4 },
      { day: "Fri", count: 2 },
    ],
  },
  {
    id: "dave",
    name: "Dave",
    role: "member",
    weeklyTotal: 4,
    totalActivities: 55,
    currentStreak: 0,
    qualityScore: 48,
    recentDays: [
      { day: "Mon", count: 0 },
      { day: "Tue", count: 0 },
      { day: "Wed", count: 2 },
      { day: "Thu", count: 1 },
      { day: "Fri", count: 1 },
    ],
  },
];
