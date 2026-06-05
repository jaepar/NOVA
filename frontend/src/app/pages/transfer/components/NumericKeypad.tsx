import { AppButton } from '../../../components/design-system'

export function NumericKeypad({
  onPress,
  onBackspace,
  onClear,
  showClear = false,
}: {
  onPress: (value: string) => void
  onBackspace: () => void
  onClear?: () => void
  showClear?: boolean
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="grid grid-cols-3 gap-y-5 text-[#30343B]">
      {keys.map((key) => (
        <AppButton
          key={key}
          type="button"
          variant="unstyled"
          onClick={() => onPress(key)}
          className="h-10 text-[27px] font-medium leading-none"
        >
          {key}
        </AppButton>
      ))}
      <AppButton
        type="button"
        variant="unstyled"
        onClick={showClear ? onClear : () => onPress('00')}
        className="h-10 text-[18px] font-semibold leading-none"
      >
        {showClear ? '전체삭제' : '00'}
      </AppButton>
      <AppButton
        type="button"
        variant="unstyled"
        onClick={() => onPress('0')}
        className="h-10 text-[27px] font-medium leading-none"
      >
        0
      </AppButton>
      <AppButton
        type="button"
        variant="unstyled"
        onClick={onBackspace}
        className="h-10 text-[29px] font-medium leading-none"
      >
        ←
      </AppButton>
    </div>
  )
}
