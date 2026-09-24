import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  AlertCircleIcon,
  CheckIcon,
  CloseIcon,
} from "./Icons";

type ToastKind = "success" | "error";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  error: (message: string) => void;
  success: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(0);
  const timeoutIds = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextToastId.current;
      nextToastId.current += 1;
      setToasts((currentToasts) => [...currentToasts, { id, kind, message }]);

      const timeoutId = window.setTimeout(() => {
        dismiss(id);
        timeoutIds.current = timeoutIds.current.filter((item) => item !== timeoutId);
      }, 3_500);
      timeoutIds.current.push(timeoutId);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      error: (message) => showToast("error", message),
      success: (message) => showToast("success", message),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <div
            className="pointer-events-auto flex items-center justify-between gap-3 min-w-[280px] max-w-[420px] p-4 bg-[#e0e5ec] text-gray-800 border-0 rounded-2xl shadow-[8px_8px_16px_#b8bcc2,-8px_-8px_16px_#ffffff] text-xs transition-all duration-300 ease-in-out"
            key={toast.id}
            role="status"
          >
            <div className="flex items-center gap-3 min-w-0">
              {toast.kind === "success" ? (
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#e0e5ec] text-emerald-600 shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] shrink-0">
                  <CheckIcon size={14} />
                </span>
              ) : (
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#e0e5ec] text-red-600 shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] shrink-0">
                  <AlertCircleIcon size={14} />
                </span>
              )}
              <span className="font-medium text-gray-800 leading-snug break-words">
                {toast.message}
              </span>
            </div>
            <button
              aria-label="关闭通知"
              className="flex items-center justify-center w-7 h-7 bg-[#e0e5ec] text-gray-500 hover:text-gray-800 rounded-xl shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#b8bcc2,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 ease-in-out shrink-0 border-0"
              onClick={() => dismiss(toast.id)}
              title="关闭"
              type="button"
            >
              <CloseIcon size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast 必须在 ToastProvider 内使用");
  }

  return context;
}
