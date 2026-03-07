/**
 * @jest-environment node
 */

const mockSend = jest.fn();

jest.mock('@/lib/resend', () => ({
  resend: {
    emails: { send: mockSend },
  },
}));

import { sendEmail } from '@/lib/email/sendEmail';

beforeEach(() => jest.clearAllMocks());

describe('sendEmail', () => {
  it('sends email successfully', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('email-123');
  });

  it('passes correct params to Resend', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    await sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      html: '<p>Hi</p>',
      replyTo: 'reply@b.com',
    });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@b.com',
        subject: 'Test',
        html: '<p>Hi</p>',
        replyTo: 'reply@b.com',
      })
    );
  });

  it('uses default from address', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.stringContaining('Skyline Realty'),
      })
    );
  });

  it('allows custom from address', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>', from: 'custom@b.com' });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'custom@b.com' })
    );
  });

  it('handles Resend API errors', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Rate limited' } });
    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Rate limited');
  });

  it('handles thrown exceptions', async () => {
    mockSend.mockRejectedValue(new Error('Network error'));
    const result = await sendEmail({ to: 'a@b.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });
});
