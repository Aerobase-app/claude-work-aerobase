# Aerobase Plugin for Claude

Search award flights, find travel deals, and generate personalized jetlag recovery plans — powered by [Aerobase](https://aerobase.app).

## Commands

| Command | Description |
|---------|-------------|
| `/aerobase:search-flights` | Search flights between cities with cabin and date filters |
| `/aerobase:search-awards` | Find award availability across 23+ loyalty programs |
| `/aerobase:deals` | Browse active deals, mistake fares, and transfer bonuses |
| `/aerobase:jetlag-plan` | Generate a personalized jetlag recovery plan |

Claude also draws on Aerobase skills automatically when you ask travel-related questions — no slash command needed.

## Installation

```bash
/plugin install Aerobase-app/claude-work-aerobase
```

## API Key Setup

1. Sign up at [aerobase.app](https://aerobase.app)
2. Go to Settings > API Keys and generate a key (`sk_live_*`)
3. Set the environment variable:

```bash
export AEROBASE_API_KEY=sk_live_your_key_here
```

Or add it to your Claude Code settings so it persists across sessions.

## MCP Tools

The plugin bundles a stdio MCP server (`@aerobase/mcp-server`) that wraps the Aerobase v1 API. Nine tools are available:

| Tool | What it does |
|------|-------------|
| `search_flights` | Search flights by route, date, cabin, and stops |
| `score_flight` | Score a specific flight for jetlag impact (0-100) |
| `compare_flights` | Compare 2-10 flights side-by-side on jetlag |
| `lookup_flight` | Look up a flight by carrier + number (e.g., UA 901) |
| `search_awards` | Search award availability across 23+ programs |
| `get_deals` | Browse deals, mistake fares, and transfer bonuses |
| `generate_recovery_plan` | Create a day-by-day jetlag recovery plan |
| `get_route_info` | Route intelligence — timezone shift, options, scores |
| `get_airport_info` | Airport details — facilities, lounges, transit |

## Data Coverage

- **23+ loyalty programs** tracked (United, ANA, Air Canada, Emirates, and more)
- **13M+ award availability records**
- **99.3% departure time enrichment**
- Updated continuously via automated pipelines

## Rate Limits

| Tier | Requests/day |
|------|-------------|
| Free | 5 |
| Pro | 1,000 |

Upgrade at [aerobase.app/pricing](https://aerobase.app/pricing).

## Customization

This plugin is file-based — markdown and JSON. Customize for your use case:

- **Edit skills** in `skills/` to adjust how Claude presents travel advice
- **Edit commands** in `commands/` to change slash command behavior
- **Swap the MCP server** in `.mcp.json` to point to a self-hosted endpoint

## License

MIT
