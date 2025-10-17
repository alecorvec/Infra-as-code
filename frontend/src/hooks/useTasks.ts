import { useState, useEffect, useCallback } from 'react'
import { taskService } from '../api/services/task.service'
import { Task, ApiError, CreateTaskRequest, UpdateTaskRequest } from '../types/task.types'

/**
 * Hook for fetching all tasks with loading and error states
 */
export const useTasks = (autoFetch = true) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchTasks = useCallback(async (params?: {
    page?: number
    per_page?: number
    done?: boolean
    search?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await taskService.getTasks(params)
      setTasks(response.data)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchTasks()
    }
  }, [autoFetch, fetchTasks])

  return { tasks, loading, error, refetch: fetchTasks }
}

/**
 * Hook for fetching a single task by ID
 */
export const useTask = (id: string | null) => {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchTask = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const data = await taskService.getTaskById(id)
      setTask(data)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  return { task, loading, error, refetch: fetchTask }
}

/**
 * Hook for creating a new task
 */
export const useCreateTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState(false)

  const createTask = async (taskData: Omit<CreateTaskRequest, 'request_timestamp'>) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const newTask = await taskService.createTask(taskData)
      setSuccess(true)
      return newTask
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
  }

  return { createTask, loading, error, success, reset }
}

/**
 * Hook for updating a task
 */
export const useUpdateTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState(false)

  const updateTask = async (
    id: string,
    taskData: Omit<UpdateTaskRequest, 'request_timestamp'>
  ) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const updatedTask = await taskService.updateTask(id, taskData)
      setSuccess(true)
      return updatedTask
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const updatedTask = await taskService.toggleTaskStatus(id, currentStatus)
      setSuccess(true)
      return updatedTask
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
  }

  return { updateTask, toggleStatus, loading, error, success, reset }
}

/**
 * Hook for deleting a task
 */
export const useDeleteTask = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState(false)

  const deleteTask = async (id: string) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await taskService.deleteTask(id)
      setSuccess(true)
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
  }

  return { deleteTask, loading, error, success, reset }
}

/**
 * Hook for batch operations
 */
export const useBatchTasks = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const batchDelete = async (ids: string[]) => {
    setLoading(true)
    setError(null)

    try {
      await taskService.batchDeleteTasks(ids)
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const batchUpdateStatus = async (ids: string[], done: boolean) => {
    setLoading(true)
    setError(null)

    try {
      const updatedTasks = await taskService.batchUpdateStatus(ids, done)
      return updatedTasks
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { batchDelete, batchUpdateStatus, loading, error }
}
