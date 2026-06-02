import { Toaster } from "sonner";

export function NovaToast() {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        duration: 2500,
        style: {
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          lineHeight: "1.4",
        },
      }}
    />
  );
}
