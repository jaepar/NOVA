import { lazy, Suspense, useEffect, useRef } from 'react'
import { Bell, Menu } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { useTranslation } from '../../i18n'
import type { NotificationResponse } from '../../../api/endpoints/user'

const LazyMainNotificationPopover = lazy(async () => {
  const module = await import('./MainNotificationPopover')

  return { default: module.MainNotificationPopover }
})

interface MainHeaderActionsProps {
  hasUnreadNotifications: boolean
  isLoggedIn: boolean
  isNotificationOpen: boolean
  notifications: NotificationResponse[]
  isNotificationsLoading: boolean
  notificationsError: boolean
  onNotificationsClick: () => void
  onNotificationsClose: () => void
  onNotificationClick: (notification: NotificationResponse) => void
  onMenuClick: () => void
}

export function MainHeaderActions({
  hasUnreadNotifications,
  isLoggedIn,
  isNotificationOpen,
  notifications,
  isNotificationsLoading,
  notificationsError,
  onNotificationsClick,
  onNotificationsClose,
  onNotificationClick,
  onMenuClick,
}: MainHeaderActionsProps) {
  const notificationRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!isNotificationOpen) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (
        target instanceof Node &&
        !notificationRef.current?.contains(target)
      ) {
        onNotificationsClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isNotificationOpen, onNotificationsClose])

  return (
    <div ref={notificationRef} className="relative flex items-center gap-2">
      <div>
        <AppButton
          variant="unstyled"
          onClick={onNotificationsClick}
          aria-label={t('notifications.openList')}
          aria-expanded={isNotificationOpen}
          className="p-2 hover:bg-secondary rounded-lg transition-colors relative"
        >
          <Bell className="w-6 h-6" />
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </AppButton>
      </div>
      <AppButton
        variant="unstyled"
        onClick={onMenuClick}
        aria-label={t('notifications.openMenu')}
        className="p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </AppButton>
      {isNotificationOpen && (
        <Suspense fallback={null}>
          <LazyMainNotificationPopover
            isLoggedIn={isLoggedIn}
            notifications={notifications}
            isLoading={isNotificationsLoading}
            hasError={notificationsError}
            onNotificationClick={onNotificationClick}
          />
        </Suspense>
      )}
    </div>
  )
}
