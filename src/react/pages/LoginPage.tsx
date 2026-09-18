import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  KeyIcon,
  LockIcon,
  RefreshIcon,
  UserIcon,
  VDesktopLogoIcon,
} from "../components/Icons";
import { useToast } from "../components/ToastProvider";
import {
  getErrorMessage,
  isConfigPresent,
  saveConnectionConfig,
  SERVER_OPTIONS,
  type ConnectionConfig,
} from "../lib/tauri";

type EditableField = "appid" | "appsecret" | "name";
type FieldErrors = Partial<Record<EditableField | "server", string>>;

const defaultServer = SERVER_OPTIONS[0];

function createInitialConfig(): ConnectionConfig {
  return {
    appid: "",
    appsecret: "",
    name: "",
    server: defaultServer.value,
    url: defaultServer.url,
  };
}

function validateConfig(config: ConnectionConfig): FieldErrors {
  const errors: FieldErrors = {};

  if (!config.appid.trim()) {
    errors.appid = "请输入 APPID";
  }
  if (!config.appsecret.trim()) {
    errors.appsecret = "请输入 SECRET";
  }
  if (!config.name.trim()) {
    errors.name = "请输入姓名";
  }
  if (!SERVER_OPTIONS.some((server) => server.value === config.server)) {
    errors.server = "请选择有效区域";
  }

  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { error, success } = useToast();
  const [config, setConfig] = useState<ConnectionConfig>(createInitialConfig);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    void isConfigPresent()
      .then((configExists) => {
        if (active && configExists) {
          navigate("/home/index", { replace: true });
        }
      })
      .catch((configError) => {
        if (active) {
          error(getErrorMessage(configError));
        }
      });

    return () => {
      active = false;
    };
  }, [error, navigate]);

  const updateField = (field: EditableField, value: string) => {
    setConfig((currentConfig) => ({ ...currentConfig, [field]: value }));
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const selectServer = (serverValue: string) => {
    const selectedServer = SERVER_OPTIONS.find((server) => server.value === serverValue);
    if (!selectedServer) {
      return;
    }

    setConfig((currentConfig) => ({
      ...currentConfig,
      server: selectedServer.value,
      url: selectedServer.url,
    }));
    setFieldErrors((currentErrors) => ({ ...currentErrors, server: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateConfig(config);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await saveConnectionConfig(config);
      success("连接凭据配置成功，正在接入控制台");
      navigate("/home/index", { replace: true });
    } catch (saveError) {
      error(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] py-6">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-[440px] bg-white border border-zinc-200/90 rounded-2xl p-7 sm:p-9 shadow-xs"
      >
        {/* 卡片头部 */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-11 h-11 bg-zinc-900 text-white rounded-xl shadow-xs mb-3.5">
            <VDesktopLogoIcon size={22} />
          </div>
          <h1 id="login-title" className="text-lg font-semibold tracking-tight text-zinc-900">
            连接凭据配置
          </h1>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            配置访问凭证与区域接入点，以安全接入内网计算集群
          </p>
        </div>

        {/* 配置表单 */}
        <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          {/* APPID */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5" htmlFor="appid">
              APPID
            </label>
            <div
              className={`relative flex items-center bg-zinc-50/60 border rounded-lg transition-colors ${
                fieldErrors.appid
                  ? "border-red-500 bg-red-50/20"
                  : "border-zinc-200/90 focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900"
              }`}
            >
              <span className="flex items-center justify-center w-9 text-zinc-400">
                <KeyIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.appid ? "appid-error" : undefined}
                aria-invalid={Boolean(fieldErrors.appid)}
                autoComplete="username"
                className="w-full h-9 pr-3 text-xs bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-400 font-mono"
                id="appid"
                onChange={(event) => updateField("appid", event.currentTarget.value)}
                placeholder="例如: admin"
                type="text"
                value={config.appid}
              />
            </div>
            {fieldErrors.appid && (
              <p className="flex items-center gap-1 mt-1 text-[11px] text-red-600 font-medium" id="appid-error" role="alert">
                <AlertCircleIcon size={12} />
                {fieldErrors.appid}
              </p>
            )}
          </div>

          {/* SECRET */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5" htmlFor="appsecret">
              SECRET
            </label>
            <div
              className={`relative flex items-center bg-zinc-50/60 border rounded-lg transition-colors ${
                fieldErrors.appsecret
                  ? "border-red-500 bg-red-50/20"
                  : "border-zinc-200/90 focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900"
              }`}
            >
              <span className="flex items-center justify-center w-9 text-zinc-400">
                <LockIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.appsecret ? "appsecret-error" : undefined}
                aria-invalid={Boolean(fieldErrors.appsecret)}
                autoComplete="current-password"
                className="w-full h-9 text-xs bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-400 font-mono"
                id="appsecret"
                onChange={(event) => updateField("appsecret", event.currentTarget.value)}
                placeholder="请输入访问密钥"
                type={passwordVisible ? "text" : "password"}
                value={config.appsecret}
              />
              <button
                aria-label={passwordVisible ? "隐藏密码" : "显示密码"}
                className="flex items-center justify-center h-full px-2.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                onClick={() => setPasswordVisible((visible) => !visible)}
                type="button"
              >
                {passwordVisible ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
              </button>
            </div>
            {fieldErrors.appsecret && (
              <p className="flex items-center gap-1 mt-1 text-[11px] text-red-600 font-medium" id="appsecret-error" role="alert">
                <AlertCircleIcon size={12} />
                {fieldErrors.appsecret}
              </p>
            )}
          </div>

          {/* 姓名 */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5" htmlFor="name">
              用户标识 / 姓名
            </label>
            <div
              className={`relative flex items-center bg-zinc-50/60 border rounded-lg transition-colors ${
                fieldErrors.name
                  ? "border-red-500 bg-red-50/20"
                  : "border-zinc-200/90 focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900"
              }`}
            >
              <span className="flex items-center justify-center w-9 text-zinc-400">
                <UserIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                aria-invalid={Boolean(fieldErrors.name)}
                autoComplete="name"
                className="w-full h-9 pr-3 text-xs bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-400"
                id="name"
                onChange={(event) => updateField("name", event.currentTarget.value)}
                placeholder="例如: zhangsan"
                type="text"
                value={config.name}
              />
            </div>
            {fieldErrors.name && (
              <p className="flex items-center gap-1 mt-1 text-[11px] text-red-600 font-medium" id="name-error" role="alert">
                <AlertCircleIcon size={12} />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* 目标节点区域 (Linear Segmented Control) */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              接入集群区域
            </label>
            <div className="flex p-1 bg-zinc-100/80 border border-zinc-200/70 rounded-lg gap-1" role="radiogroup">
              {SERVER_OPTIONS.map((server) => {
                const isSelected = config.server === server.value;
                return (
                  <button
                    aria-checked={isSelected}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-medium rounded-md transition-all ${
                      isSelected
                        ? "bg-white text-zinc-900 font-semibold shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                    key={server.value}
                    onClick={() => selectServer(server.value)}
                    role="radio"
                    type="button"
                  >
                    <GlobeIcon size={13} className={isSelected ? "text-zinc-900" : "text-zinc-400"} />
                    <span>{server.label}节点</span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.server && (
              <p className="flex items-center gap-1 mt-1 text-[11px] text-red-600 font-medium" role="alert">
                <AlertCircleIcon size={12} />
                {fieldErrors.server}
              </p>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="pt-2">
            <button
              className="w-full flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? (
                <>
                  <RefreshIcon className="animate-spin-fast" size={14} />
                  <span>正在保存凭据...</span>
                </>
              ) : (
                <span>保存并连接</span>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
