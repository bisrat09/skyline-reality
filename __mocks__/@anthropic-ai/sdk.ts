const mockStream = {
  on: jest.fn().mockReturnThis(),
  finalMessage: jest.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'Mock response' }],
  }),
  [Symbol.asyncIterator]: jest.fn().mockReturnValue({
    next: jest.fn()
      .mockResolvedValueOnce({
        value: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Mock response' } },
        done: false,
      })
      .mockResolvedValueOnce({ done: true }),
  }),
};

const mockMessages = {
  stream: jest.fn().mockReturnValue(mockStream),
  create: jest.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'Mock response' }],
  }),
};

class Anthropic {
  messages = mockMessages;

  constructor() {}
}

export default Anthropic;
export { Anthropic };
