import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { BottomNav } from '../../components/layout/BottomNav'
import { novaToast } from '../../components/design-system/toast'
import { useTranslation } from '../../i18n'
import type { AccountHomeResponse } from '../../../api/endpoints/banking'
import { MainHeaderActions } from '../main/MainHeaderActions'
import { MainAccountPanel } from '../main/MainAccountPanel'
import { MainJobBanner } from '../main/MainJobBanner'
import { MainServiceGrid } from '../main/MainServiceGrid'
import { MainExchangeRateGrid } from '../main/MainExchangeRateGrid'
import hospitalReservationIcon from '../main/assets/hospital-reservation-icon.webp'
import registrationCardIcon from '../main/assets/registration-card-icon.webp'
import walletIcon from '../main/assets/wallet-icon.webp'
import type { ExchangeRateItem, ServiceItem } from '../main/types'
import { DemoHeaderBrand } from './DemoHeaderBrand'
import { useDemoVerificationStore } from './demoVerificationStore'
import '../main/main.css'
import './demo-home.css'

const demoExchangeRates: ExchangeRateItem[] = [
  { currency: 'USD', rate: '1,382.40', change: '+0.21%', trend: 'UP' },
  { currency: 'JPY', rate: '923.18', change: '-0.14%', trend: 'DOWN' },
  { currency: 'EUR', rate: '1,604.72', change: '+0.08%', trend: 'UP' },
]

export function DemoHome() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const certificateStatus = useDemoVerificationStore((state) => state.certificateStatus)
  const startCertificateRequest = useDemoVerificationStore(
    (state) => state.startCertificateRequest,
  )
  const accountHome: AccountHomeResponse = {
    uiState: certificateStatus,
    account: null,
    hasNotification: false,
  }

  const services: ServiceItem[] = [
    {
      id: 'hospital-chat',
      icon: (
        <img
          src={hospitalReservationIcon}
          alt=""
          className="demo-home-service-icon demo-home-service-icon--mint h-9 w-9 object-contain"
        />
      ),
      label: t('main.hospitalReservation'),
    },
    {
      id: 'foreigner-card',
      icon: (
        <img
          src={registrationCardIcon}
          alt=""
          className="demo-home-service-icon demo-home-service-icon--purple h-9 w-9 object-contain"
        />
      ),
      label: t('main.residenceCard'),
    },
    {
      id: 'wallet',
      icon: (
        <img
          src={walletIcon}
          alt=""
          className="demo-home-service-icon demo-home-service-icon--light-blue h-9 w-9 rounded-lg object-cover"
        />
      ),
      label: t('main.wallet'),
    },
  ]

  const handleIssueCertificate = () => {
    startCertificateRequest()
    navigate('/demo/verification/document')
  }

  const showUnfinishedFeature = () => {
    novaToast.info(t('demoVerification.unfinishedFeature'))
  }

  return (
    <div className="h-full w-full bg-background">
      <MobileLayout
        title=""
        headerType="back"
        showBackButton={false}
        headerLeftContent={<DemoHeaderBrand />}
        headerRightContent={
          <MainHeaderActions
            hasUnreadNotifications={false}
            isLoggedIn
            isNotificationOpen={false}
            notifications={[]}
            isNotificationsLoading={false}
            notificationsError={false}
            onNotificationsClick={showUnfinishedFeature}
            onNotificationsClose={() => undefined}
            onNotificationClick={showUnfinishedFeature}
            onMenuClick={showUnfinishedFeature}
          />
        }
      >
        <div className="space-y-4 pt-1">
          <section className="demo-home-certificate-panel">
            <MainAccountPanel
              isLoggedIn
              accountHome={accountHome}
              isLoading={false}
              onLoginClick={showUnfinishedFeature}
              onOpenCertificateSheet={handleIssueCertificate}
              onOpenAccount={showUnfinishedFeature}
              onAccountPanelClick={showUnfinishedFeature}
              onTransferClick={showUnfinishedFeature}
            />
          </section>

          <section className="demo-home-job-panel">
            <MainJobBanner onClick={showUnfinishedFeature} />
          </section>

          <MainServiceGrid services={services} onServiceClick={showUnfinishedFeature} />
          <MainExchangeRateGrid exchangeRates={demoExchangeRates} />
        </div>
      </MobileLayout>

      <BottomNav
        homePath="/demo/verification"
        onItemClick={() => {
          showUnfinishedFeature()
          return false
        }}
      />
    </div>
  )
}
