// Base API Response wrapper
export type ApiResponse<T> =
  | { success: true; data: T; error?: undefined; message?: string }
  | {
      success: false;
      error: string;
      message?: string;
    };

// Pagination types
export type PaginatedResponse<T> = {
  items: T[];
  nextPageState?: string;
  total?: number;
  hasMore?: boolean;
};

