/**
 * Thin wrapper around react-toastify so hooks don't need to import
 * directly from the library. Swap out the underlying library here if needed.
 */
import { toast as _toast } from "react-toastify";

export const toast = {
  success: (msg: string) => _toast.success(msg),
  error: (msg: string) => _toast.error(msg),
  info: (msg: string) => _toast.info(msg),
};

/** Extract a human-readable message from an API error response. */
export function apiErrorMsg(err: unknown, fallback = "Something went wrong"): string {
  return (
    (err as { response?: { data?: { message?: string | string[] } } })
      ?.response?.data?.message as string | undefined
  ) ?? fallback;
}
