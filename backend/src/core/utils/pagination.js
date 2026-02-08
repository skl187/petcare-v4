// src/core/utils/pagination.js
const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginate = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = { getPaginationParams, paginate };