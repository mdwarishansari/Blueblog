// frontend/types/api.ts

export interface ApiResponse<T> {
  status: 'success' | 'error'
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
}
