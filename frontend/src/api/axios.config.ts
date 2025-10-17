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
    // Retry on network errors, 5xx server errors, or 429 (rate limiting)
    const status = error.response?.status
    return !error.response || 
           (status && status >= 500 && status < 600) || 
           status === 429 // Too Many Requests - retry after backoff
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
    const status = error.response?.status
    
    // Log error with correlation_id
    console.error(
      `[${correlationId}] Error: ${status || 'Network Error'}`,
      error.message
    )

    // Handle specific HTTP status codes
    switch (status) {
      case 400: // Bad Request
        console.error(`[${correlationId}] Bad Request: Invalid request body or parameters`)
        break
      
      case 401: // Unauthorized
        console.error(`[${correlationId}] Unauthorized: Invalid or missing authentication`)
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
        return Promise.reject(error)
      
      case 404: // Not Found
        console.error(`[${correlationId}] Not Found: Resource does not exist`)
        break
      
      case 409: // Conflict
        console.error(`[${correlationId}] Conflict: Timestamp/concurrency or duplicate conflict`)
        break
      
      case 429: // Too Many Requests
        console.warn(`[${correlationId}] Rate Limited: Cluster temporarily overloaded, will retry`)
        break
      
      case 500: // Internal Server Error
        console.error(`[${correlationId}] Server Error: Unexpected server failure`)
        break
    }

    // Implement retry logic for failed requests (5xx, 429, network errors)
    if (config && defaultRetryConfig.retryCondition?.(error)) {
      config._retry = config._retry || 0

      if (config._retry < defaultRetryConfig.retries) {
        config._retry += 1
        // Exponential backoff for 429 (rate limiting)
        const baseDelay = status === 429 ? 2000 : defaultRetryConfig.retryDelay
        const delay = baseDelay * Math.pow(2, config._retry - 1) // Exponential backoff

        console.log(
          `[${correlationId}] Retrying request (${config._retry}/${defaultRetryConfig.retries}) after ${delay}ms`
        )

        await new Promise((resolve) => setTimeout(resolve, delay))
        return axiosInstance(config)
      }
    }

    // Format error response with specific messages based on status code
    let errorMessage = (error.response?.data as { message?: string })?.message || error.message

    if (!errorMessage || errorMessage === 'Request failed with status code ' + status) {
      switch (status) {
        case 400:
          errorMessage = 'Requête invalide. Vérifiez les données envoyées.'
          break
        case 401:
          errorMessage = 'Authentification requise ou invalide.'
          break
        case 404:
          errorMessage = 'Ressource introuvable.'
          break
        case 409:
          errorMessage = 'Conflit détecté. La ressource a peut-être été modifiée.'
          break
        case 429:
          errorMessage = 'Trop de requêtes. Le serveur est temporairement surchargé.'
          break
        case 500:
          errorMessage = 'Erreur serveur inattendue. Veuillez réessayer.'
          break
        default:
          errorMessage = errorMessage || 'Une erreur est survenue'
      }
    }

    const apiError: ApiError = {
      message: errorMessage,
      status: status || 500,
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
