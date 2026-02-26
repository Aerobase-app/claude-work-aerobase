#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://aerobase.app/api/v1";
const API_KEY = process.env.AEROBASE_API_KEY;

async function callApi(
  path: string,
  options: { method?: string; body?: unknown; query?: Record<string, string> } = {}
): Promise<unknown> {
  if (!API_KEY) {
    return {
      error: "AEROBASE_API_KEY not set. Get your key at https://aerobase.app/settings/api",
    };
  }

  const url = new URL(`${API_BASE}${path}`);
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "aerobase-mcp/1.0.0",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (res.status === 401) {
    return {
      error: "Invalid API key. Check your AEROBASE_API_KEY or generate a new one at https://aerobase.app/settings/api",
    };
  }

  if (res.status === 429) {
    return {
      error: "Rate limit reached. Free tier allows 5 requests/day. Upgrade at https://aerobase.app/pricing for 1,000/day.",
    };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { error: `API error ${res.status}: ${text || res.statusText}` };
  }

  return res.json();
}

const server = new McpServer({
  name: "aerobase",
  version: "1.0.0",
});

// --- Tool 1: search_flights ---

server.tool(
  "search_flights",
  "Search flights between two cities. Returns options sorted by jetlag score, price, or duration with cabin class details.",
  {
    from: z.string().length(3).describe("Origin airport IATA code (e.g. YVR)"),
    to: z.string().length(3).describe("Destination airport IATA code (e.g. NRT)"),
    date: z.string().describe("Departure date YYYY-MM-DD"),
    return_date: z.string().optional().describe("Return date YYYY-MM-DD for round trips"),
    cabin: z
      .enum(["economy", "premium_economy", "business", "first"])
      .optional()
      .describe("Cabin class filter"),
    max_stops: z.number().int().min(0).max(3).optional().describe("Maximum stops (0 = direct only)"),
    sort: z.enum(["jetlag", "price", "duration"]).optional().describe("Sort order (default: jetlag)"),
    limit: z.number().int().min(1).max(50).optional().describe("Max results to return"),
  },
  async ({ from, to, date, return_date, cabin, max_stops, sort, limit }) => {
    const data = await callApi("/flights/search", {
      method: "POST",
      body: { from, to, date, return_date, cabin, max_stops, sort, limit },
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Tool 2: score_flight ---

server.tool(
  "score_flight",
  "Score a specific flight for jetlag impact. Returns a 0-100 score (higher = less jetlag), recovery days estimate, and personalized strategies.",
  {
    from: z.string().length(3).describe("Origin airport IATA code"),
    to: z.string().length(3).describe("Destination airport IATA code"),
    departure: z.string().describe("Departure datetime ISO 8601 (e.g. 2026-03-15T23:00:00)"),
    arrival: z.string().describe("Arrival datetime ISO 8601 (e.g. 2026-03-16T14:30:00)"),
    cabin: z
      .enum(["economy", "premium_economy", "business", "first"])
      .optional()
      .describe("Cabin class"),
    chronotype: z.string().optional().describe("User's chronotype (early_bird, night_owl, or neutral)"),
  },
  async ({ from, to, departure, arrival, cabin, chronotype }) => {
    const data = await callApi("/flights/score", {
      method: "POST",
      body: { from, to, departure, arrival, cabin, chronotype },
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Tool 3: compare_flights ---

server.tool(
  "compare_flights",
  "Compare 2-10 flight options side-by-side on jetlag impact. Returns scores, a recommendation, and the deltas between best and worst options.",
  {
    flights: z
      .array(
        z.object({
          from: z.string().length(3).describe("Origin IATA"),
          to: z.string().length(3).describe("Destination IATA"),
          departure: z.string().describe("Departure ISO 8601"),
          arrival: z.string().describe("Arrival ISO 8601"),
          cabin: z
            .enum(["economy", "premium_economy", "business", "first"])
            .optional(),
          label: z.string().optional().describe("Label for this option (e.g. 'Red-eye via LAX')"),
        })
      )
      .min(2)
      .max(10)
      .describe("Flight options to compare"),
    chronotype: z.string().optional().describe("User's chronotype"),
  },
  async ({ flights, chronotype }) => {
    const data = await callApi("/flights/compare", {
      method: "POST",
      body: { flights, chronotype },
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Tool 4: lookup_flight ---

server.tool(
  "lookup_flight",
  "Look up a specific flight by carrier and flight number. Returns schedule, aircraft, and route details. Optionally provide a date for live data.",
  {
    carrier: z.string().min(2).max(2).describe("Airline IATA code (e.g. UA, NH, QR)"),
    number: z.string().describe("Flight number digits (e.g. 901)"),
    date: z.string().optional().describe("Date YYYY-MM-DD for live lookup"),
  },
  async ({ carrier, number, date }) => {
    const query: Record<string, string> = {};
    if (date) query.date = date;
    const data = await callApi(`/flights/lookup/${carrier}/${number}`, { query });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Tool 5: search_awards ---

server.tool(
  "search_awards",
  "Search award flight availability across 23+ loyalty programs. Returns points required, seats remaining, and jetlag scores. Covers programs like United, ANA, Air Canada, Emirates, and more.",
  {
    from: z.string().length(3).describe("Origin airport IATA code"),
    to: z.string().length(3).describe("Destination airport IATA code"),
    cabin: z
      .enum(["economy", "premium", "business", "first"])
      .optional()
      .describe("Cabin class (note: use 'premium' not 'premium_economy')"),
    date: z.string().optional().describe("Specific date YYYY-MM-DD"),
    date_from: z.string().optional().describe("Start of date range YYYY-MM-DD"),
    date_to: z.string().optional().describe("End of date range YYYY-MM-DD"),
    limit: z.number().int().min(1).max(100).optional().describe("Max results"),
  },
  async ({ from, to, cabin, date, date_from, date_to, limit }) => {
    const data = await callApi("/awards/search", {
      method: "POST",
      body: { from, to, cabin, date, date_from, date_to, limit },
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Tool 6: get_deals ---

server.tool(
  "get_deals",
  "Browse current travel deals including mistake fares, flash sales, award sweet spots, and transfer bonuses. Filter by destination, price, or deal quality.",
  {
    departure: z.string().optional().describe("Origin airport IATA code"),
    destination: z.string().optional().describe("Destination airport IATA code"),
    max_price: z.number().optional().describe("Maximum price in USD"),
    sort: z
      .enum(["value_score", "price", "jetlag_score", "newest"])
      .optional()
      .describe("Sort order (default: value_score)"),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (free tier: max 3)"),
    min_score: z.number().optional().describe("Minimum jetlag score filter"),
    max_recovery_days: z.number().optional().describe("Maximum recovery days filter"),
    date_from: z.string().optional().describe("Travel date range start YYYY-MM-DD"),
    date_to: z.string().optional().describe("Travel date range end YYYY-MM-DD"),
  },
  async ({ departure, destination, max_price, sort, limit, min_score, max_recovery_days, date_from, date_to }) => {
    const query: Record<string, string> = {};
    if (departure) query.departure = departure;
    if (destination) query.destination = destination;
    if (max_price !== undefined) query.max_price = String(max_price);
    if (sort) query.sort = sort;
    if (limit !== undefined) query.limit = String(limit);
    if (min_score !== undefined) query.min_score = String(min_score);
    if (max_recovery_days !== undefined) query.max_recovery_days = String(max_recovery_days);
    if (date_from) query.date_from = date_from;
    if (date_to) query.date_to = date_to;
    const data = await callApi("/deals", { query });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Tool 7: generate_recovery_plan ---

server.tool(
  "generate_recovery_plan",
  "Generate a personalized jetlag recovery plan with day-by-day light exposure, sleep, melatonin, and meal timing. Based on circadian rhythm science.",
  {
    from: z.string().length(3).describe("Origin airport IATA code"),
    to: z.string().length(3).describe("Destination airport IATA code"),
    departure: z.string().describe("Departure datetime ISO 8601"),
    arrival: z.string().describe("Arrival datetime ISO 8601"),
    cabin: z
      .enum(["economy", "premium_economy", "business", "first"])
      .optional()
      .describe("Cabin class"),
    chronotype: z.string().optional().describe("early_bird, night_owl, or neutral"),
    arrival_commitments: z
      .array(
        z.object({
          event: z.string().describe("What the commitment is (e.g. 'board meeting')"),
          time: z.string().describe("Time of commitment (e.g. '09:00')"),
        })
      )
      .optional()
      .describe("Commitments at destination that require alertness"),
  },
  async ({ from, to, departure, arrival, cabin, chronotype, arrival_commitments }) => {
    const data = await callApi("/recovery/plan", {
      method: "POST",
      body: { from, to, departure, arrival, cabin, chronotype, arrival_commitments },
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Tool 8: get_route_info ---

server.tool(
  "get_route_info",
  "Get route intelligence between two airports — timezone shift, direct and connecting options, jetlag scores, and distance. Useful for understanding a route before searching specific flights.",
  {
    from: z.string().length(3).describe("Origin airport IATA code"),
    to: z.string().length(3).describe("Destination airport IATA code"),
  },
  async ({ from, to }) => {
    const data = await callApi(`/routes/${from}/${to}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Tool 9: get_airport_info ---

server.tool(
  "get_airport_info",
  "Get detailed airport information including timezone, location, facilities, lounges, and transit options. Useful for layover planning and airport navigation.",
  {
    code: z.string().length(3).describe("Airport IATA code (e.g. NRT, LAX, DXB)"),
  },
  async ({ code }) => {
    const data = await callApi(`/airports/${code}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
