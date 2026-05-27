import { Bell, Menu } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'

interface MainHeaderActionsProps {
  hasUnreadNotifications: boolean
  onNotificationsClick: () => void
  onMenuClick: () => void
}

export function MainHeaderActions({
  hasUnreadNotifications,
  onNotificationsClick,
  onMenuClick,
}: MainHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <AppButton
        variant="unstyled"
        onClick={onNotificationsClick}
        className="p-2 hover:bg-secondary rounded-lg transition-colors relative"
      >
        <Bell className="w-6 h-6" />
        {hasUnreadNotifications && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </AppButton>
      <AppButton
        variant="unstyled"
        onClick={onMenuClick}
        className="p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </AppButton>
    </div>
  )
}
