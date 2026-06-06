import { useEffect, useState } from 'react'
import { BottomSheet } from '../../../components/layout/BottomSheet'
import { Btn_1Col } from '../../../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../../../components/design-system/CommonInputGroup'

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
  const [memo, setMemo] = useState(initialMemo)

  useEffect(() => {
    if (isOpen) {
      setMemo(initialMemo)
    }
  }, [initialMemo, isOpen])

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="메모"
      height="280px"
      bottomAction={
        <Btn_1Col
          onClick={() => {
            void Promise.resolve(onSave(memo)).catch(() => undefined)
          }}
          disabled={isSaving}
        >
          {isSaving ? '저장 중' : '저장'}
        </Btn_1Col>
      }
      bottomActionClassName="px-0"
    >
      <CommonInputGroup
        placeholder="메모 입력 (최대 20자)"
        value={memo}
        onChange={setMemo}
        maxLength={memoMaxLength}
        showCounter
      />
    </BottomSheet>
  )
}
