import { useLocation, useNavigate } from 'react-router-dom'
import { Failed } from '../common/Failed'
import { useTranslation } from '../../i18n'
import { useTransferStore } from './transferStore'

type TransferFailedLocationState = {
  message?: string
}

export function TransferFailed() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const resetTransfer = useTransferStore((state) => state.resetTransfer)
  const state = location.state as TransferFailedLocationState | null

  const goMain = () => {
    resetTransfer()
    navigate('/main')
  }

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
      onButtonClick={goMain}
      backPath="/transfer/review"
    />
  )
}
