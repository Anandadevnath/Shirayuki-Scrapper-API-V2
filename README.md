# 🎋 Shirayuki Scrapper API V2

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Hono-ee6c00?style=for-the-badge" alt="Hono">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/API-REST-green?style=for-the-badge" alt="REST">
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="MIT">
</p>

```
     ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗ 
    ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝ 
    ██║     ██║   ██║██╔██╗ ██║███████╗██║██║  ███╗
    ██║     ██║   ██║██║╚██╗██║╚════██║██║██║   ██║
    ╚██████╗╚██████╔╝██║ ╚████║███████║██║╚██████╔╝
     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝ ╚═════╝ 
                                                    
              ░▒▓ A N I M E  S C R A P P E R ▓▒░
```

> *Powered by the ancient art of web scraping — now with 100% more Hono*

---

## ✨ What is this?

**Shirayuki Scrapper** is a sleek, anime-scraping API that wraps [Aniwatch](https://animekai.to) endpoints with love and care. It provides everything you need to build anime apps — from search to streaming sources.

```
    ┌──────────────────────────────────────────────────────┐
    │                                                      │
    │   🏠 Home        →  Spotlight, Trending, Top Anime   │
    │   🔍 Search      →  Basic, Advanced, Suggestions      │
    │   📺 Anime Info  →  Details, Episodes, Schedule       │
    │   🎬 Streaming   →  Servers, Sources, Player Links    │
    │                                                      │
    └──────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# Clone it (or copy-paste, we don't judge)
git clone <repo-url>

# Install dependencies
npm install

# Fire it up!
npm run start

# Server runs at
# ▸ http://localhost:3000/api/v2/animekai
```

---

## 📡 Complete Endpoint Reference

### 🔺 HOME — The Starting Point

```
GET /api/v2/animekai/home
```

Returns spotlight highlights, trending anime, latest episodes, and top charts.

```bash
curl "http://localhost:3000/api/v2/animekai/home"
```

---

### 📋 A-Z LIST — Browse Everything

```
GET /api/v2/animekai/azlist/:sortOption?page=:page
```

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `sortOption`| path   | `all` / `0-9` / `a-z`                    |
| `page`      | query  | Page number (default: `1`)               |

```bash
# All anime, page 1
curl "http://localhost:3000/api/v2/animekai/azlist/all?page=1"

# A-F anime
curl "http://localhost:3000/api/v2/animekai/azlist/a"
```

---

### 🎯 ANIME DETAILS — Deep Dive

```
GET /api/v2/animekai/anime/:animeId
```

Get full metadata for a specific anime.

```bash
curl "http://localhost:3000/api/v2/animekai/anime/steinsgate-3"
```

---

### 📺 EPISODES — Episode List

```
GET /api/v2/animekai/anime/:animeId/episodes
```

```bash
curl "http://localhost:3000/api/v2/animekai/anime/steinsgate-3/episodes"
```

---

### ⏰ NEXT EPISODE SCHEDULE — Countdown

```
GET /api/v2/animekai/anime/:animeId/next-episode-schedule
```

```bash
curl "http://localhost:3000/api/v2/animekai/anime/one-piece-100/next-episode-schedule"
```

---

### 🔍 SEARCH — Find Your Anime

#### Basic Search
```
GET /api/v2/animekai/search?q=:query&page=:page
```

```bash
curl "http://localhost:3000/api/v2/animekai/search?q=titan&page=1"
```

#### Advanced Search (All the Filters!)
```
GET /api/v2/animekai/search/advanced?q=:query&page=:page&genres=:genres&type=:type&status=:status&rated=:rated&score=:score&season=:season&language=:language&start_date=:start_date&end_date=:end_date&sort=:sort
```

```bash
curl "http://localhost:3000/api/v2/animekai/search/advanced?q=girls\
  &genres=action,adventure\
  &type=movie\
  &sort=score\
  &season=spring\
  &language=dub\
  &status=finished-airing\
  &rated=pg-13\
  &start_date=2014-0-0\
  &score=good"
```

#### Search Suggestions (Autocomplete)
```
GET /api/v2/animekai/search/suggestion?q=:query
```

```bash
curl "http://localhost:3000/api/v2/animekai/search/suggestion?q=titan"
```

---

### 🏢 PRODUCER — Filter by Studio

```
GET /api/v2/animekai/producer/:name?page=:page
```

```bash
curl "http://localhost:3000/api/v2/animekai/producer/toei-animation?page=1"
```

---

### 🏷️ GENRE — Filter by Category

```
GET /api/v2/animekai/genre/:name?page=:page
```

```bash
curl "http://localhost:3000/api/v2/animekai/genre/action?page=1"
```

---

### 🗂️ CATEGORY — Curated Lists

```
GET /api/v2/animekai/category/:name?page=:page
```

```bash
curl "http://localhost:3000/api/v2/animekai/category/most-popular?page=1"
```

---

### 📅 SCHEDULE — What's Airing Today?

```
GET /api/v2/animekai/schedule?date=:date&tzOffset=:minutes
```

```bash
curl "http://localhost:3000/api/v2/animekai/schedule?date=2024-01-01&tzOffset=-330"
```

---

### 🎬 EPISODE STREAMS — The Good Stuff

#### Get Servers
```
GET /api/v2/animekai/episode/servers?animeEpisodeId=:animeEpisodeId
```

```bash
curl "http://localhost:3000/api/v2/animekai/episode/servers?animeEpisodeId=steinsgate-3?ep=213"
```

#### Get Sources (Direct Links)
```
GET /api/v2/animekai/episode/sources?animeEpisodeId=:animeId&ep=:episodeId&server=:server&category=:category
```

| Parameter       | Required | Description                              |
|-----------------|----------|------------------------------------------|
| `animeEpisodeId`| ✅       | Anime slug (e.g., `steinsgate-3`)        |
| `ep`            | ✅       | Numeric episode ID from source site      |
| `server`        | ❌       | `hd-1` / `hd-2` / `hd-3`                |
| `category`      | ❌       | `sub` / `dub`                           |

```bash
curl "http://localhost:3000/api/v2/animekai/episode/sources?\
  animeEpisodeId=steinsgate-3&\
  ep=230&\
  server=hd-2&\
  category=sub"
```

---

## 🐉 AnimeKai Endpoints

AnimeKai uses dynamic request signatures. Here's the fallback approach:

#### Servers (AnimeKai)
```bash
curl "http://localhost:3000/api/v2/animekai/episode/servers?animeEpisodeId=witch-hat-atelier-3e32"
```

#### Sources (AnimeKai)
```bash
curl "http://localhost:3000/api/v2/animekai/episode/sources?\
  animeEpisodeId=witch-hat-atelier-3e32&\
  ep=1&\
  server=server-1&\
  category=sub"
```

> ⚠️ **Browser Tip:** Don't use `#` for fragments — query params after `#` aren't sent to the server!

---

## 🔀 Server Alias Mapping

```
┌─────────┬──────────────┐
│  Alias   │   Provider   │
├─────────┼──────────────┤
│  hd-1   │  megacloud   │
│  hd-2   │  vidsrc      │
│  hd-3   │  mycloud     │
└─────────┴──────────────┘
```

---

## ❌ Error Handling

```
┌────────────┬─────────────────────────────────┐
│  Status    │  Meaning                         │
├────────────┼─────────────────────────────────┤
│   400      │  Missing required parameters     │
│   404      │  Route not found                 │
│   500      │  Upstream or internal error      │
└────────────┴─────────────────────────────────┘
```

---

## 🗺️ Project Structure

```
shirayuki-scrapper/
├── src/
│   ├── index.ts           # Entry point
│   ├── routes/            # API routes
│   ├── utils/             # Helpers
│   └── types/             # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤝 Contributing

```bash
1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 💬 Commit with clear messages
4. 🔀 Open a pull request
```

---

## 📜 License

```
MIT License — Free to use, modify, and share.
```

---

```
    ████████╗██╗  ██╗███████╗
    ╚══██╔══╝██║  ██║██╔════╝
       ██║   ███████║█████╗  
       ██║   ██╔══██║██╔══╝  
       ██║   ██║  ██║███████╗
       ╚═╝   ╚═╝  ╚═╝╚══════╝
                                    
    ███████╗███╗   ██╗██████╗ 
    ██╔════╝████╗  ██║██╔══██╗
    █████╗  ██╔██╗ ██║██║  ██║
    ██╔══╝  ██║╚██╗██║██║  ██║
    ███████╗██║ ╚████║██████╔╝
    ╚══════╝╚═╝  ╚═══╝╚═════╝ 
```

*Made with ❤️ and lots of coffee*