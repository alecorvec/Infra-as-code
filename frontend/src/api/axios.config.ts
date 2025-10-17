/**
 * Get current timestamp in ISO 8601 format
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString()
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface FetchOptions {
  params?: Record<string, string | number | boolean>
  data?: unknown
}

class SimpleHttpClient {
  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(path, BASE_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return url.toString()
  }

  private async makeRequest(method: string, url: string, options: FetchOptions = {}) {
    const { data } = options
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      mode: 'cors',
    }

    if (data) {
      fetchOptions.body = JSON.stringify(data)
    }

    console.log(`${method} ${url}`)
    
    try {
      const response = await fetch(url, fetchOptions)
      
      console.log(`Response: ${response.status}`)
      
      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // Ignore JSON parse errors for error responses
        }
        
        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      
      return {
        data: responseData,
        status: response.status,
      }
    } catch (error) {
      console.error(`Erreur ${method} ${url}:`, error)
      throw error
    }
  }

  async get<T>(path: string, options: FetchOptions = {}) {
    const url = this.buildUrl(path, options.params)
    return this.makeRequest('GET', url, options) as Promise<{ data: T; status: number }>
  }

  async post<T>(path: string, data?: unknown) {
    const url = this.buildUrl(path)
    return this.makeRequest('POST', url, { data }) as Promise<{ data: T; status: number }>
  }

  async put<T>(path: string, data?: unknown) {
    const url = this.buildUrl(path)
    return this.makeRequest('PUT', url, { data }) as Promise<{ data: T; status: number }>
  }

  async delete(path: string, options: FetchOptions = {}) {
    const url = this.buildUrl(path)
    return this.makeRequest('DELETE', url, options) as Promise<{ data: unknown; status: number }>
  }
}

const httpClient = new SimpleHttpClient()
export default httpClient
