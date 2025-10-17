import { Task } from '../../types/task.types'
import { CheckCircleIcon, ClockIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

interface TaskCardProps {
  task: Task
  onToggle: (id: string, currentStatus: boolean) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}

export const TaskCard = ({ task, onToggle, onDelete, onEdit }: TaskCardProps) => {
  const isOverdue = new Date(task.due_date) < new Date() && !task.done
  const dueDate = new Date(task.due_date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all duration-200 hover:shadow-lg ${
        task.done
          ? 'border-green-500 opacity-75'
          : isOverdue
          ? 'border-red-500'
          : 'border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => onToggle(task.id, task.done)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.done
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {task.done && <CheckCircleIcon className="w-4 h-4 text-white" />}
            </button>
            <h3
              className={`text-lg font-semibold ${
                task.done ? 'line-through text-gray-500' : 'text-gray-800'
              }`}
            >
              {task.title}
            </h3>
          </div>

          <p className={`text-gray-600 mb-3 ml-9 ${task.done ? 'line-through' : ''}`}>
            {task.content}
          </p>

          <div className="flex items-center gap-2 ml-9">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span
              className={`text-sm ${
                isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'
              }`}
            >
              {isOverdue && !task.done && '⚠️ '}
              Due: {dueDate}
            </span>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
