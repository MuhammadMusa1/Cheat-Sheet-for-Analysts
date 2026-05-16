class Cheatsheet {
  constructor({ slug, title, subtitle, level, tags, accent, sections }) {
    this.slug = slug;
    this.title = title;
    this.subtitle = subtitle;
    this.level = level;
    this.tags = tags || [];
    this.accent = accent || "#2563eb";
    this.sections = sections || [];
  }

  matches(query) {
    const term = query.trim().toLowerCase();

    if (!term) {
      return true;
    }

    const searchableText = [
      this.slug,
      this.title,
      this.subtitle,
      this.level,
      ...this.tags,
      ...this.sections.flatMap((section) => [section.title, ...section.items])
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(term);
  }
}

module.exports = Cheatsheet;
