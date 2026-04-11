interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  };
}

export function successResponse<T>(data: T, meta?: PaginationMeta): SuccessResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function errorResponse(
  code: string,
  message: string,
  errors?: Record<string, string[]>
): ErrorResponseBody {
  return {
    success: false,
    error: { code, message, ...(errors && { errors }) },
  };
}
