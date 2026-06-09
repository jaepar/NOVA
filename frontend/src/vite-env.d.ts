/// <reference types="vite/client" />

declare module "secure-keypad" {
  import type { ReactElement } from "react";

  export type KeypadPressEvent =
    | { type: "num"; value?: number }
    | { type: "del" | "clear" | "ok" };

  export interface KeypadProps {
    shuffleKey?: boolean;
    mixedKey?: boolean;
    pressCooldown?: number;
    onPress?: (event: KeypadPressEvent) => void;
    onOkClick?: () => void;
    onBackspaceClick?: () => void;
    onClearClick?: () => void;
  }

  export function Keypad(props: KeypadProps): ReactElement;
  export default Keypad;
}
