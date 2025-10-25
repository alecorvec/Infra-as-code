import { Task } from '../types/task.types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskList = ({ tasks, loading, onToggle, onDelete, onEdit }: TaskListProps) => {
  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-md p-12 text-center'>
        <div className='text-gray-400 mb-4'>
          <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-1'>Aucune tâche</h3>
        <p className='text-gray-500'>Commencez par créer votre première tâche</p>
      </div>
    );
  }

  // Séparer les tâches complétées et non complétées
  const activeTasks = tasks.filter(task => !task.done);
  const completedTasks = tasks.filter(task => task.done);

  return (
    <div className='space-y-6'>
      {activeTasks.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-3'>
            Tâches actives ({activeTasks.length})
          </h3>
          <div className='space-y-3'>
            {activeTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-3'>
            Complétées ({completedTasks.length})
          </h3>
          <div className='space-y-3'>
            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
