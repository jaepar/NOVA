import { Bell, CalendarClock, ShieldCheck } from 'lucide-react'

type MainNotificationType = 'certificate' | 'registration'

interface MainNotification {
  id: string
  type: MainNotificationType
  title: string
  message: string
  time: string
}

const notifications: MainNotification[] = [
  {
    id: 'certificate-review',
    type: 'certificate',
    title: '인증서 발급 심사 결과 알림',
    message: '필수 서류 항목이 누락되어 보완 서류 제출이 필요합니다.',
    time: '2026.06.05 14:30',
  },
  {
    id: 'registration-deadline',
    type: 'registration',
    title: '외국인등록증 등록 알림',
    message: '외국인등록증 등록까지 7일 남았습니다.',
    time: '2026.06.05 09:00',
  },
]

function NotificationIcon({ type }: { type: MainNotificationType }) {
  const Icon = type === 'certificate' ? ShieldCheck : CalendarClock

  return (
    <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-7 w-7" strokeWidth={2.4} />
    </div>
  )
}

function LoginRequiredMessage() {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bell className="h-7 w-7" strokeWidth={2.4} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-semibold leading-[1.35] text-foreground">
          로그인이 필요합니다
        </h3>
        <p className="mt-1 text-[14px] leading-[1.45] text-muted-foreground">
          알림을 확인하려면 먼저 로그인해 주세요.
        </p>
      </div>
    </div>
  )
}

interface MainNotificationPopoverProps {
  isLoggedIn: boolean
}

export function MainNotificationPopover({
  isLoggedIn,
}: MainNotificationPopoverProps) {
  return (
    <div className="absolute right-[-8px] top-[52px] z-[60] w-[calc(100vw-40px)] max-w-[322px] rounded-[18px] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.18)] ring-1 ring-black/5">
      <span className="absolute right-[72px] top-[-9px] h-5 w-5 rotate-45 bg-white shadow-[-2px_-2px_3px_rgba(15,23,42,0.04)]" />

      {isLoggedIn ? (
        <div className="relative space-y-3">
          {notifications.slice(0, 2).map((notification) => (
            <div key={notification.id} className="flex gap-3">
              <NotificationIcon type={notification.type} />
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="text-[15px] font-semibold leading-[1.35] text-foreground">
                  {notification.title}
                </h3>
                <p className="mt-1 text-[14px] leading-[1.4] text-foreground">
                  {notification.message}
                </p>
                <p className="mt-1 text-[13px] leading-none text-muted-foreground">
                  {notification.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <LoginRequiredMessage />
      )}
    </div>
  )
}
