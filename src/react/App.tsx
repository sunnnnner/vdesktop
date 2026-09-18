import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { VDesktopLogoIcon } from "./components/Icons";
import { ToastProvider } from "./components/ToastProvider";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

const pageTitles: Record<string, string> = {
  "/home": "虚拟机控制台",
  "/home/index": "虚拟机控制台",
  "/login": "连接凭据配置",
};

function AppShell() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? "连接凭据配置";

  useEffect(() => {
    document.title = `${pageTitle} — VDesktop`;
  }, [pageTitle]);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Linear / Stripe 风格应用顶栏 */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between h-12 px-5 bg-white border-b border-zinc-200/90 select-none shadow-xs"
        data-tauri-drag-region=""
      >
        {/* 左侧：品牌与工程环境 */}
        <div className="flex items-center gap-3" data-tauri-drag-region="">
          <div
            className="flex items-center justify-center w-7 h-7 bg-zinc-900 text-white rounded-md shadow-xs"
            data-tauri-drag-region=""
          >
            <VDesktopLogoIcon size={16} />
          </div>
          <div className="flex items-center gap-2 text-xs" data-tauri-drag-region="">
            <span className="font-semibold tracking-tight text-zinc-900" data-tauri-drag-region="">
              VDesktop
            </span>
            <span className="text-zinc-300" data-tauri-drag-region="">/</span>
            <span className="text-zinc-500 font-medium font-mono" data-tauri-drag-region="">
              Cluster Console
            </span>
          </div>

          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 ml-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full"
            data-tauri-drag-region=""
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>接入活跃</span>
          </div>
        </div>

        {/* 右侧：视图标识 */}
        <div className="flex items-center gap-3" data-tauri-drag-region="">
          <span
            className="px-2.5 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 border border-zinc-200/70 rounded-md font-mono"
            data-tauri-drag-region=""
          >
            {pageTitle}
          </span>
        </div>
      </header>

      {/* 主工作区 */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route element={<Navigate replace to="/login" />} path="/" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<HomePage />} path="/home" />
          <Route element={<HomePage />} path="/home/index" />
          <Route element={<Navigate replace to="/login" />} path="*" />
        </Routes>
      </main>
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
