export type EmailLocale = 'sk' | 'en';

// Brand farby zladené s client/src/theme.ts (light palette primary).
// Hardcoded lebo mail klient nemá prístup k JS-themu, ale držať synchronizované.
const BRAND_PRIMARY = '#0F4C5C';
const BRAND_PRIMARY_DARK = '#06303A';
const BACKGROUND = '#FAF7F2';
const SURFACE = '#FFFFFF';
const TEXT_PRIMARY = '#1A2A2F';
const TEXT_SECONDARY = '#5C6B70';
const DIVIDER = '#E6DFD4';

const LOGO_URL = 'https://pawly.sk/icons/icon-192.png';
const APP_NAME = 'Pawly';

interface Copy {
  subject: string;
  heading: string;
  intro: string;
  cta: string;
  fallbackPrefix: string;
  fallbackLinkText: string;
  fallbackSuffix: string;
  expires: string;
  footerTagline: string;
  footerReason: string;
  footerIgnore: string;
  preheader: string;
}

const COPIES: Record<EmailLocale, Copy> = {
  sk: {
    subject: 'Over si svoj e-mail v Pawly',
    preheader: 'Aktivuj svoj Pawly účet jedným klikom.',
    heading: 'Over si svoj e-mail',
    intro:
      'Vitaj v Pawly! Aby sme mohli pokračovať, potvrď prosím svoju e-mailovú adresu kliknutím na tlačidlo nižšie.',
    cta: 'Overiť e-mail',
    fallbackPrefix: 'Ak tlačidlo nefunguje, ',
    fallbackLinkText: 'klikni sem',
    fallbackSuffix: '.',
    expires: 'Odkaz je platný 24 hodín od odoslania.',
    footerTagline: 'Pawly — digitálny zdravotný pas pre tvoje zviera.',
    footerReason: 'Tento e-mail si dostal/a, lebo si si vytvoril/a účet na pawly.sk.',
    footerIgnore: 'Ak si to nebol/a ty, e-mail môžeš pokojne ignorovať.',
  },
  en: {
    subject: 'Verify your email for Pawly',
    preheader: 'Activate your Pawly account in one click.',
    heading: 'Verify your email',
    intro:
      'Welcome to Pawly! To get started, please confirm your email address by clicking the button below.',
    cta: 'Verify email',
    fallbackPrefix: "If the button doesn't work, ",
    fallbackLinkText: 'click here',
    fallbackSuffix: ' instead.',
    expires: 'The link is valid for 24 hours.',
    footerTagline: 'Pawly — a digital health passport for your pet.',
    footerReason: 'You received this email because an account was created at pawly.sk.',
    footerIgnore: "If this wasn't you, you can safely ignore this email.",
  },
};

export function subjectFor(locale: EmailLocale): string {
  return COPIES[locale].subject;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildVerificationHtml(link: string, locale: EmailLocale): string {
  const c = COPIES[locale];
  const safeLink = escapeHtml(link);
  const fontStack =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(c.subject)}</title>
</head>
<body style="margin:0; padding:0; background-color:${BACKGROUND}; font-family:${fontStack}; color:${TEXT_PRIMARY};">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; visibility:hidden; mso-hide:all;">
    ${escapeHtml(c.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BACKGROUND};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">
          <tr>
            <td align="center" style="padding:24px 16px 16px;">
              <img src="${LOGO_URL}" width="64" height="64" alt="${APP_NAME}" style="display:block; border:0; border-radius:14px;">
              <div style="font-size:22px; font-weight:700; color:${BRAND_PRIMARY}; margin-top:12px; letter-spacing:-0.01em;">${APP_NAME}</div>
            </td>
          </tr>

          <tr>
            <td style="background-color:${SURFACE}; border-radius:16px; padding:36px 32px; border:1px solid ${DIVIDER};">
              <h1 style="margin:0 0 16px; font-size:24px; line-height:1.3; color:${TEXT_PRIMARY}; font-weight:700;">
                ${escapeHtml(c.heading)}
              </h1>
              <p style="margin:0 0 28px; font-size:16px; line-height:1.6; color:${TEXT_PRIMARY};">
                ${escapeHtml(c.intro)}
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:10px; background-color:${BRAND_PRIMARY};">
                    <a href="${safeLink}"
                       style="display:inline-block; padding:14px 32px; font-size:16px; font-weight:600; color:${SURFACE}; text-decoration:none; border-radius:10px; background-color:${BRAND_PRIMARY}; border:1px solid ${BRAND_PRIMARY_DARK};">
                      ${escapeHtml(c.cta)}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px; font-size:13px; line-height:1.5; color:${TEXT_SECONDARY};">
                ${escapeHtml(c.fallbackPrefix)}<a href="${safeLink}" style="color:${BRAND_PRIMARY}; text-decoration:underline; font-weight:600;">${escapeHtml(c.fallbackLinkText)}</a>${escapeHtml(c.fallbackSuffix)}
              </p>
              <p style="margin:0; font-size:12px; line-height:1.5; color:${TEXT_SECONDARY};">
                ${escapeHtml(c.expires)}
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 16px; font-size:12px; line-height:1.6; color:${TEXT_SECONDARY};">
              <div style="margin-bottom:4px;">${escapeHtml(c.footerTagline)}</div>
              <div style="margin-bottom:4px;">${escapeHtml(c.footerReason)}</div>
              <div>${escapeHtml(c.footerIgnore)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
