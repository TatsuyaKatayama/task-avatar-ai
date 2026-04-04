const sessionStore = require('../../../services/session/store');

describe('SessionStore Service', () => {
  beforeEach(() => {
    sessionStore.clearSession('test-id');
  });

  test('should initialize empty history for new session', () => {
    const history = sessionStore.getHistory('test-id');
    expect(history).toEqual([]);
  });

  test('should add and retrieve messages correctly', () => {
    sessionStore.addMessage('test-id', 'user', 'Hello');
    sessionStore.addMessage('test-id', 'assistant', 'Hi there');
    
    const history = sessionStore.getHistory('test-id');
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual({ role: 'user', content: 'Hello' });
    expect(history[1]).toEqual({ role: 'assistant', content: 'Hi there' });
  });

  test('should clear session data', () => {
    sessionStore.addMessage('test-id', 'user', 'X');
    sessionStore.clearSession('test-id');
    expect(sessionStore.getHistory('test-id')).toEqual([]);
  });
});
