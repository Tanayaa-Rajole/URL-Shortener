# 🔗 Shortly — URL Shortener

A clean, fast, full-stack URL shortener built with **Node.js, Express, SQLite, HTML, CSS, and vanilla JavaScript**.

Paste a long URL, get a short link, share it, and track how many times it has been opened. Because apparently URLs also needed a little compression therapy.

## ✨ Features

- 🔗 Shorten any valid HTTP/HTTPS URL
- ✏️ Optional custom aliases
- 📊 Click analytics
- 📋 One-click copy
- ↗️ Direct redirect from short URLs
- 🛡️ URL validation
- 🚫 Duplicate alias protection
- 📱 Responsive UI
- 💾 Persistent SQLite storage
- ⚡ No frontend framework required

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js + Express |
| Database | SQLite + better-sqlite3 |
| IDs | Cryptographically secure random IDs |

## 📁 Project Structure

```text
url-shortener/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data/
│   └── .gitkeep
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## 🚀 Run Locally

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/url-shortener.git
cd url-shortener
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

Open:

```text
http://localhost:3000
```

For development:

```bash
npm run dev
```

## 🔌 API

### `POST /api/shorten`

Create a short URL.

```json
{
  "url": "https://example.com/some/really/long/path",
  "alias": "portfolio"
}
```

Response:

```json
{
  "id": "abc123",
  "url": "https://example.com/some/really/long/path",
  "shortUrl": "http://localhost:3000/abc123",
  "alias": false,
  "clicks": 0,
  "createdAt": "2026-08-21T00:00:00.000Z"
}
```

### `GET /api/urls`

Returns recent shortened URLs.

### `GET /api/stats/:code`

Returns analytics for a short URL.

### `GET /:code`

Redirects to the original URL and increments the click count.

## 🔐 Validation

The server only accepts:

- `http://...`
- `https://...`

Custom aliases:

- 3–30 characters
- letters, numbers, `_` and `-`
- must be unique

## 🎨 UI

The interface uses:

- glassmorphism cards
- responsive layout
- subtle gradients
- accessible form states
- animated feedback
- compact analytics cards

No framework. No giant dependency tree. Humanity survives another day.

## 🌍 Deployment

The project can be deployed to any Node.js-compatible platform.

Recommended flow:

```text
Browser
   ↓
Express API
   ↓
SQLite
   ↓
Redirect
```

For production, use a managed database such as PostgreSQL if the application needs to scale across multiple server instances.

## 🧪 Example

```text
Long:
https://www.example.com/articles/2026/08/how-to-build-a-url-shortener

Short:
http://localhost:3000/a8Kp2x
```

## 📌 Future Improvements

- QR code generation
- Password-protected links
- Link expiration
- Device/browser analytics
- Geographic analytics
- User accounts
- Rate limiting
- PostgreSQL support
- Admin dashboard
- API keys for public API access

## 📄 License

MIT
