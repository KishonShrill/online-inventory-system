export function filterBySearchQuery(items, query, fields = []) {
  if (!query || fields.length === 0) return items;

  const loweredQuery = query.toLowerCase();

  return items.filter(item =>
    fields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item); // supports nested props
      return value?.toString().toLowerCase().includes(loweredQuery);
    })
  );
}