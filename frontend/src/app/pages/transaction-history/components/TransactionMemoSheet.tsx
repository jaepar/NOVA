import { useEffect, useState } from 'react'
import { BottomSheet } from '../../../components/layout/BottomSheet'
import { Btn_1Col } from '../../../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../../../components/design-system/CommonInputGroup'
import { useTranslation } from '../../../i18n'

interface TransactionMemoSheetProps {
  isOpen: boolean
  initialMemo: string
  isSaving?: boolean
  onClose: () => void
  onSave: (memo: string) => Promise<void> | void
}

const memoMaxLength = 20

export function TransactionMemoSheet({
  isOpen,
  initialMemo,
  isSaving = false,
  onClose,
  onSave,
}: TransactionMemoSheetProps) {
  const { t } = useTranslation()
  const [memo, setMemo] = useState(initialMemo)

  useEffect(() => {
    if (isOpen) {
      setMemo(initialMemo)
    }
  }, [initialMemo, isOpen])

  const memoPlaceholder = t('transactionHistory.memoMaxLengthPlaceholder').replace(
    '{max}',
    String(memoMaxLength)
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('transactionHistory.memoLabel')}
      height="280px"
      bottomAction={
        <Btn_1Col
          onClick={() => {
            void Promise.resolve(onSave(memo)).catch(() => undefined)
          }}
          disabled={isSaving}
        >
          {isSaving ? t('transactionHistory.memoSaving') : t('transactionHistory.memoSave')}
        </Btn_1Col>
      }
      bottomActionClassName="px-0"
    >
      <CommonInputGroup
        placeholder={memoPlaceholder}
        value={memo}
        onChange={setMemo}
        maxLength={memoMaxLength}
        showCounter
      />
    </BottomSheet>
  )
}
