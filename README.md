# Shirayuki Scrapper API V2

This is an extended version of the Aniwatch scraper. It supports streaming URLs from
/api/v2/hianime/episode/servers?animeEpisodeId=one-punch-man-season-3-19932&ep=155745
and has been fully converted to JavaScript.

## Features

- 🏠 Home page data (spotlight, trending, latest episodes)
- 🔍 Search anime (basic & advanced with filters)
- 📺 Anime details and episodes
- 🎬 Episode servers and streaming URLs
- 📅 Release schedules
- 🎭 Genre and producer filtering
- 📊 Category browsing

## API Endpoints

### Home Page

Get spotlight, trending, latest episodes, top 10, and genres.

```bash
GET /api/v2/hianime/home
```

**Example:**
```bash
curl http://localhost:3000/api/v2/hianime/home
```

---

### A-Z List

Get anime list sorted alphabetically.

```bash
GET /api/v2/hianime/azlist/:sortOption?page=:page
```

**Parameters:**
- `sortOption`: `all`, `0-9`, `a`, `b`, ... `z`
- `page`: Page number (default: 1)

**Example:**
```bash
curl http://localhost:3000/api/v2/hianime/azlist/a?page=1
```

---

### Anime Details

Get detailed information about a specific anime.

```bash
GET /api/v2/hianime/anime/:animeId
```

**Parameters:**
- `animeId`: Anime ID (e.g., `steinsgate-3`)

**Example:**
```bash
curl http://localhost:3000/api/v2/hianime/anime/steinsgate-3
```

---

### Anime Episodes

Get all episodes for a specific anime.

```bash
GET /api/v2/hianime/anime/:animeId/episodes
```

**Parameters:**
- `animeId`: Anime ID (e.g., `steinsgate-3`)

**Example:**
```bash
curl http://localhost:3000/api/v2/hianime/anime/steinsgate-3/episodes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEpisodes": 24,
    "episodes": [
      {
        "title": "Turning Point",
        "episodeId": "steinsgate-3?ep=213",
        "number": 1,
        "isFiller": false,
        "streaming_url": "https://animefrenzy.cc/ajax/index.php?episodeId=steinsgate-3%3Fep%3D213&server={server}&category={category}"
      }
    ]
  }
}
```

---

### Episode Servers

Get available servers for streaming an episode.

```bash
GET /api/v2/hianime/episode/servers?animeEpisodeId=:id
```

**Parameters:**
- `animeEpisodeId`: Episode ID (e.g., `steinsgate-3?ep=213`)

**Example:**
```bash
curl "http://localhost:3000/api/v2/hianime/episode/servers?animeEpisodeId=steinsgate-3?ep=213"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sub": [
      {
        "serverName": "hd-1",
        "serverId": 4,
        "streaming_url": "https://animefrenzy.cc/ajax/index.php?episodeId=steinsgate-3%3Fep%3D213&server=hd-1&category=sub"
      },
      {
        "serverName": "hd-2",
        "serverId": 1,
        "streaming_url": "https://animefrenzy.cc/ajax/index.php?episodeId=steinsgate-3%3Fep%3D213&server=hd-2&category=sub"
      }
    ],
    "dub": [],
    "raw": [],
    "episodeId": "steinsgate-3?ep=213",
    "episodeNo": 1
  }
}
```

---

### Next Episode Schedule

Get the schedule for the next episode.

```bash
GET /api/v2/hianime/anime/:animeId/next-episode-schedule
```

**Parameters:**
- `animeId`: Anime ID (e.g., `one-piece-100`)

**Example:**
```bash
curl http://localhost:3000/api/v2/hianime/anime/one-piece-100/next-episode-schedule
```

---

### Basic Search

Search for anime by query.

```bash
GET /api/v2/hianime/search?q=:query&page=:page
```

**Parameters:**
- `q`: Search query
- `page`: Page number (default: 1)

**Example:**
```bash
curl "http://localhost:3000/api/v2/hianime/search?q=titan&page=1"
```

---

### Advanced Search

Search with filters.

```bash
GET /api/v2/hianime/search/advanced?q=:query&page=:page&genres=:genres&type=:type&status=:status&rated=:rated&score=:score&season=:season&language=:language&start_date=:start_date&end_date=:end_date&sort=:sort
```

**Parameters:**
- `q`: Search query
- `page`: Page number
- `genres`: Comma-separated genres (e.g., `action,adventure`)
- `type`: `movie`, `tv`, `ova`, `ona`, `special`, `music`
- `status`: `finished-airing`, `currently-airing`, `not-yet-aired`
- `rated`: `g`, `pg`, `pg-13`, `r`, `r+`, `rx`
- `score`: `good`, `very-good`, `excellent`
- `season`: `spring`, `summer`, `fall`, `winter`
- `language`: `sub`, `dub`
- `start_date`: Start year (format: `YYYY-0-0`)
- `end_date`: End year (format: `YYYY-0-0`)
- `sort`: `default`, `name-az`, `recently-added`, `recently-updated`, `score`, `most-watched`

**Example:**
```bash
curl "http://localhost:3000/api/v2/hianime/search/advanced?q=girls&genres=action,adventure&type=movie&sort=score&season=spring&language=dub&status=finished-airing&rated=pg-13&start_date=2014-0-0&score=good"
```

---

### Search Suggestion

Get search suggestions for autocomplete.

```bash
GET /api/v2/hianime/search/suggestion?q=:query
```

**Parameters:**
- `q`: Search query

**Example:**
```bash
curl "http://localhost:3000/api/v2/hianime/search/suggestion?q=titan"
```

---

### Producer

Get anime by producer/studio.

```bash
GET /api/v2/hianime/producer/:name?page=:page
```

**Parameters:**
- `name`: Producer name (e.g., `toei-animation`)
- `page`: Page number (default: 1)

**Example:**
```bash
curl "http://localhost:3000/api/v2/hianime/producer/toei-animation?page=1"
```

---

### Genre

Get anime by genre.

```bash
GET /api/v2/hianime/genre/:name?page=:page
```

**Parameters:**
- `name`: Genre name (e.g., `action`, `adventure`)
- `page`: Page number (default: 1)

**Example:**
```bash
curl "http://localhost:3000/api/v2/hianime/genre/action?page=1"
```

---

### Category

Browse anime by category.

```bash
GET /api/v2/hianime/category/:name?page=:page
```

**Parameters:**
- `name`: Category name (e.g., `most-popular`, `recently-updated`, `recently-added`, `top-upcoming`)
- `page`: Page number (default: 1)

**Example:**
```bash
curl "http://localhost:3000/api/v2/hianime/category/most-popular?page=1"
```

---

### Schedule

Get anime release schedule by date.

```bash
GET /api/v2/hianime/schedule?date=:date
```

**Parameters:**
- `date`: Date in format `YYYY-MM-DD` (e.g., `2024-01-01`)

**Example:**
```bash
curl "http://localhost:3000/api/v2/hianime/schedule?date=2024-01-01"
```

---


## License

MIT

## Disclaimer

This project is for educational purposes only. Please respect the terms of service of the source website.
