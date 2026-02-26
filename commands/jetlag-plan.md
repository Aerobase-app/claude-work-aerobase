---
description: Generate a personalized jetlag recovery and prevention plan
argument-hint: [origin] [destination]
allowed-tools: [mcp__plugin_aerobase_aerobase__generate_recovery_plan, mcp__plugin_aerobase_aerobase__score_flight, mcp__plugin_aerobase_aerobase__compare_flights]
---

# Jetlag Recovery Plan

Create a science-backed jetlag recovery plan tailored to your specific trip.

## Instructions

1. Ask the user for:
   - Origin and destination cities
   - Flight departure and arrival times
   - Trip purpose (business / leisure) and how sharp they need to be on arrival
   - Trip duration (short trips may not warrant full adjustment)
   - Any preferences (e.g., willing to use melatonin, early riser vs. night owl)
   - Any arrival commitments that require alertness (meetings, events with times)

2. Call the `generate_recovery_plan` tool from the Aerobase MCP server with the route and timing details.

3. Present a day-by-day plan covering:
   - Pre-flight preparation (2-3 days before)
   - In-flight strategy (sleep, caffeine, light)
   - Post-arrival adjustment (daily schedule for first 3-4 days)

4. Use specific clock times in the destination timezone. Be actionable and concrete.

5. Optionally use `score_flight` first to show the jetlag impact score, then generate the recovery plan.
