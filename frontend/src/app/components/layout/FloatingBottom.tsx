interface FloatingBottomProps {
  children: React.ReactNode;
}

export function FloatingBottom({ children }: FloatingBottomProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-background px-[20px] pt-[5px] pb-[20px]">
      {children}
    </div>
  );
}
