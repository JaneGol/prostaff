import { useEffect } from "react";

interface PageMetaOptions {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const BASE_TITLE = "ProStaff";
const DEFAULT_OG_IMAGE = "/og-image.png";

export function usePageMeta({ title, description, ogTitle, ogDescription, ogImage }: PageMetaOptions) {
  useEffect(() => {
    document.title = `${title} — ${BASE_TITLE}`;

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", ogTitle || title, "property");
    setMeta("og:description", ogDescription || description, "property");
    setMeta("og:image", ogImage || DEFAULT_OG_IMAGE, "property");
    setMeta("og:type", "website", "property");

    return () => {
      document.title = `${BASE_TITLE} — Работа в спорте`;
    };
  }, [title, description, ogTitle, ogDescription, ogImage]);
}
