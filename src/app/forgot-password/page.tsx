"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, Mail, KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1|2|3>(1);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=>{
    if(countdown<=0) return;
    const t = setTimeout(()=>setCountdown(c=>c-1), 1000);
    return ()=>clearTimeout(t);
  },[countdown]);

  const handleSend = async(e: React.FormEvent)=>{
    e.preventDefault();
    if(!email.includes("@")){ setError("Email không hợp lệ"); return; }
    setError(""); setLoading(true);
    await new Promise(r=>setTimeout(r,1200));
    setLoading(false); setStep(2); setCountdown(60);
  };

  const handleReset = async(e: React.FormEvent)=>{
    e.preventDefault();
    if(newPw.length<8){ setError("Mật khẩu tối thiểu 8 ký tự"); return; }
    if(newPw!==confirmPw){ setError("Mật khẩu không khớp"); return; }
    setError(""); setLoading(true);
    await new Promise(r=>setTimeout(r,1200));
    setLoading(false); setStep(3);
    setTimeout(()=>router.push("/login"),2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 via-teal-700 to-gray-900 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><BookOpen className="h-5 w-5 text-white"/></div>
        Nex<span className="text-teal-200">Lumina</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {step===3 ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <CheckCircle className="h-8 w-8 text-teal-600"/>
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-2">Đặt lại thành công!</h2>
            <p className="text-sm text-gray-500">Đang chuyển về trang đăng nhập...</p>
          </div>
        ) : step===1 ? (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50"><Mail className="h-7 w-7 text-teal-600"/></div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Quên mật khẩu?</h1>
              <p className="text-sm text-gray-500 mt-1">Nhập email để nhận link đặt lại mật khẩu</p>
            </div>
            {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com" required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {loading?<><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"/>Đang gửi...</>:"Gửi link đặt lại mật khẩu"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50"><KeyRound className="h-7 w-7 text-teal-600"/></div>
              <h1 className="font-heading text-2xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
              <p className="text-sm text-gray-500 mt-1">Đã gửi link đến <strong>{email}</strong></p>
              {countdown>0
                ? <p className="text-xs text-gray-400 mt-2">Gửi lại sau {countdown}s</p>
                : <button onClick={()=>{setStep(1);setCountdown(0)}} className="text-xs text-teal-600 hover:underline mt-2">Gửi lại email</button>
              }
            </div>
            {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleReset} className="space-y-4">
              {[["Mật khẩu mới",newPw,(v:string)=>setNewPw(v)],["Xác nhận mật khẩu",confirmPw,(v:string)=>setConfirmPw(v)]].map(([label,val,set],i)=>(
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label as string}</label>
                  <div className="relative">
                    <input type={showPw?"text":"password"} value={val as string} onChange={e=>(set as Function)(e.target.value)} required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                    <button type="button" onClick={()=>setShowPw(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {loading?<><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"/>Đang xử lý...</>:"Đặt lại mật khẩu"}
              </button>
            </form>
          </>
        )}
        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5"/>Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
