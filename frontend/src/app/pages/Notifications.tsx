import { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Gift } from 'lucide-react';
import { MobileLayout } from '../components/layout/MobileLayout';
import { AppButton } from '../components/design-system/AppButton';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'alert' | 'event';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export function Notifications() {

  // TODO: 실제 구현 시 API에서 가져올 데이터
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: '송금 완료',
      message: '김철수님에게 50,000원 송금이 완료되었습니다.',
      time: '5분 전',
      isRead: false,
    },
    {
      id: '2',
      type: 'info',
      title: '환율 변동 알림',
      message: 'USD 환율이 1,340.50원으로 변경되었습니다.',
      time: '1시간 전',
      isRead: false,
    },
    {
      id: '3',
      type: 'event',
      title: '이벤트 안내',
      message: '신규 고객 환전 수수료 할인 이벤트가 진행중입니다.',
      time: '3시간 전',
      isRead: true,
    },
    {
      id: '4',
      type: 'alert',
      title: '보안 알림',
      message: '새로운 기기에서 로그인이 감지되었습니다.',
      time: '1일 전',
      isRead: true,
    },
    {
      id: '5',
      type: 'info',
      title: '계좌 입금',
      message: '100,000원이 입금되었습니다.',
      time: '2일 전',
      isRead: true,
    },
  ]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'alert':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'event':
        return <Gift className="w-6 h-6 text-blue-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MobileLayout
      title="알림"
      headerType="close"
      closePath="/main"
    >
      <div className="space-y-4 pb-8">
        {/* Header Info */}
        {unreadCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <p className="text-sm text-blue-800">
              읽지 않은 알림 {unreadCount}개가 있습니다.
            </p>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-muted-foreground mb-2">알림이 없습니다</h3>
              <p className="text-sm text-muted-foreground">
                새로운 알림이 도착하면 여기에 표시됩니다.
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
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={notification.isRead ? 'text-muted-foreground' : ''}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                    <p className={`text-sm mb-2 ${
                      notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </AppButton>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
