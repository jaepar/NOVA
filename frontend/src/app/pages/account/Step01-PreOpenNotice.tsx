import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { Btn_1Col } from "../../components/design-system/Btn_1Col";

const noticeCards = [
  {
    id: 1,
    title: "신분증이 필요해요",
    description: "여권 등 본인 확인이 가능한 신분증을 준비해 주세요.",
  },
  {
    id: 2,
    title: "약 한 달 안에 개설했다면 가입할 수 없어요",
    description: "최근 30일 이내 계좌 개설 이력이 있으면 신규 개설이 제한돼요.",
  },
  {
    id: 3,
    title: "입출금계좌 개설 시 1일 이체한도 30만원으로 제한돼요",
    description: "보안 정책에 따라 초기 이체한도가 제한됩니다.",
  },
];

export function Step01PreOpenNotice() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="입출금계좌 개설"
      backPath="/main"
      bottomContent={
        <Btn_1Col onClick={() => navigate("/account/step-02")}>다음</Btn_1Col>
      }
    >
      <section className="pt-2">
        <h2 className="text-2xl leading-tight font-semibold text-foreground">
          계좌 개설 전에
          <br />
          미리 확인해 주세요
        </h2>
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          아래 내용을 확인하신 후 진행해 주세요.
        </p>
      </section>

      <section className="mt-7 space-y-4 pb-2">
        {noticeCards.map((card) => (
          <article
            key={card.id}
            className="flex items-start gap-4 rounded-3xl bg-secondary px-4 py-4"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-background border border-border">
              <div className="h-12 w-12 rounded-xl border border-dashed border-border" />
            </div>
            <div className="pt-1">
              <h3 className="text-base leading-6 font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {card.description}
              </p>
            </div>
          </article>
        ))}
      </section>
    </MobileLayout>
  );
}
