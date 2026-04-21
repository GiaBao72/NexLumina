"use client";
import { useEffect, useState } from "react";
import { Save, Settings, Mail, Globe, AlertTriangle, Eye, EyeOff, CheckCircle } from "lucide-react";

type SettingsData = {
  siteName: string; siteDescription: string; supportEmail: string;
  smtpHost: string; smtpPort: string; smtpUser: string;
  maintenanceMode: string;
};

const defaultSettings: SettingsData = {
  siteName: "NexLumina", siteDescription: "", supportEmail: "",
  smtpHost: "smtp.gmail.com", smtpPort: "587", smtpUser: "",
  maintenanceMode: "false",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsData>(defaultSettings);
  const [smtpPass, setSmtpPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "email" | "advanced">("general");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setForm({ ...defaultSettings, ...d }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const body: Record<string, string> = { ...form };
      if (smtpPass) body.smtpPass = smtpPass;
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Có lỗi xảy ra"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Không thể kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  }

  const field = (key: keyof SettingsData, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
    </div>
  );

  const tabs = [
    { key: "general" as const, label: "Tổng quan", icon: Globe },
    { key: "email" as const, label: "Email / SMTP", icon: Mail },
    { key: "advanced" as const, label: "Nâng cao", icon: Settings },
  ];

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-sm text-gray-500 mt-0.5">Cấu hình hệ thống NexLumina</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />Đã lưu cài đặt thành công!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* General */}
        {activeTab === "general" && (
          <>
            <h2 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-3">Thông tin website</h2>
            {field("siteName", "Tên website", "text", "NexLumina")}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả website</label>
              <textarea value={form.siteDescription} onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
                placeholder="Nền tảng học trực tuyến hàng đầu Việt Nam" rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
            {field("supportEmail", "Email hỗ trợ", "email", "support@nexlumina.com")}
          </>
        )}

        {/* Email / SMTP */}
        {activeTab === "email" && (
          <>
            <h2 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-3">Cấu hình SMTP gửi email</h2>
            <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-xs text-teal-700">
              💡 Gmail: dùng <strong>App Password</strong> 16 ký tự tại <span className="font-mono">myaccount.google.com → Bảo mật → Mật khẩu ứng dụng</span>. Bật 2FA trước.
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">{field("smtpHost", "SMTP Host", "text", "smtp.gmail.com")}</div>
              <div>{field("smtpPort", "Port", "text", "587")}</div>
            </div>
            {field("smtpUser", "SMTP Username (email gửi)", "email", "your@gmail.com")}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">SMTP Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="Để trống để giữ nguyên mật khẩu cũ"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Mật khẩu được lưu mã hóa, không hiển thị lại sau khi lưu.</p>
            </div>
          </>
        )}

        {/* Advanced */}
        {activeTab === "advanced" && (
          <>
            <h2 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-3">Cài đặt nâng cao</h2>
            <div className="flex items-start gap-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800 mb-0.5">Chế độ bảo trì</p>
                <p className="text-xs text-yellow-700 mb-3">Khi bật, người dùng thường sẽ thấy trang thông báo bảo trì. Admin vẫn truy cập bình thường.</p>
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => setForm({ ...form, maintenanceMode: form.maintenanceMode === "true" ? "false" : "true" })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.maintenanceMode === "true" ? "bg-yellow-500" : "bg-gray-200"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.maintenanceMode === "true" ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className={`text-sm font-medium ${form.maintenanceMode === "true" ? "text-yellow-700" : "text-gray-500"}`}>
                    {form.maintenanceMode === "true" ? "Đang bật" : "Đang tắt"}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="pt-2 border-t border-gray-100">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60">
            {saving
              ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang lưu...</>
              : <><Save className="h-4 w-4" />Lưu cài đặt</>}
          </button>
        </div>
      </form>
    </div>
  );
}
