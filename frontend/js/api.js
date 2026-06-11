"use strict";

/**
 * Thin wrapper around the backend REST API.
 * All network access to /api/* goes through here so the rest of the
 * frontend never builds URLs or handles fetch errors by hand.
 *
 * Falls back to the static data/cheatsheets.json when the API is not
 * reachable (e.g. the site is served as plain static files), so the
 * pages keep working in both modes.
 */
const API = (() => {
  const BASE = "/api";

  async function request(path) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) {
      throw new Error(`API ${path} -> ${res.status}`);
    }
    return res.json();
  }

  async function staticFallback() {
    const url = new URL("../data/cheatsheets.json", window.location.href);
    const res = await fetch(url);
    return res.json();
  }

  return {
    /** List every cheatsheet. */
    async list() {
      try {
        return await request("/cheatsheets");
      } catch {
        return staticFallback();
      }
    },

    /** Get one cheatsheet by slug, or null if not found. */
    async get(slug) {
      try {
        return await request(`/cheatsheets/${encodeURIComponent(slug)}`);
      } catch {
        const all = await staticFallback();
        return all.find((c) => c.slug === slug) || null;
      }
    },

    /** Search across all fields; empty query returns everything. */
    async search(query) {
      const q = String(query || "").trim();
      try {
        return await request(`/search?q=${encodeURIComponent(q)}`);
      } catch {
        const all = await staticFallback();
        if (!q) return all;
        const term = q.toLowerCase();
        return all.filter((item) =>
          [
            item.slug, item.title, item.subtitle, item.level,
            ...item.tags,
            ...item.sections.flatMap((s) => [s.title, ...s.items])
          ].join(" ").toLowerCase().includes(term)
        );
      }
    }
  };
})();
