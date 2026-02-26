---
description: Search for flights between two cities with optional date and cabin filters
argument-hint: [origin] [destination] [date]
allowed-tools: [mcp__plugin_aerobase_aerobase__search_flights, mcp__plugin_aerobase_aerobase__score_flight, mcp__plugin_aerobase_aerobase__compare_flights, mcp__plugin_aerobase_aerobase__lookup_flight, mcp__plugin_aerobase_aerobase__get_route_info, mcp__plugin_aerobase_aerobase__get_airport_info]
---

# Search Flights

Search for flight options between two cities using Aerobase's flight database.

## Instructions

1. Ask the user for:
   - Origin city or airport code
   - Destination city or airport code
   - Travel dates (or "flexible")
   - Cabin preference (economy / premium economy / business / first / any)

2. Call the `search_flights` tool from the Aerobase MCP server.

3. Present the top results sorted by best value, including airline, times, duration, stops, aircraft, and jetlag score.

4. Offer to dig deeper into any option — use `score_flight` for detailed jetlag analysis, `compare_flights` to rank options side-by-side, or `lookup_flight` for specific flight details.
