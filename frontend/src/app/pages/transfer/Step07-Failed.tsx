import { useLocation } from 'react-router-dom'
import { Failed } from '../common/Failed'
import { useTranslation } from '../../i18n'

type TransferFailedLocationState = {
  message?: string
}

export function TransferFailed() {
  const location = useLocation()
  const { t } = useTranslation()
  const state = location.state as TransferFailedLocationState | null

  return (
    <Failed
      headerTitle={t('transfer.title')}
      headerTitleKey="transfer.title"
      task={t('transfer.failedTask')}
      taskKey="transfer.failedTask"
      description={state?.message || t('transfer.failedDescription')}
      descriptionKey={state?.message ? undefined : 'transfer.failedDescription'}
      buttonText={t('common.confirm')}
      buttonTextKey="common.confirm"
      redirectPath="/main"
      backPath="/transfer/review"
    />
  )
}
