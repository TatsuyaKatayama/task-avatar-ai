const { extractJSON } = require('../../../utils/jsonParser');

describe('JSONParser Utility', () => {
  test('should parse plain JSON string', () => {
    const input = '{"emotion": "happy", "text": "Hello"}';
    expect(extractJSON(input)).toEqual({ emotion: 'happy', text: 'Hello' });
  });

  test('should extract JSON from markdown code blocks', () => {
    const input = 'Sure, here it is:\n```json\n{"emotion": "smile", "text": "Welcome"}\n```';
    expect(extractJSON(input)).toEqual({ emotion: 'smile', text: 'Welcome' });
  });

  test('should return null for invalid JSON', () => {
    const input = 'This is not JSON at all';
    expect(extractJSON(input)).toBeNull();
  });
});
