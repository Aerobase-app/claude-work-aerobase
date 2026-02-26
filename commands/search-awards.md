---
description: Search award flight availability across 23+ loyalty programs
argument-hint: [origin] [destination] [date]
allowed-tools: [mcp__plugin_aerobase_aerobase__search_awards, mcp__plugin_aerobase_aerobase__score_flight, mcp__plugin_aerobase_aerobase__get_route_info]
---

# Search Awards

Find the best award flight redemptions using points and miles across Aerobase's database of 23+ loyalty programs and 13M+ availability records.

## Instructions

1. Ask the user for:
   - Origin and destination (airport codes or cities)
   - Travel dates or date range
   - Cabin class preference
   - Points currencies they have (e.g., Chase UR, Amex MR, specific airline miles) — or "any" to search all programs

2. Call the `search_awards` tool from the Aerobase MCP server. Use `premium` (not `premium_economy`) for the cabin parameter.

3. Present results ranked by cents-per-point value. For each option show:
   - Loyalty program and points required
   - Taxes/fees
   - Value rating (cpp)
   - Cabin and aircraft
   - Transfer partner path if applicable
   - Jetlag score (K2 0-100)

4. Proactively suggest alternatives if availability is limited — nearby airports, flexible dates, or creative routing.
