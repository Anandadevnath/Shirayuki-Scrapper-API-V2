# Shirayuki Scrapper API V2

Anime scraping API powered by Hono. This project exposes a full set of Aniwatch endpoints for discovery, metadata, episodes, server resolution, direct sources, and proxy streaming.

## AnimeKai Base URL

```text
http://localhost:3000/api/v2/animekai
```

## Quick Start

```bash
npm install
npm run start
```

## Complete Endpoint Reference

### 2) Home

What it does:
- Returns home feed data such as spotlight, trending, latest episodes, and top lists.

Endpoint:

```http
GET /api/v2/animekai/home
```

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/home"
```

### 3) A-Z List

What it does:
- Returns anime list by alphabet or numeric range.

Endpoint:

```http
GET /api/v2/animekai/azlist/:sortOption?page=:page
```

Params:
- sortOption (path, required): all, 0-9, a-z
- page (query, optional): default 1

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/azlist/a?page=1"
```

### 4) Anime Details

What it does:
- Returns full anime info for a specific anime id.

Endpoint:

```http
GET /api/v2/animekai/anime/:animeId
```

Params:
- animeId (path, required): example steinsgate-3

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/anime/steinsgate-3"
```

### 5) Anime Episodes

What it does:
- Returns episode list for the selected anime.

Endpoint:

```http
GET /api/v2/animekai/anime/:animeId/episodes
```

Params:
- animeId (path, required)

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/anime/steinsgate-3/episodes"
```

### 6) Next Episode Schedule

What it does:
- Returns estimated next episode release schedule for an anime.

Endpoint:

```http
GET /api/v2/animekai/anime/:animeId/next-episode-schedule
```

Params:
- animeId (path, required)

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/anime/one-piece-100/next-episode-schedule"
```

### 7) Basic Search

What it does:
- Searches anime by query string.

Endpoint:

```http
GET /api/v2/animekai/search?q=:query&page=:page
```

Params:
- q (query, required)
- page (query, optional): default 1

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/search?q=titan&page=1"
```

### 8) Advanced Search

What it does:
- Searches anime with filters like genres, type, status, rating, season, and sorting.

Endpoint:

```http
GET /api/v2/animekai/search/advanced?q=:query&page=:page&genres=:genres&type=:type&status=:status&rated=:rated&score=:score&season=:season&language=:language&start_date=:start_date&end_date=:end_date&sort=:sort
```

Params:
- q (query, required)
- page (query, optional)
- genres, type, status, rated, score, season, language, start_date, end_date, sort (query, optional)

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/search/advanced?q=girls&genres=action,adventure&type=movie&sort=score&season=spring&language=dub&status=finished-airing&rated=pg-13&start_date=2014-0-0&score=good"
```

### 9) Search Suggestion

What it does:
- Returns autocomplete suggestions for a search text.

Endpoint:

```http
GET /api/v2/animekai/search/suggestion?q=:query
```

Params:
- q (query, required)

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/search/suggestion?q=titan"
```

### 10) Producer

What it does:
- Returns anime list by producer/studio slug.

Endpoint:

```http
GET /api/v2/animekai/producer/:name?page=:page
```

Params:
- name (path, required)
- page (query, optional): default 1

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/producer/toei-animation?page=1"
```

### 11) Genre

What it does:
- Returns anime list by genre slug.

Endpoint:

```http
GET /api/v2/animekai/genre/:name?page=:page
```

Params:
- name (path, required)
- page (query, optional): default 1

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/genre/action?page=1"
```

### 12) Category

What it does:
- Returns anime list by category slug (for example most-popular, tv, recently-added).

Endpoint:

```http
GET /api/v2/animekai/category/:name?page=:page
```

Params:
- name (path, required)
- page (query, optional): default 1

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/category/most-popular?page=1"
```

### 13) Schedule

What it does:
- Returns schedule list for a given date and timezone offset.

Endpoint:

```http
GET /api/v2/animekai/schedule?date=:date&tzOffset=:minutes
```

Params:
- date (query, required): YYYY-MM-DD
- tzOffset (query, optional): minutes offset, default -330

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/schedule?date=2024-01-01&tzOffset=-330"
```

### 14) Episode Servers

What it does:
- Returns available streaming servers for one episode.
- Public server labels are normalized as hd-1, hd-2, hd-3.

Endpoint:

```http
GET /api/v2/animekai/episode/servers?animeEpisodeId=:animeEpisodeId
```

Params:
- animeEpisodeId (query, required): anime id and episode query, example steinsgate-3?ep=213

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/episode/servers?animeEpisodeId=steinsgate-3?ep=213"
```

### 15) Episode Sources

What it does:
- Resolves the selected server to a direct source URL (m3u8/iframe), subtitles, and intro/outro skip metadata.

Endpoint:

```http
GET /api/v2/animekai/episode/sources?animeEpisodeId=:animeId&ep=:episodeId&server=:server&category=:category
```

Params:
- animeEpisodeId (query, required): anime slug, example steinsgate-3
- ep (query, required): numeric episode id used by the source site, example 230
- server (query, optional): hd-1, hd-2, hd-3
- category (query, optional): sub or dub

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/episode/sources?animeEpisodeId=steinsgate-3&ep=230&server=hd-2&category=sub"
```

## AnimeKai Endpoints

### 1) Episode Servers (AnimeKai)

Endpoint:

```http
GET /api/v2/animekai/episode/servers?animeEpisodeId=:animeEpisodeId
```

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/episode/servers?animeEpisodeId=witch-hat-atelier-3e32"
```

### 2) Episode Sources (AnimeKai)

What it does:
- AnimeKai source AJAX uses dynamic request signatures, so this endpoint returns a fallback “watch page” source object.

Endpoint:

```http
GET /api/v2/animekai/episode/sources?animeEpisodeId=:animeEpisodeId&ep=:ep&server=:server&category=:category
```

Params:
- animeEpisodeId (query, required): AnimeKai anime id, example witch-hat-atelier-3e32
- ep (query, optional): episode number, default 1
- server (query, optional): server-1 or server-2, default server-1
- category (query, optional): sub, dub, or softsub, default sub

Example:

```bash
curl "http://localhost:3000/api/v2/animekai/episode/sources?animeEpisodeId=witch-hat-atelier-3e32&ep=1&server=server-1&category=sub"
```

Important:
- When testing in a browser, **do not** put query params after `#` (fragments are not sent to the server). Use `&ep=1&server=...&category=...`.

## Server Alias Mapping

- hd-1 -> megacloud
- hd-2 -> vidsrc
- hd-3 -> mycloud

## Common Error Responses

- 400: Missing required path/query parameters.
- 404: Route not found.
- 500: Upstream or internal scraping error.

## Contributing

1. Fork this repository.
2. Create a feature branch.
3. Commit focused changes.
4. Open a pull request.

## License

This project is licensed under the MIT License. See LICENSE for details.
