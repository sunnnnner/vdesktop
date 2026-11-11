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
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <div
            className="pointer-events-auto flex items-center justify-between gap-3 min-w-[280px] max-w-[420px] px-4 py-3 bg-white text-slate-800 border border-slate-200/90 rounded-xl shadow-md text-xs transition-all animate-in fade-in slide-in-from-top-2 duration-200"
            key={toast.id}
            role="status"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.kind === "success" ? (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                  <CheckIcon size={13} />
                </span>
              ) : (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-600 border border-red-100 shrink-0">
                  <AlertCircleIcon size={13} />
                </span>
              )}
              <span className="font-medium text-slate-800 leading-snug break-words">
                {toast.message}
              </span>
            </div>
            <button
              aria-label="关闭通知"
              className="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors shrink-0"
              onClick={() => dismiss(toast.id)}
              title="关闭"
              type="button"
            >
              <CloseIcon size={12} />
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
