import { useState, useEffect } from 'react'
import { Task } from '../../types/task.types'

interface TaskFormProps {
  task?: Task | null
  onSubmit: (data: {
    title: string
    content: string
    due_date: string
  }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const TaskForm = ({ task, onSubmit, onCancel, loading = false }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    content: task?.content || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Met à jour le formulaire quand la tâche change (pour l'édition)
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        content: task.content || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      })
    } else {
      // Réinitialise le formulaire pour une nouvelle tâche
      setFormData({
        title: '',
        content: '',
        due_date: '',
      })
    }
    // Réinitialise aussi les erreurs
    setErrors({})
  }, [task])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'La date d\'échéance est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      // Convertit la date au format ISO complet pour le backend
      const formattedData = {
        ...formData,
        due_date: formData.due_date ? `${formData.due_date}T00:00:00.000Z` : formData.due_date
      }

      // Debug: Log des données envoyées
      console.log('🚀 Données du formulaire envoyées:', formattedData)
      console.log('📅 Date formatée:', formattedData.due_date)
      console.log('📅 Date originale:', formData.due_date)
      console.log('📝 Tâche en cours d\'édition:', task)
      
      await onSubmit(formattedData)
      
      // Ne réinitialise le formulaire que si ce n'est pas une édition
      if (!task) {
        setFormData({ title: '', content: '', due_date: '' })
      }
      setErrors({})
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
      </h2>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Entrez le titre de la tâche"
          disabled={loading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Décrivez la tâche"
          disabled={loading}
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>

      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
          Date d'échéance *
        </label>
        <input
          type="date"
          id="due_date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.due_date ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.due_date && <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Enregistrement...' : task ? 'Mettre à jour' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
