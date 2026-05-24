// Deteguje vstavané (in-app) prehliadače ako Facebook/Messenger/Instagram/…,
// kde Google OAuth (popup aj redirect) typicky zlyhá ("disallowed_useragent").
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|FB_IAB|Messenger|Instagram|Line\/|Twitter|TikTok|Snapchat|; wv\)|WebView/i.test(
    ua
  );
}
