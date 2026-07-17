export const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

export const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

export const pick = (object, keys) =>
  keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
