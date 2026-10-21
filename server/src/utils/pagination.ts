import { Request } from "express";

export const getPagination = (req: Request) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
};

export const getPagingData = (totalItems: number, page: number, limit: number) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
