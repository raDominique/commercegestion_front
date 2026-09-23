import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Loader } from '../../components/ui/loader';
import { useNotificationsContext } from '../../context/NotificationsContext';
import usePageTitle from '../../utils/usePageTitle';

function NotificationRow({ notification, formatRelative, onOpen }) {
  const readClass = notification.isRead
    ? 'border-neutral-100 bg-neutral-50 text-neutral-400'
    : 'border-violet-100 bg-white text-neutral-900';

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`w-full border-b p-4 text-left transition hover:bg-violet-50 last:border-b-0 ${readClass}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-neutral-300' : 'bg-violet-600'}`} />
        <span className="min-w-0 flex-1">
          <span className={`block text-sm ${notification.isRead ? 'font-normal' : 'font-bold'}`}>
            {notification.title || 'Notification'}
          </span>
          <span className="mt-1 block text-sm leading-relaxed">{notification.message}</span>
          <span className="mt-2 block text-xs text-neutral-400">{formatRelative(notification.createdAt)}</span>
        </span>
      </div>
    </button>
  );
}

export default function Notifications() {
  usePageTitle('Notifications');
  const {
    visibleNotifications,
    loadingHistory,
    showRead,
    setShowRead,
    unreadCount,
    markAllRead,
    openNotification,
    formatRelative,
  } = useNotificationsContext();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <NotificationsIcon className="text-violet-600" />
            <h1 className="text-2xl font-semibold text-neutral-900">Notifications</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Consultez vos alertes et le suivi de vos opérations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowRead((value) => !value)}>
            {showRead ? 'Masquer les lues' : 'Tout afficher'}
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllRead}>
              <MarkEmailReadIcon className="mr-2 h-4 w-4" />
              Tout marquer lu
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border-neutral-200 bg-white shadow-sm">
        {loadingHistory ? (
          <div className="flex justify-center py-12"><Loader message="Chargement des notifications..." /></div>
        ) : visibleNotifications.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-neutral-500">
            {showRead ? 'Aucune notification.' : 'Aucune notification non lue.'}
          </div>
        ) : (
          visibleNotifications.map((notification) => (
            <NotificationRow
              key={notification._id}
              notification={notification}
              formatRelative={formatRelative}
              onOpen={openNotification}
            />
          ))
        )}
      </Card>
    </div>
  );
}
