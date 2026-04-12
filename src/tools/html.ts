// HTML encoder/decoder

export function htmlEncode(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function htmlDecode(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function htmlEntitiesEncode(input: string): string {
  return input.replace(/[\u00A0-\u9999<>]/g, (c) => '&#' + c.charCodeAt(0) + ';');
}

export function escapeCss(input: string): string {
  // Escape CSS special characters for use in CSS selectors
  return input.replace(/([\\^$*+?()=!|,<>[\]{}:#'"~])/g, '\\$1');
}

export function escapeUrl(input: string): string {
  try {
    return encodeURIComponent(input);
  } catch {
    return input;
  }
}
