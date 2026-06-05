import { isAxiosError } from "axios";

type ErrorBodyShape = {
  code: string;
  message: string;
};

function isErrorBodyShape(value: unknown): value is ErrorBodyShape {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ErrorBodyShape>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
  );
}

export function extractApiErrorBody<T extends ErrorBodyShape>(
  error: unknown
): T | null {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    return isErrorBodyShape(data) ? (data as T) : null;
  }

  return isErrorBodyShape(error) ? (error as T) : null;
}
