const express = require("express");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const dataDir = path.join(__dirname, "data");
const db = new Database(path.join(dataDir, "urls.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_clicked_at TEXT
  );
`);

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function generateCode(length = 7) {
  const alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let result = "";
  while (result.length < length) {
    const bytes = crypto.randomBytes(length);
    for (const byte of bytes) {
      if (byte < 248) {
        result += alphabet[byte % alphabet.length];
        if (result.length === length) break;
      }
    }
  }
  return result;
}

function isValidAlias(alias) {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(alias);
}

app.post("/api/shorten", (req, res) => {
  const { url, alias } = req.body || {};

  if (!url || typeof url !== "string" || !isValidUrl(url.trim())) {
    return res.status(400).json({
      error: "Enter a valid HTTP or HTTPS URL."
    });
  }

  const originalUrl = url.trim();
  const requestedAlias = typeof alias === "string" ? alias.trim() : "";

  if (requestedAlias && !isValidAlias(requestedAlias)) {
    return res.status(400).json({
      error: "Alias must be 3–30 characters using letters, numbers, _ or -."
    });
  }

  let code = requestedAlias || generateCode();

  if (!requestedAlias) {
    while (db.prepare("SELECT 1 FROM urls WHERE code = ?").get(code)) {
      code = generateCode();
    }
  } else if (db.prepare("SELECT 1 FROM urls WHERE code = ?").get(code)) {
    return res.status(409).json({
      error: "That alias is already taken. Try another one."
    });
  }

  const result = db
    .prepare(`
      INSERT INTO urls (code, original_url)
      VALUES (?, ?)
    `)
    .run(code, originalUrl);

  const row = db
    .prepare("SELECT * FROM urls WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({
    ...row,
    shortUrl: `${BASE_URL}/${row.code}`,
    alias: Boolean(requestedAlias)
  });
});

app.get("/api/urls", (req, res) => {
  const rows = db
    .prepare(`
      SELECT code, original_url, clicks, created_at, last_clicked_at
      FROM urls
      ORDER BY created_at DESC
      LIMIT 20
    `)
    .all();

  res.json(
    rows.map((row) => ({
      ...row,
      shortUrl: `${BASE_URL}/${row.code}`
    }))
  );
});

app.get("/api/stats/:code", (req, res) => {
  const row = db
    .prepare(`
      SELECT code, original_url, clicks, created_at, last_clicked_at
      FROM urls
      WHERE code = ?
    `)
    .get(req.params.code);

  if (!row) {
    return res.status(404).json({ error: "Short URL not found." });
  }

  res.json({
    ...row,
    shortUrl: `${BASE_URL}/${row.code}`
  });
});

app.get("/:code", (req, res, next) => {
  const row = db
    .prepare("SELECT * FROM urls WHERE code = ?")
    .get(req.params.code);

  if (!row) return next();

  db.prepare(`
    UPDATE urls
    SET clicks = clicks + 1,
        last_clicked_at = CURRENT_TIMESTAMP
    WHERE code = ?
  `).run(req.params.code);

  res.redirect(row.original_url);
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found." });
  }
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Shortly running at ${BASE_URL}`);
});
