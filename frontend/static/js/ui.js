/**
 * ui.js — DOM rendering utilities
 */

const UI = {
  messagesEl: null,
  historyEl:  null,
  titleEl:    null,

  init() {
    this.messagesEl = document.getElementById("messages");
    this.historyEl  = document.getElementById("historyList");
    this.titleEl    = document.getElementById("chatTitle");
  },

  // ── Message rendering ──────────────────────

  appendMessage(role, content) {
    const row = document.createElement("div");
    row.className = `msg-row ${role}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${role}`;
    avatar.textContent = role === "ai" ? "✦" : "U";

    const bubble = document.createElement("div");
    bubble.className = `bubble ${role}`;
    bubble.innerHTML = this.formatContent(content);

    const meta = document.createElement("div");
    meta.className = "bubble-meta";

    const time = document.createElement("span");
    time.className = "meta-time";
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const actions = document.createElement("div");
    actions.className = "meta-actions";

    if (role === "ai") {
      const copyBtn = this._makeMetaBtn(
        `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
        "Copy"
      );
      copyBtn.addEventListener("click", () => this.copyText(copyBtn, content));

      const regenBtn = this._makeMetaBtn(
        `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`,
        "Regenerate"
      );
      regenBtn.id = "regenBtn";
      regenBtn.addEventListener("click", () => {
        if (window.App) App.regenerate();
      });

      actions.appendChild(copyBtn);
      actions.appendChild(regenBtn);
    }

    meta.appendChild(time);
    meta.appendChild(actions);

    const inner = document.createElement("div");
    inner.appendChild(bubble);
    inner.appendChild(meta);

    row.appendChild(avatar);
    row.appendChild(inner);
    this.messagesEl.appendChild(row);
    this.scrollBottom();
    return row;
  },

  appendTyping() {
    const row = document.createElement("div");
    row.className = "typing-row";
    row.innerHTML = `
      <div class="avatar ai">✦</div>
      <div class="typing-bubble">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>`;
    this.messagesEl.appendChild(row);
    this.scrollBottom();
    return row;
  },

  removeWelcome() {
    const w = document.getElementById("welcome");
    if (w) w.remove();
  },

  clearMessages() {
    this.messagesEl.innerHTML = "";
    this.messagesEl.appendChild(this._buildWelcome());
  },

  setTitle(t) {
    this.titleEl.textContent = t;
  },

  // ── History sidebar ────────────────────────

  renderHistory(conversations, activeId, onSelect, onDelete) {
    this.historyEl.innerHTML = "";
    if (!conversations.length) {
      this.historyEl.innerHTML = `<div class="history-empty">No conversations yet</div>`;
      return;
    }

    conversations.forEach(c => {
      const item = document.createElement("div");
      item.className = `history-item${c.id === activeId ? " active" : ""}`;
      item.dataset.id = c.id;

      item.innerHTML = `
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" style="flex-shrink:0">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis">${this._esc(c.title)}</span>
        <button class="del-btn" title="Delete">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>`;

      item.querySelector(".del-btn").addEventListener("click", e => {
        e.stopPropagation();
        onDelete(c.id);
      });

      item.addEventListener("click", () => onSelect(c.id));
      this.historyEl.appendChild(item);
    });
  },

  setActiveHistory(id) {
    document.querySelectorAll(".history-item").forEach(el => {
      el.classList.toggle("active", el.dataset.id === id);
    });
  },

  // ── Toast ──────────────────────────────────

  showToast(msg, duration = 3500) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), duration);
  },

  // ── Helpers ────────────────────────────────

  scrollBottom() {
    this.messagesEl.scrollTo({ top: this.messagesEl.scrollHeight, behavior: "smooth" });
  },

  copyText(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg width="13" height="13" fill="none" stroke="#4caf7d" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>`;
      setTimeout(() => { btn.innerHTML = orig; }, 1800);
    });
  },

  formatContent(text) {
    let html = this._esc(text);
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/^### (.+)$/gm, "<strong>$1</strong>");
    html = html.replace(/^## (.+)$/gm, "<strong style='font-size:1.05em'>$1</strong>");
    html = html.replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, m => `<ul>${m}</ul>`);
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
    html = html.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
    return html;
  },

  _esc(t) {
    return String(t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  },

  _makeMetaBtn(svgHtml, title) {
    const btn = document.createElement("button");
    btn.className = "meta-btn";
    btn.title = title;
    btn.innerHTML = svgHtml;
    return btn;
  },

  _buildWelcome() {
    const w = document.createElement("div");
    w.className = "welcome"; w.id = "welcome";
    w.innerHTML = `
      <div class="welcome-icon">✦</div>
      <h1>Ask me anything</h1>
      <p>I'm EchoBot, your intelligent AI companion. Powered by Claude, I can write, code, analyse, translate, and think through complex problems with you.</p>
      <div class="suggestions" id="suggestions">
        <div class="suggestion-chip" data-prompt="Explain quantum entanglement simply">Explain quantum entanglement simply</div>
        <div class="suggestion-chip" data-prompt="Write a Python web scraper">Write a Python web scraper</div>
        <div class="suggestion-chip" data-prompt="Draft a professional email">Draft a professional email</div>
        <div class="suggestion-chip" data-prompt="Give me a creative story idea">Give me a creative story idea</div>
        <div class="suggestion-chip" data-prompt="Explain Big O notation">Explain Big O notation</div>
        <div class="suggestion-chip" data-prompt="Translate 'Hello World' to French">Translate to French</div>
      </div>`;
    // rebind chips
    setTimeout(() => {
      w.querySelectorAll(".suggestion-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          if (window.App) App.sendFromSuggestion(chip.dataset.prompt);
        });
      });
    }, 0);
    return w;
  },
};
