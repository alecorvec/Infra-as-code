import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from '../types/task.types'

/**
 * Generate a unique correlation ID for request tracing
 */
const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get current timestamp in ISO 8601 format
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString()
}

/**
 * Configuration for retry logic
 */
interface RetryConfig {
  retries: number
  retryDelay: number
  retryCondition?: (error: AxiosError) => boolean
}

const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600)
  },
}

/**
 * Create an Axios instance with advanced configuration for scalability
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 seconds for better handling of load balanced requests
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - Add auth, correlation_id, and request_timestamp
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add correlation_id for request tracing across load balancers
    const correlationId = generateCorrelationId()
    config.headers['correlation_id'] = correlationId
    
    // Store correlation_id in config for logging
    config.metadata = { correlationId, startTime: Date.now() }

    // Add request_timestamp to body if it's a POST, PUT, or DELETE
    if (config.data && ['post', 'put', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.data = {
        ...config.data,
        request_timestamp: getCurrentTimestamp(),
      }
    }

    console.log(`[${correlationId}] Request: ${config.method?.toUpperCase()} ${config.url}`)
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle errors, retries, and logging
 */
axiosInstance.interceptors.response.use(
  (response) => {
    const correlationId = response.config.metadata?.correlationId
    const duration = Date.now() - (response.config.metadata?.startTime || 0)
    
    console.log(
      `[${correlationId}] Response: ${response.status} (${duration}ms)`,
      response.config.url
    )
    
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: number }
    const correlationId = config?.metadata?.correlationId
    
    // Log error with correlation_id
    console.error(
      `[${correlationId}] Error: ${error.response?.status || 'Network Error'}`,
      error.message
    )

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Implement retry logic for failed requests
    if (config && defaultRetryConfig.retryCondition?.(error)) {
      config._retry = config._retry || 0

      if (config._retry < defaultRetryConfig.retries) {
        config._retry += 1
        const delay = defaultRetryConfig.retryDelay * config._retry

        console.log(
          `[${correlationId}] Retrying request (${config._retry}/${defaultRetryConfig.retries}) after ${delay}ms`
        )

        await new Promise((resolve) => setTimeout(resolve, delay))
        return axiosInstance(config)
      }
    }

    // Format error response
    const apiError: ApiError = {
      message: (error.response?.data as { message?: string })?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      correlation_id: correlationId,
      errors: (error.response?.data as { errors?: Record<string, string[]> })?.errors,
    }

    return Promise.reject(apiError)
  }
)

/**
 * Type augmentation for axios config to include metadata
 */
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      correlationId: string
      startTime: number
    }
    _retry?: number
  }
}

export default axiosInstance
