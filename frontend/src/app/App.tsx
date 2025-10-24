import { useState } from 'react'
import { Task } from '../types/task.types'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { TaskList } from '../components/TaskList'
import { TaskForm } from '../components/TaskForm'
import { ErrorDisplay } from '../components/ErrorDisplay'

function App() {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  // Hooks for data fetching and mutations
  const { tasks, loading: tasksLoading, error: tasksError, refetch } = useTasks()
  const { createTask, loading: createLoading, error: createError } = useCreateTask()
  const { updateTask, toggleStatus, loading: updateLoading, error: updateError } = useUpdateTask()
  const { deleteTask, loading: deleteLoading, error: deleteError } = useDeleteTask()

  // Stats
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter((t) => t.done).length || 0
  const activeTasks = totalTasks - completedTasks
  const overdueTasks = tasks?.filter(
    (t) => !t.done && new Date(t.due_date) < new Date()
  ).length || 0

  const handleCreateTask = async (data: {
    title: string
    content: string
    due_date: string
  }) => {
    await createTask(data)
    setShowForm(false)
    refetch()
  }

  const handleUpdateTask = async (data: {
    title: string
    content: string
    due_date: string
  }) => {
    if (editingTask) {
      // Debug: Log des données avant et après
      console.log('🔄 Mise à jour de la tâche:', editingTask.id)
      console.log('📊 Données reçues du formulaire:', data)
      console.log('📅 Date reçue:', data.due_date)
      console.log('🏷️ Tâche originale:', editingTask)
      
      try {
        const updatedTask = await updateTask(editingTask.id, data)
        console.log('✅ Tâche mise à jour côté backend:', updatedTask)
        
        setEditingTask(null)
        setShowForm(false)
        
        // Petit délai pour laisser le backend traiter
        setTimeout(() => {
          console.log('🔄 Rafraîchissement de la liste...')
          refetch()
        }, 500)
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error)
      }
    }
  }

  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    await toggleStatus(id, currentStatus)
    refetch()
  }

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      await deleteTask(id)
      refetch()
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  // Load Balancer Test - Creates multiple tasks rapidly
  const [loadBalancerTestLoading, setLoadBalancerTestLoading] = useState(false)
  const handleLoadBalancerTest = async () => {
    setLoadBalancerTestLoading(true)
    const numberOfTasks = 500 // Nombre de tâches à créer
    const promises = []

    for (let i = 1; i <= numberOfTasks; i++) {
      const taskData = {
        title: `Load Test Task #${i}`,
        content: `Tâche automatique générée pour tester le load balancer - ${new Date().toISOString()}`,
        due_date: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] // Échelonne les dates
      }
      promises.push(createTask(taskData))
    }

    try {
      await Promise.all(promises)
      refetch() // Rafraîchit la liste des tâches
    } catch (error) {
      console.error('Erreur lors du test du load balancer:', error)
    } finally {
      setLoadBalancerTestLoading(false)
    }
  }

  // Delete All Tasks - Supprime toutes les tâches
  const [deleteAllLoading, setDeleteAllLoading] = useState(false)
  const handleDeleteAllTasks = async () => {
    if (!tasks || tasks.length === 0) {
      alert('Aucune tâche à supprimer')
      return
    }

    const confirmDelete = window.confirm(
      `⚠️ Êtes-vous sûr de vouloir supprimer TOUTES les ${tasks.length} tâches ?\n\nCette action est irréversible !`
    )

    if (!confirmDelete) return

    setDeleteAllLoading(true)
    const deletePromises = tasks.map(task => deleteTask(task.id))

    try {
      await Promise.all(deletePromises)
      alert(`✅ ${tasks.length} tâches supprimées avec succès !`)
      refetch() // Rafraîchit la liste des tâches
    } catch (error) {
      console.error('Erreur lors de la suppression des tâches:', error)
      alert('❌ Erreur lors de la suppression de certaines tâches')
    } finally {
      setDeleteAllLoading(false)
    }
  }

  const isLoading = tasksLoading || createLoading || updateLoading || deleteLoading || loadBalancerTestLoading || deleteAllLoading
  const error = tasksError || createError || updateError || deleteError

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAllTasks}
                disabled={deleteAllLoading || totalTasks === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {deleteAllLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Suppression...
                  </>
                ) : (
                  <>
                    🗑️ Supprimer Tout ({totalTasks})
                  </>
                )}
              </button>
              <button
                onClick={handleLoadBalancerTest}
                disabled={loadBalancerTestLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {loadBalancerTestLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Test en cours...
                  </>
                ) : (
                  <>
                    ⚡ Test Load Balancer
                  </>
                )}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                {showForm ? 'Fermer' : '+ Nouvelle tâche'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-3xl font-bold text-orange-600">{activeTasks}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Complétées</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En retard</p>
                <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && <ErrorDisplay error={error} onRetry={refetch} />}

        {/* Task Form */}
        {showForm && (
          <div className="mb-8">
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={handleCancelForm}
              loading={isLoading}
            />
          </div>
        )}

        {/* Task List */}
        <TaskList
          tasks={tasks || []}
          loading={tasksLoading}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            🚀 Built with React + TypeScript | Tailwind CSS | Axios
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            © 2025 Task Manager App. All rights reserved to bozos in group 12.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
