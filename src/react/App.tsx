import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";

import {
  CloseIcon,
  MinusIcon,
  RestoreIcon,
  SquareIcon,
  VDesktopLogoIcon,
} from "./components/Icons";
import { ToastProvider } from "./components/ToastProvider";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

const pageTitles: Record<string, string> = {
  "/home": "虚拟机控制台",
  "/home/index": "虚拟机控制台",
  "/login": "连接凭据配置",
};

function getAppWindow() {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      return getCurrentWindow();
    } catch {
      return null;
    }
  }
  return null;
}

function AppShell() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? "连接凭据配置";
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    document.title = `${pageTitle} — VDesktop`;
  }, [pageTitle]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("zh-CN", { hour12: false }));
    };
    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const appWindow = getAppWindow();
    if (!appWindow) {
      return;
    }

    void appWindow.isMaximized().then(setIsMaximized).catch(() => {});
    const unlistenPromise = appWindow.onResized(() => {
      void appWindow.isMaximized().then(setIsMaximized).catch(() => {});
    });

    return () => {
      void unlistenPromise.then((unlisten) => unlisten()).catch(() => {});
    };
  }, []);

  const handleMinimize = () => {
    const appWindow = getAppWindow();
    if (appWindow) {
      void appWindow.minimize();
    }
  };

  const handleToggleMaximize = async () => {
    const appWindow = getAppWindow();
    if (appWindow) {
      await appWindow.toggleMaximize();
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    }
  };

  const handleClose = () => {
    const appWindow = getAppWindow();
    if (appWindow) {
      void appWindow.close();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* 现代沉浸式窗口顶栏：结合 Ant Design 严谨层级与 M3 表面模糊光影 */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between h-13 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200/90 select-none shadow-xs"
        data-tauri-drag-region=""
      >
        {/* 左侧：品牌 Logo 与工程接入标识 */}
        <div className="flex items-center gap-3" data-tauri-drag-region="">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 transition-transform active:scale-95"
            data-tauri-drag-region=""
          >
            <VDesktopLogoIcon size={18} />
          </div>

          <div className="flex items-center gap-2 text-xs" data-tauri-drag-region="">
            <span className="font-semibold tracking-tight text-slate-900" data-tauri-drag-region="">
              VDesktop
            </span>
            <span className="text-slate-300" data-tauri-drag-region="">/</span>
            <span className="text-slate-600 font-medium font-mono" data-tauri-drag-region="">
              Cluster Console
            </span>
          </div>

          {/* M3 药丸状态胶囊 */}
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 ml-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/70"
            data-tauri-drag-region=""
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>接入活跃</span>
          </div>
        </div>

        {/* 中间：可拖拽区域与视窗标题 Pill (M3 胶囊指示器) */}
        <div
          className="flex-1 flex items-center justify-center h-full px-4 cursor-default"
          data-tauri-drag-region=""
          onDoubleClick={() => void handleToggleMaximize()}
        >
          <div
            className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100/90 rounded-full border border-slate-200/70 hover:bg-slate-100 transition-colors"
            data-tauri-drag-region=""
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="tracking-wide">内网控制台</span>
            <span className="text-slate-300 font-normal">·</span>
            <span className="text-slate-700 font-medium">{pageTitle}</span>
          </div>
        </div>

        {/* 右侧：现代原生窗口操作控件组 */}
        <div className="flex items-center gap-2">
          {/* 最小化 */}
          <button
            aria-label="最小化窗口"
            className="flex items-center justify-center w-7 h-7 text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-md transition-colors"
            onClick={handleMinimize}
            title="最小化"
            type="button"
          >
            <MinusIcon size={12} />
          </button>

          {/* 最大化 / 还原 */}
          <button
            aria-label={isMaximized ? "还原窗口" : "最大化窗口"}
            className="flex items-center justify-center w-7 h-7 text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-md transition-colors"
            onClick={() => void handleToggleMaximize()}
            title={isMaximized ? "还原" : "最大化"}
            type="button"
          >
            {isMaximized ? <RestoreIcon size={12} /> : <SquareIcon size={11} />}
          </button>

          {/* 关闭 */}
          <button
            aria-label="关闭窗口"
            className="flex items-center justify-center w-7 h-7 text-slate-500 hover:text-white hover:bg-red-500 active:bg-red-600 rounded-md transition-colors"
            onClick={handleClose}
            title="关闭"
            type="button"
          >
            <CloseIcon size={12} />
          </button>
        </div>
      </header>

      {/* 主工作区 */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route element={<Navigate replace to="/login" />} path="/" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<HomePage />} path="/home" />
          <Route element={<HomePage />} path="/home/index" />
          <Route element={<Navigate replace to="/login" />} path="*" />
        </Routes>
      </main>

      {/* 现代沉浸式状态底栏 (Ant Design 企业级信息排版 + M3 微妙表面底色) */}
      <footer className="sticky bottom-0 z-20 flex items-center justify-between h-8 px-5 bg-white border-t border-slate-200/90 select-none text-[11px] text-slate-500 font-mono shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">内网集群网关已接通</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">v1.5.7 · SPICE/TLS</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-500">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px]">
            Ant Design × M3 System
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-600">{currentTime || "--:--:--"}</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-600 font-medium">集群状态: 运行就绪</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
