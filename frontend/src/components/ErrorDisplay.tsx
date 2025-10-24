interface ErrorDisplayProps {
  error: {
    message: string;
    status?: number;
    correlation_id?: string;
  } | null;
  onRetry?: () => void;
}

export const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => {
  if (!error) return null;

  // Déterminer la couleur et l'icône selon le code HTTP
  const getErrorStyle = (status?: number) => {
    switch (status) {
      case 400: // Bad Request
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-500',
          text: 'text-orange-800',
          icon: 'text-orange-400',
          title: 'Requête invalide',
        };
      case 401: // Unauthorized
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: 'text-red-400',
          title: '🔒 Non autorisé',
        };
      case 404: // Not Found
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-800',
          icon: 'text-blue-400',
          title: 'Introuvable',
        };
      case 409: // Conflict
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-800',
          icon: 'text-yellow-400',
          title: '⚡ Conflit',
        };
      case 429: // Too Many Requests
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-500',
          text: 'text-purple-800',
          icon: 'text-purple-400',
          title: '🚦 Limite atteinte',
        };
      case 500: // Server Error
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: 'text-red-400',
          title: 'Erreur serveur',
        };
    }
  };

  const style = getErrorStyle(error.status);

  // Déterminer si on doit montrer le bouton retry
  const showRetry =
    onRetry &&
    error.status &&
    (error.status >= 500 || // Erreurs serveur
      error.status === 429); // Rate limiting

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-4 rounded-lg shadow-md`}>
      <div className='flex items-start'>
        <div className='flex-shrink-0'>
          <svg className={`h-6 w-6 ${style.icon}`} viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <div className='ml-3 flex-1'>
          <h3 className={`text-sm font-bold ${style.text} mb-1`}>
            {style.title}
            {error.status && ` (${error.status})`}
          </h3>
          <p className={`text-sm ${style.text}`}>{error.message}</p>
          {error.correlation_id && (
            <p className={`mt-2 text-xs ${style.text} opacity-75 font-mono`}>
              ID: {error.correlation_id}
            </p>
          )}
          {showRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 text-sm font-medium px-4 py-2 rounded ${style.bg} ${style.text} border ${style.border} hover:opacity-80 transition-opacity`}
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
