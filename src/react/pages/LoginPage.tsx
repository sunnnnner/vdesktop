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
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] py-8">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-[440px] bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#b8bcc2,-8px_-8px_16px_#ffffff] md:shadow-[12px_12px_24px_#b8bcc2,-12px_-12px_24px_#ffffff] p-6 md:p-8 border-0"
      >
        {/* 卡片头部 */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-[#e0e5ec] text-[#6d5dfc] rounded-2xl shadow-[6px_6px_12px_#b8bcc2,-6px_-6px_12px_#ffffff] mb-3.5 border-0">
            <VDesktopLogoIcon size={24} />
          </div>
          <h1 id="login-title" className="font-semibold text-gray-800 text-xl md:text-2xl">
            连接凭据配置
          </h1>
          <p className="mt-1.5 text-xs text-gray-600 leading-relaxed max-w-xs">
            配置访问凭证与区域接入点，以安全接入内网计算集群
          </p>
        </div>

        {/* 配置表单 */}
        <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
          {/* APPID */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2" htmlFor="appid">
              APPID
            </label>
            <div
              className={`relative flex items-center bg-[#e0e5ec] rounded-xl border-0 transition-all duration-300 ease-in-out ${
                fieldErrors.appid
                  ? "shadow-[inset_4px_4px_8px_#d99b9b,inset_-4px_-4px_8px_#ffffff]"
                  : "shadow-[inset_4px_4px_8px_#b8bcc2,inset_-4px_-4px_8px_#ffffff] focus-within:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff]"
              }`}
            >
              <span className="flex items-center justify-center w-10 text-gray-500">
                <KeyIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.appid ? "appid-error" : undefined}
                aria-invalid={Boolean(fieldErrors.appid)}
                autoComplete="username"
                className="w-full h-10 pr-3 text-xs bg-transparent border-0 outline-none text-gray-800 placeholder:text-gray-400 font-mono"
                id="appid"
                onChange={(event) => updateField("appid", event.currentTarget.value)}
                placeholder="例如: admin"
                type="text"
                value={config.appid}
              />
            </div>
            {fieldErrors.appid && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-red-600 font-medium" id="appid-error" role="alert">
                <AlertCircleIcon size={13} />
                {fieldErrors.appid}
              </p>
            )}
          </div>

          {/* SECRET */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2" htmlFor="appsecret">
              SECRET
            </label>
            <div
              className={`relative flex items-center bg-[#e0e5ec] rounded-xl border-0 transition-all duration-300 ease-in-out ${
                fieldErrors.appsecret
                  ? "shadow-[inset_4px_4px_8px_#d99b9b,inset_-4px_-4px_8px_#ffffff]"
                  : "shadow-[inset_4px_4px_8px_#b8bcc2,inset_-4px_-4px_8px_#ffffff] focus-within:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff]"
              }`}
            >
              <span className="flex items-center justify-center w-10 text-gray-500">
                <LockIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.appsecret ? "appsecret-error" : undefined}
                aria-invalid={Boolean(fieldErrors.appsecret)}
                autoComplete="current-password"
                className="w-full h-10 text-xs bg-transparent border-0 outline-none text-gray-800 placeholder:text-gray-400 font-mono"
                id="appsecret"
                onChange={(event) => updateField("appsecret", event.currentTarget.value)}
                placeholder="请输入访问密钥"
                type={passwordVisible ? "text" : "password"}
                value={config.appsecret}
              />
              <button
                aria-label={passwordVisible ? "隐藏密码" : "显示密码"}
                className="flex items-center justify-center h-full px-3 text-gray-500 hover:text-gray-800 transition-colors"
                onClick={() => setPasswordVisible((visible) => !visible)}
                type="button"
              >
                {passwordVisible ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
              </button>
            </div>
            {fieldErrors.appsecret && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-red-600 font-medium" id="appsecret-error" role="alert">
                <AlertCircleIcon size={13} />
                {fieldErrors.appsecret}
              </p>
            )}
          </div>

          {/* 姓名 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2" htmlFor="name">
              用户标识 / 姓名
            </label>
            <div
              className={`relative flex items-center bg-[#e0e5ec] rounded-xl border-0 transition-all duration-300 ease-in-out ${
                fieldErrors.name
                  ? "shadow-[inset_4px_4px_8px_#d99b9b,inset_-4px_-4px_8px_#ffffff]"
                  : "shadow-[inset_4px_4px_8px_#b8bcc2,inset_-4px_-4px_8px_#ffffff] focus-within:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff]"
              }`}
            >
              <span className="flex items-center justify-center w-10 text-gray-500">
                <UserIcon size={15} />
              </span>
              <input
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                aria-invalid={Boolean(fieldErrors.name)}
                autoComplete="name"
                className="w-full h-10 pr-3 text-xs bg-transparent border-0 outline-none text-gray-800 placeholder:text-gray-400"
                id="name"
                onChange={(event) => updateField("name", event.currentTarget.value)}
                placeholder="例如: zhangsan"
                type="text"
                value={config.name}
              />
            </div>
            {fieldErrors.name && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-red-600 font-medium" id="name-error" role="alert">
                <AlertCircleIcon size={13} />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* 目标节点区域 (Neumorphic Segmented Control) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              接入集群区域
            </label>
            <div
              className="flex p-1.5 bg-[#e0e5ec] rounded-xl shadow-[inset_4px_4px_8px_#b8bcc2,inset_-4px_-4px_8px_#ffffff] gap-2 border-0"
              role="radiogroup"
            >
              {SERVER_OPTIONS.map((server) => {
                const isSelected = config.server === server.value;
                return (
                  <button
                    aria-checked={isSelected}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-medium rounded-xl transition-all duration-300 ease-in-out border-0 ${
                      isSelected
                        ? "bg-[#e0e5ec] text-[#6d5dfc] font-semibold shadow-[4px_4px_8px_#b8bcc2,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#b8bcc2,inset_-4px_-4px_8px_#ffffff]"
                        : "text-gray-600 hover:text-gray-800 hover:shadow-[2px_2px_4px_#b8bcc2,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff]"
                    }`}
                    key={server.value}
                    onClick={() => selectServer(server.value)}
                    role="radio"
                    type="button"
                  >
                    <GlobeIcon size={13} className={isSelected ? "text-[#6d5dfc]" : "text-gray-400"} />
                    <span>{server.label}节点</span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.server && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-red-600 font-medium" role="alert">
                <AlertCircleIcon size={13} />
                {fieldErrors.server}
              </p>
            )}
          </div>

          {/* 提交按钮 (Neumorphism 主按钮) */}
          <div className="pt-3">
            <button
              className="w-full flex items-center justify-center gap-2 h-11 px-4 text-xs font-medium bg-[#6d5dfc] text-white rounded-xl shadow-[6px_6px_12px_#b8bcc2,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#b8bcc2,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#b8bcc2,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 ease-in-out border-0 disabled:opacity-50"
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
