/**
 * app.js — main application logic
 * Coordinates UI.js (rendering) and Api.js (network)
 */

const App = (() => {
  // ── State ──────────────────────────────────
  let messages       = [];   // [{role, content}]
  let conversationId = null;
  let isStreaming    = false;
  let history        = [];   // from backend

  // ── DOM refs ───────────────────────────────
  const inputEl  = document.getElementById("userInput");
  const sendBtn  = document.getElementById("sendBtn");
  const sidebar  = document.getElementById("sidebar");

  // ── Boot ───────────────────────────────────
  async function init() {
    UI.init();
    bindEvents();
    await loadHistory();
  }

  function bindEvents() {
    // send button
    sendBtn.addEventListener("click", sendMessage);

    // Enter = send, Shift+Enter = newline
    inputEl.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!sendBtn.disabled) sendMessage(); }
    });

    // auto-resize textarea
    inputEl.addEventListener("input", () => {
      inputEl.style.height = "auto";
      inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + "px";
      sendBtn.disabled = !inputEl.value.trim() || isStreaming;
    });

    // new chat
    document.getElementById("newChatBtn").addEventListener("click", newChat);

    // clear
    document.getElementById("clearBtn").addEventListener("click", () => {
      if (!messages.length) return;
      if (confirm("Clear this conversation?")) newChat();
    });

    // theme toggle
    document.getElementById("themeBtn").addEventListener("click", () => {
      document.body.classList.toggle("light");
    });

    // mobile menu
    document.getElementById("menuBtn").addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    // attach (placeholder)
    document.getElementById("attachBtn").addEventListener("click", () => {
      UI.showToast("File upload coming soon!");
    });

    // suggestion chips (initial render)
    document.querySelectorAll(".suggestion-chip").forEach(chip => {
      chip.addEventListener("click", () => sendFromSuggestion(chip.dataset.prompt));
    });
  }

  // ── History ────────────────────────────────
  async function loadHistory() {
    try {
      history = await Api.getHistory();
    } catch {
      history = [];
    }
    renderHistory();
  }

  function renderHistory() {
    UI.renderHistory(
      history,
      conversationId,
      onSelectHistory,
      onDeleteHistory
    );
  }

  async function onSelectHistory(id) {
    if (id === conversationId) { sidebar.classList.remove("open"); return; }
    try {
      const convo = await Api.getConversation(id);
      conversationId = id;
      messages = convo.messages || [];

      UI.clearMessages();
      UI.removeWelcome();
      UI.setTitle(convo.title);
      UI.setActiveHistory(id);

      // render all messages
      messages.forEach(m => UI.appendMessage(m.role === "user" ? "user" : "ai", m.content));
      sidebar.classList.remove("open");
    } catch (e) {
      UI.showToast("Failed to load conversation");
    }
  }

  async function onDeleteHistory(id) {
    await Api.deleteConversation(id);
    if (id === conversationId) newChat();
    history = history.filter(h => h.id !== id);
    renderHistory();
  }

  // ── Send message ───────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isStreaming) return;

    UI.removeWelcome();

    messages.push({ role: "user", content: text });
    UI.appendMessage("user", text);
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;
    isStreaming = true;

    const typingEl = UI.appendTyping();

    try {
      const { reply, conversation_id } = await Api.send(messages, conversationId);

      typingEl.remove();
      messages.push({ role: "assistant", content: reply });
      UI.appendMessage("ai", reply);

      // First message — set title & update history
      if (!conversationId) {
        conversationId = conversation_id;
        const title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
        UI.setTitle(title);
        history = await Api.getHistory();
        renderHistory();
      }

    } catch (err) {
      typingEl.remove();
      UI.appendMessage("ai", `⚠️ ${err.message || "Something went wrong. Is the server running?"}`);
      // roll back last user message
      messages.pop();
    }

    isStreaming = false;
    sendBtn.disabled = !inputEl.value.trim();
    UI.scrollBottom();
  }

  // ── Regenerate last AI response ────────────
  async function regenerate() {
    if (isStreaming) return;

    // Remove last assistant message from state + DOM
    const lastAiIdx = [...messages].map(m => m.role).lastIndexOf("assistant");
    if (lastAiIdx === -1) return;
    messages.splice(lastAiIdx, 1);

    const aiRows = document.querySelectorAll(".msg-row");
    const allRows = [...aiRows].filter(r => r.querySelector(".bubble.ai"));
    if (allRows.length) allRows[allRows.length - 1].remove();

    isStreaming = true;
    sendBtn.disabled = true;
    const typingEl = UI.appendTyping();

    try {
      const { reply } = await Api.send(messages, conversationId);
      typingEl.remove();
      messages.push({ role: "assistant", content: reply });
      UI.appendMessage("ai", reply);
    } catch (err) {
      typingEl.remove();
      UI.showToast("Regeneration failed: " + err.message);
    }

    isStreaming = false;
    sendBtn.disabled = !inputEl.value.trim();
  }

  // ── New chat ───────────────────────────────
  function newChat() {
    conversationId = null;
    messages = [];
    UI.clearMessages();
    UI.setTitle("New Chat");
    UI.setActiveHistory(null);
    sidebar.classList.remove("open");
  }

  // ── Suggestion chips ───────────────────────
  function sendFromSuggestion(text) {
    inputEl.value = text;
    inputEl.dispatchEvent(new Event("input"));
    sendMessage();
  }

  // Public surface
  return { init, regenerate, sendFromSuggestion };
})();

document.addEventListener("DOMContentLoaded", () => App.init());
