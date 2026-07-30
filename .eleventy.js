const flattenCache = new WeakMap();

function flattenContributions(data) {
  if (flattenCache.has(data)) return flattenCache.get(data);

  const flat = [];
  for (const topic of data.topics) {
    for (const project of topic.projects) {
      for (const repo of project.repos) {
        for (const item of repo.items) {
          flat.push({
            ...item,
            topic: topic.name,
            project: project.name,
            repo: repo.name,
            repoUrl: repo.url,
          });
        }
      }
    }
  }

  flattenCache.set(data, flat);
  return flat;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  // {{ item.relatedIds | resolveRelated(contributions) }}
  // Looks up related issues/MRs anywhere in the dataset by id, so a link
  // is never mandatory on the other side — if nobody points back, that's fine.
  eleventyConfig.addFilter(
    "resolveRelated",
    function (relatedIds, contributions) {
      if (!relatedIds || !relatedIds.length) return [];
      const flat = flattenContributions(contributions);
      return relatedIds
        .map((id) => flat.find((item) => item.id === id))
        .filter(Boolean);
    },
  );

  return {
    dir: {
      input: "src",
      output: "docs",
    },
  };
};
