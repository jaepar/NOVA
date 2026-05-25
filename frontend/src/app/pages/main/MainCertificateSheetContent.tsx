import { Btn_2Col } from '../../components/design-system/Btn_2Col'

interface MainCertificateSheetContentProps {
  onLaterClick: () => void
  onIssueClick: () => void
}

export function MainCertificateSheetContent({
  onLaterClick,
  onIssueClick,
}: MainCertificateSheetContentProps) {
  return (
    <div className="space-y-8 pb-2">
      <div className="space-y-4 text-center">
        <h3 className="text-xl font-semibold leading-snug">
          금융 서비스 이용을 위해
          <br />
          인증서 발급이 필요해요
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          안전한 금융 거래를 위해
          <br />
          신원 인증 후 인증서를 발급받아야
          <br />
          계좌 개설 및 금융 서비스를
          <br />
          이용하실 수 있어요.
        </p>
      </div>

      <Btn_2Col
        leftLabel="나중에 하기"
        rightLabel="인증서 발급하기"
        onLeftClick={onLaterClick}
        onRightClick={onIssueClick}
      />
    </div>
  )
}
