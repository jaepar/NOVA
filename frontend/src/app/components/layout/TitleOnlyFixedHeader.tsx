interface TitleOnlyFixedHeaderProps {
  title: string
  backgroundColor?: string
  textColor?: string
}

export function TitleOnlyFixedHeader({
  title,
  backgroundColor = '#ffffff',
  textColor = '#000000',
}: TitleOnlyFixedHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        paddingTop: 'var(--app-header-top-padding)',
        backgroundColor,
        color: textColor,
      }}
    >
      <div
        className="flex items-center justify-between px-5"
        style={{ height: 'var(--app-header-height)' }}
      >
        <div className="w-10" />
        <h1 className="flex-1 text-center text-[20px]" style={{ color: textColor }}>
          {title}
        </h1>
        <div className="w-10" />
      </div>
    </header>
  )
}
