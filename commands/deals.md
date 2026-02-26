---
description: Browse current flight deals, mistake fares, and transfer bonuses
argument-hint: [destination]
allowed-tools: [mcp__plugin_aerobase_aerobase__get_deals]
---

# Browse Deals

Find the best active travel deals including mistake fares, flash sales, award sweet spots, and transfer bonuses.

## Instructions

1. Optionally ask the user for filters:
   - Home airport or region
   - Destination preference
   - Budget range
   - Sort preference (value, price, jetlag score, newest)

2. Call the `get_deals` tool from the Aerobase MCP server.

3. Present deals with full context — what makes each deal exceptional relative to normal pricing, how to book, and any time sensitivity or restrictions.

4. If a transfer bonus is active, calculate the effective redemption cost with the bonus applied.
