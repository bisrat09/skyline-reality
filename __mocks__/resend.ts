const mockSend = jest.fn().mockResolvedValue({
  data: { id: 'mock-email-id' },
  error: null,
});

export class Resend {
  emails = { send: mockSend };
}
