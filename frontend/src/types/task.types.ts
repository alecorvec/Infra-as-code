/**
 * Task data model
 */
export interface Task {
  id: string;
  title: string;
  content: string;
  due_date: string;
  done: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Request payload for creating a task
 */
export interface CreateTaskRequest {
  title: string;
  content: string;
  due_date: string;
  request_timestamp: string;
}

/**
 * Request payload for updating a task
 */
export interface UpdateTaskRequest {
  title?: string;
  content?: string;
  done?: boolean;
  due_date?: string;
  request_timestamp: string;
}

/**
 * Request payload for deleting a task
 */
export interface DeleteTaskRequest {
  request_timestamp: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/**
 * API Error response
 */
export interface ApiError {
  message: string;
  status: number;
  correlation_id?: string;
  errors?: Record<string, string[]>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}
