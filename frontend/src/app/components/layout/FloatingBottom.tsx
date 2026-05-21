interface FloatingBottomProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export function FloatingBottom({
  children,
  backgroundColor = '#ffffff',
}: FloatingBottomProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 w-full px-[20px] pt-[5px] pb-[20px]"
      style={{ backgroundColor }}
    >
      {children}
    </div>
  );
}
