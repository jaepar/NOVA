import { useEffect, useRef } from 'react'
import { Bell, Menu } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { MainNotificationPopover } from './MainNotificationPopover'
import type { NotificationResponse } from '../../../api'

interface MainHeaderActionsProps {
  hasUnreadNotifications: boolean
  isLoggedIn: boolean
  isNotificationOpen: boolean
  notifications: NotificationResponse[]
  isNotificationsLoading: boolean
  notificationsError: boolean
  onNotificationsClick: () => void
  onNotificationsClose: () => void
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
  onMenuClick,
}: MainHeaderActionsProps) {
  const notificationRef = useRef<HTMLDivElement>(null)

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
          aria-label="알림 목록 열기"
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
        aria-label="메뉴 열기"
        className="p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </AppButton>
      {isNotificationOpen && (
        <MainNotificationPopover
          isLoggedIn={isLoggedIn}
          notifications={notifications}
          isLoading={isNotificationsLoading}
          hasError={notificationsError}
        />
      )}
    </div>
  )
}
