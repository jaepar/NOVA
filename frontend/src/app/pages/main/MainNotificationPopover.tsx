import { Bell, CalendarClock, ShieldCheck } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { normalizeLanguage, useTranslation } from '../../i18n'
import type { NotificationResponse, NotificationType } from '../../../api'

function getNotificationDateLocale(language: string) {
  return normalizeLanguage(language) === 'en' ? 'en-US' : 'ko-KR'
}

function formatNotificationTime(createdAt: string, language: string) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return createdAt
  }

  return new Intl.DateTimeFormat(getNotificationDateLocale(language), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const Icon =
    type === 'SUPPLEMENT_DOCUMENT' || type === 'CERTIFICATE_ISSUED'
      ? ShieldCheck
      : CalendarClock

  return (
    <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-7 w-7" strokeWidth={2.4} />
    </div>
  )
}

function LoginRequiredMessage() {
  const { t } = useTranslation()

  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bell className="h-7 w-7" strokeWidth={2.4} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-semibold leading-[1.35] text-foreground">
          {t('notifications.loginRequiredTitle')}
        </h3>
        <p className="mt-1 text-[14px] leading-[1.45] text-muted-foreground">
          {t('notifications.loginRequiredDescription')}
        </p>
      </div>
    </div>
  )
}

interface MainNotificationPopoverProps {
  isLoggedIn: boolean
  notifications: NotificationResponse[]
  isLoading: boolean
  hasError: boolean
  onNotificationClick?: (notification: NotificationResponse) => void
}

export function MainNotificationPopover({
  isLoggedIn,
  notifications,
  isLoading,
  hasError,
  onNotificationClick,
}: MainNotificationPopoverProps) {
  const { language, t } = useTranslation()
  const visibleNotifications = notifications.slice(0, 2)

  const getNotificationTitle = (type: NotificationType) => t(`notifications.titles.${type}`)
  const getNotificationMessage = (type: NotificationType) => t(`notifications.messages.${type}`)

  return (
    <div className="absolute right-[-8px] top-[52px] z-[60] w-[calc(100vw-40px)] max-w-[322px] rounded-[18px] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.18)] ring-1 ring-black/5">
      <span className="absolute right-[72px] top-[-9px] h-5 w-5 rotate-45 bg-white shadow-[-2px_-2px_3px_rgba(15,23,42,0.04)]" />

      {!isLoggedIn ? (
        <LoginRequiredMessage />
      ) : isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="flex gap-3">
              <div className="h-[56px] w-[56px] shrink-0 rounded-full bg-muted animate-pulse" />
              <div className="min-w-0 flex-1 pt-1">
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="mt-2 h-4 w-full rounded bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-7 w-7" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-semibold leading-[1.35] text-foreground">
              {t('notifications.loadFailedTitle')}
            </h3>
            <p className="mt-1 text-[14px] leading-[1.45] text-muted-foreground">
              {t('notifications.loadFailedDescription')}
            </p>
          </div>
        </div>
      ) : visibleNotifications.length > 0 ? (
        <div className="relative space-y-3">
          {visibleNotifications.map((notification) => (
            <AppButton
              key={notification.notificationId}
              variant="unstyled"
              onClick={() => onNotificationClick?.(notification)}
              className="flex w-full gap-3 rounded-xl text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <NotificationIcon type={notification.type} />
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="break-words text-[15px] font-semibold leading-[1.35] text-foreground">
                  {getNotificationTitle(notification.type)}
                </h3>
                <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-[1.4] text-foreground">
                  {getNotificationMessage(notification.type)}
                </p>
                <p className="mt-1 text-[13px] leading-none text-muted-foreground">
                  {formatNotificationTime(notification.createdAt, language)}
                </p>
              </div>
            </AppButton>
          ))}
        </div>
      ) : (
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-7 w-7" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-semibold leading-[1.35] text-foreground">
              {t('notifications.noNewTitle')}
            </h3>
            <p className="mt-1 text-[14px] leading-[1.45] text-muted-foreground">
              {t('notifications.noNewDescription')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
