import { useEffect, useState } from 'react'
import { BottomSheet } from '../../../components/layout/BottomSheet'
import { Btn_1Col } from '../../../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../../../components/design-system/CommonInputGroup'

interface TransactionMemoSheetProps {
  isOpen: boolean
  initialMemo: string
  onClose: () => void
  onSave: (memo: string) => void
}

const memoMaxLength = 20

export function TransactionMemoSheet({
  isOpen,
  initialMemo,
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
      bottomAction={<Btn_1Col onClick={() => onSave(memo)}>저장</Btn_1Col>}
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
