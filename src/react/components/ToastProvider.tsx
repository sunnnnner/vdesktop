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
      }, 4_000);
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
      <div className="toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div className={`toast toast--${toast.kind}`} key={toast.id} role="status">
            <span>{toast.message}</span>
            <button
              aria-label="关闭提示"
              className="toast-dismiss"
              onClick={() => dismiss(toast.id)}
              title="关闭"
              type="button"
            >
              x
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
