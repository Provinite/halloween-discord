import { AxiosError } from "axios";

export function isAxiosError(e: any): e is AxiosError {
  return Boolean(e.isAxiosError);
}
