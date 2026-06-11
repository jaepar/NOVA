import { useState } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, Gift } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppButton } from '../components/design-system/AppButton'
import { useTranslation } from '../i18n'

interface Notification {
  id: string
  type: 'success' | 'info' | 'alert' | 'event'
  titleKey: string
  messageKey: string
  timeKey: string
  isRead: boolean
}

export function Notifications() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      titleKey: 'notifications.sample.transferTitle',
      messageKey: 'notifications.sample.transferMessage',
      timeKey: 'notifications.sample.fiveMinutesAgo',
      isRead: false,
    },
    {
      id: '2',
      type: 'info',
      titleKey: 'notifications.sample.exchangeTitle',
      messageKey: 'notifications.sample.exchangeMessage',
      timeKey: 'notifications.sample.oneHourAgo',
      isRead: false,
    },
    {
      id: '3',
      type: 'event',
      titleKey: 'notifications.sample.eventTitle',
      messageKey: 'notifications.sample.eventMessage',
      timeKey: 'notifications.sample.threeHoursAgo',
      isRead: true,
    },
    {
      id: '4',
      type: 'alert',
      titleKey: 'notifications.sample.securityTitle',
      messageKey: 'notifications.sample.securityMessage',
      timeKey: 'notifications.sample.oneDayAgo',
      isRead: true,
    },
    {
      id: '5',
      type: 'info',
      titleKey: 'notifications.sample.depositTitle',
      messageKey: 'notifications.sample.depositMessage',
      timeKey: 'notifications.sample.twoDaysAgo',
      isRead: true,
    },
  ])

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'alert':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      case 'event':
        return <Gift className="w-6 h-6 text-blue-600" />
      default:
        return <Info className="w-6 h-6 text-blue-600" />
    }
  }

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    )
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <MobileLayout title="알림" titleKey="notifications.title" headerType="close" closePath="/main">
      <div className="space-y-4 pb-8">
        {unreadCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <p className="text-sm text-blue-800">
              {t('notifications.unreadCount').replace('{count}', String(unreadCount))}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-muted-foreground mb-2">{t('notifications.emptyTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('notifications.emptyDescription')}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <AppButton
                variant="unstyled"
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`w-full text-left p-4 rounded-xl transition-colors ${
                  notification.isRead
                    ? 'bg-secondary hover:bg-accent'
                    : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`break-words ${notification.isRead ? 'text-muted-foreground' : ''}`}>
                        {t(notification.titleKey)}
                      </h4>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                    <p
                      className={`text-sm mb-2 whitespace-pre-wrap break-words ${
                        notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {t(notification.messageKey)}
                    </p>
                    <p className="text-xs text-muted-foreground">{t(notification.timeKey)}</p>
                  </div>
                </div>
              </AppButton>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
