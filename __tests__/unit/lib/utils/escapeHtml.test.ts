import { escapeHtml } from '@/lib/utils/escapeHtml';

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes less-than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes greater-than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("O'Brien")).toBe('O&#39;Brien');
  });

  it('escapes all 5 characters together', () => {
    expect(escapeHtml('<a href="x" & \'y\'>')).toBe(
      '&lt;a href=&quot;x&quot; &amp; &#39;y&#39;&gt;'
    );
  });

  it('returns empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('returns safe strings unchanged', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
  });

  it('handles XSS payloads', () => {
    const payload = '<script>alert("xss")</script>';
    const result = escapeHtml(payload);
    expect(result).not.toContain('<script>');
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
});
