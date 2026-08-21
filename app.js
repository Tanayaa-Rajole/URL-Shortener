const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url");
const customToggle = document.getElementById("custom-toggle");
const aliasWrap = document.getElementById("alias-wrap");
const aliasInput = document.getElementById("alias");
const result = document.getElementById("result");
const error = document.getElementById("error");
const linksList = document.getElementById("links-list");
const refreshBtn = document.getElementById("refresh-btn");
const shortenBtn = document.getElementById("shorten-btn");
const toast = document.getElementById("toast");

document.getElementById("year").textContent = new Date().getFullYear();

customToggle.addEventListener("change", () => {
  aliasWrap.classList.toggle("hidden", !customToggle.checked);
  if (customToggle.checked) aliasInput.focus();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessages();

  shortenBtn.disabled = true;
  shortenBtn.querySelector("span").textContent = "Shortening...";

  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: urlInput.value,
        alias: customToggle.checked ? aliasInput.value : ""
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    showResult(data);
    form.reset();
    aliasWrap.classList.add("hidden");
    await loadLinks();
  } catch (err) {
    showError(err.message);
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.querySelector("span").textContent = "Shorten URL";
  }
});

refreshBtn.addEventListener("click", loadLinks);

async function loadLinks() {
  try {
    const response = await fetch("/api/urls");
    const links = await response.json();

    if (!links.length) {
      linksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⌁</div>
          <h3>No links yet</h3>
          <p>Your shortened links will show up here.</p>
        </div>
      `;
      return;
    }

    linksList.innerHTML = links.map((link) => `
      <article class="link-item">
        <div class="link-info">
          <a class="short-link" href="${escapeHtml(link.shortUrl)}" target="_blank" rel="noopener">
            ${escapeHtml(link.shortUrl)}
          </a>
          <span class="original">${escapeHtml(link.original_url)}</span>
        </div>

        <div class="click-stat">
          <strong>${Number(link.clicks).toLocaleString()}</strong>
          ${Number(link.clicks) === 1 ? "click" : "clicks"}
        </div>

        <div class="item-actions">
          <button class="copy-btn" onclick="copyLink('${encodeURIComponent(link.shortUrl)}')">
            Copy
          </button>
          <button class="copy-btn" onclick="viewStats('${encodeURIComponent(link.code)}')">
            Stats
          </button>
        </div>
      </article>
    `).join("");
  } catch {
    linksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <h3>Could not load links</h3>
        <p>Check that the server is running.</p>
      </div>
    `;
  }
}

function showResult(data) {
  result.classList.remove("hidden");
  result.innerHTML = `
    <div class="result-label">Your shortened URL</div>
    <div class="result-main">
      <a class="result-link" href="${escapeHtml(data.shortUrl)}" target="_blank" rel="noopener">
        ${escapeHtml(data.shortUrl)}
      </a>
      <button class="copy-btn" onclick="copyLink('${encodeURIComponent(data.shortUrl)}')">
        Copy link
      </button>
    </div>
  `;

  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function viewStats(encodedCode) {
  const code = decodeURIComponent(encodedCode);

  try {
    const response = await fetch(`/api/stats/${encodeURIComponent(code)}`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error);

    const lastClicked = data.last_clicked_at
      ? new Date(data.last_clicked_at + "Z").toLocaleString()
      : "Never";

    showToast(`${data.code}: ${Number(data.clicks).toLocaleString()} clicks · Last opened: ${lastClicked}`);
  } catch (err) {
    showToast(err.message || "Could not load stats.");
  }
}

async function copyLink(encodedUrl) {
  const value = decodeURIComponent(encodedUrl);

  try {
    await navigator.clipboard.writeText(value);
    showToast("Short link copied.");
  } catch {
    showToast("Copy failed. Your browser blocked clipboard access.");
  }
}

function showError(message) {
  error.textContent = message;
  error.classList.remove("hidden");
}

function hideMessages() {
  error.classList.add("hidden");
  result.classList.add("hidden");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadLinks();
