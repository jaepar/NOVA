export function MainJobBanner() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="bg-blue-600 p-6 h-40 flex flex-col justify-between relative">
        <div>
          <h3 className="text-white text-lg font-medium mb-2">구인구직 정보</h3>
          <p className="text-white/90 text-sm">글로벌 인재와 함께 더 나은 내일을 만들어보세요!</p>
        </div>
        <div className="absolute right-6 bottom-6 flex gap-2">
          <div className="w-12 h-12 rounded-full bg-white/20" />
          <div className="w-12 h-12 rounded-full bg-white/20" />
          <div className="w-12 h-12 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  )
}
