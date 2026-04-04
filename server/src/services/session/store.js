class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  getHistory(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    return this.sessions.get(sessionId);
  }

  addMessage(sessionId, role, content) {
    const history = this.getHistory(sessionId);
    history.push({ role, content });
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}

module.exports = new SessionStore(); // シングルトンとしてエクスポート
