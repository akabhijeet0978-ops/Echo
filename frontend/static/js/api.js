/**
 * api.js — thin client for the Flask backend
 */

const API_BASE = "/api";

const Api = {
  /**
   * Send a message and get a reply.
   * @param {Array}  messages        - [{role, content}, ...]
   * @param {string} conversationId  - existing conv id or null
   * @returns {Promise<{reply: string, conversation_id: string}>}
   */
  async send(messages, conversationId = null) {
    const res = await fetch(`${API_BASE}/chat/send`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ messages, conversation_id: conversationId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  },

  /**
   * Fetch all conversation summaries.
   * @returns {Promise<Array>}
   */
  async getHistory() {
    const res = await fetch(`${API_BASE}/history/`);
    if (!res.ok) throw new Error("Failed to load history");
    return res.json();
  },

  /**
   * Fetch full messages for one conversation.
   * @param {string} convId
   * @returns {Promise<Object>}
   */
  async getConversation(convId) {
    const res = await fetch(`${API_BASE}/history/${convId}`);
    if (!res.ok) throw new Error("Conversation not found");
    return res.json();
  },

  /**
   * Delete a conversation.
   * @param {string} convId
   */
  async deleteConversation(convId) {
    await fetch(`${API_BASE}/history/${convId}`, { method: "DELETE" });
  },

  /**
   * Clear all conversations.
   */
  async clearAll() {
    await fetch(`${API_BASE}/history/`, { method: "DELETE" });
  },
};
