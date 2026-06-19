import { useEffect } from 'react';

export const SITE_URL = 'https://pawly.sk';

interface Props {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function Seo({ title, description, path, noindex, jsonLd }: Props) {
  useEffect(() => {
    document.title = title;
    upsertMeta('property', 'og:title', title);
    upsertMeta('name', 'twitter:title', title);

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }

    const canonical = `${SITE_URL}${path ?? window.location.pathname}`;
    upsertLink('canonical', canonical);
    upsertMeta('property', 'og:url', canonical);

    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
  }, [title, description, path, noindex]);

  useEffect(() => {
    if (!jsonLd) return;
    const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    const scripts = schemas.map((schema) => {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.text = JSON.stringify(schema);
      document.head.appendChild(el);
      return el;
    });
    return () => {
      scripts.forEach((el) => el.remove());
    };
  }, [jsonLd]);

  return null;
}
