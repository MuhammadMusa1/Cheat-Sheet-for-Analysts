"use strict";

/**
 * Domain model for a cheatsheet.
 * Holds normalisation, validation, and the search-matching logic
 * shared between the API and (conceptually) the frontend.
 */
class Cheatsheet {
  constructor({ slug, title, subtitle, level, tags, accent, sections } = {}) {
    this.slug = typeof slug === "string" ? slug.trim() : slug;
    this.title = title;
    this.subtitle = subtitle || "";
    this.level = level || "";
    this.accent = accent || "#2563eb";
    this.tags = Array.isArray(tags) ? tags : [];
    this.sections = Array.isArray(sections) ? sections : [];
  }

  /**
   * Validate the shape of incoming data.
   * Returns an array of human-readable error strings (empty = valid).
   */
  static validate(data, { requireSlug = true } = {}) {
    const errors = [];

    if (!data || typeof data !== "object") {
      return ["Request body must be a JSON object"];
    }

    if (requireSlug) {
      if (!data.slug || typeof data.slug !== "string" || !data.slug.trim()) {
        errors.push("slug is required and must be a non-empty string");
      } else if (!/^[a-z0-9-]+$/.test(data.slug.trim())) {
        errors.push("slug may only contain lowercase letters, digits, and hyphens");
      }
    }

    if (data.title !== undefined && (typeof data.title !== "string" || !data.title.trim())) {
      errors.push("title must be a non-empty string");
    }

    if (requireSlug && (data.title === undefined || data.title === null)) {
      errors.push("title is required");
    }

    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      errors.push("tags must be an array of strings");
    } else if (Array.isArray(data.tags) && data.tags.some((t) => typeof t !== "string")) {
      errors.push("every tag must be a string");
    }

    if (data.accent !== undefined && !/^#[0-9a-fA-F]{3,8}$/.test(String(data.accent))) {
      errors.push("accent must be a valid hex colour (e.g. #2563eb)");
    }

    if (data.sections !== undefined) {
      if (!Array.isArray(data.sections)) {
        errors.push("sections must be an array");
      } else {
        data.sections.forEach((section, i) => {
          if (!section || typeof section !== "object") {
            errors.push(`sections[${i}] must be an object`);
            return;
          }
          if (typeof section.title !== "string" || !section.title.trim()) {
            errors.push(`sections[${i}].title must be a non-empty string`);
          }
          if (!Array.isArray(section.items)) {
            errors.push(`sections[${i}].items must be an array`);
          } else if (section.items.some((item) => typeof item !== "string")) {
            errors.push(`sections[${i}].items must contain only strings`);
          }
        });
      }
    }

    return errors;
  }

  matches(query) {
    const term = String(query || "").trim().toLowerCase();

    if (!term) {
      return true;
    }

    const searchableText = [
      this.slug,
      this.title,
      this.subtitle,
      this.level,
      ...this.tags,
      ...this.sections.flatMap((section) => [section.title, ...(section.items || [])])
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(term);
  }

  toJSON() {
    return {
      slug: this.slug,
      title: this.title,
      subtitle: this.subtitle,
      level: this.level,
      accent: this.accent,
      tags: this.tags,
      sections: this.sections
    };
  }
}

module.exports = Cheatsheet;
