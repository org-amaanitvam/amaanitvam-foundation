export const sendSuccess = (res, statusCode, data, meta = {}) => {
  res.status(statusCode).json({
    success: true,
    data,
    meta,
  });
};

export const sendList = (res, statusCode, data, count, meta = {}) => {
  res.status(statusCode).json({
    success: true,
    data,
    meta: {
      ...meta,
      page: meta.page || 1,
      limit: meta.limit || 10,
      total: count,
    },
  });
};
