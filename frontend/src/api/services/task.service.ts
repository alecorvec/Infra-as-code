import httpClient, { getCurrentTimestamp } from '../axios.config'
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
  PaginatedResponse,
} from '../../types/task.types'

/**
 * Task Service - Abstraction layer for Task API endpoints
 * This service handles all HTTP requests related to tasks
 * and provides a clean interface for the application layer
 */
class TaskService {
  private readonly BASE_PATH = '/tasks'

  /**
   * Get all tasks with optional pagination and filters
   */
  async getTasks(params?: {
    page?: number
    per_page?: number
    done?: boolean
    search?: string
  }): Promise<PaginatedResponse<Task>> {
    const response = await httpClient.get<Task[] | PaginatedResponse<Task>>(this.BASE_PATH, {
      params,
    })
    
    // Si la réponse est directement un tableau, on l'encapsule dans le format attendu
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: {
          current_page: 1,
          per_page: response.data.length,
          total: response.data.length,
          total_pages: 1
        }
      }
    }
    
    return response.data as PaginatedResponse<Task>
  }

  /**
   * Get a specific task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    const response = await httpClient.get<Task>(`${this.BASE_PATH}/${id}`)
    return response.data
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<CreateTaskRequest, 'request_timestamp'>): Promise<Task> {
    const payload: CreateTaskRequest = {
      ...taskData,
      request_timestamp: getCurrentTimestamp(),
    }
    
    const response = await httpClient.post<Task>(this.BASE_PATH, payload)
    return response.data
  }

  /**
   * Update an existing task
   */
  async updateTask(
    id: string,
    taskData: Omit<UpdateTaskRequest, 'request_timestamp'>
  ): Promise<Task> {
    const payload: UpdateTaskRequest = {
      ...taskData,
      request_timestamp: getCurrentTimestamp(),
    }
    
    const response = await httpClient.put<Task>(
      `${this.BASE_PATH}/${id}`,
      payload
    )
    return response.data
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskStatus(id: string, currentStatus: boolean): Promise<Task> {
    return this.updateTask(id, { done: !currentStatus })
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const payload: DeleteTaskRequest = {
      request_timestamp: getCurrentTimestamp(),
    }
    
    await httpClient.delete(`${this.BASE_PATH}/${id}`, { data: payload })
  }

  /**
   * Batch operations for better performance with load balancing
   */
  async batchDeleteTasks(ids: string[]): Promise<void> {
    const deletePromises = ids.map((id) => this.deleteTask(id))
    await Promise.all(deletePromises)
  }

  /**
   * Batch update tasks status
   */
  async batchUpdateStatus(ids: string[], done: boolean): Promise<Task[]> {
    const updatePromises = ids.map((id) => this.updateTask(id, { done }))
    return Promise.all(updatePromises)
  }
}

// Export a singleton instance
export const taskService = new TaskService()
export default taskService
