import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { stores } from "@/lib/store";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const nav = useNavigate();
  const [tab, setTab] = useState<"otp" | "password">("otp");
  const [store, setStore] = useState(stores[0].id);
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [left, setLeft] = useState(0);

  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);

  const send = () => {
    if (!/^0\d{9}$/.test(phone.replace(/\s/g, ""))) return toast.error("Số điện thoại không hợp lệ");
    setSent(true); setLeft(60); toast.success("Mã OTP demo: 123456");
  };
  const finish = () => { toast.success(mode === "login" ? "Đăng nhập thành công" : "Tạo tài khoản thành công"); nav({ to: "/" }); };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="panel w-full max-w-md p-7">
        <div className="mb-1 text-2xl font-bold">Fuy<span className="text-primary">o</span>ura</div>
        <h1 className="text-lg font-semibold">{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h1>
        <p className="mb-5 text-sm text-muted-foreground">{mode === "login" ? "Chào mừng trở lại" : "Chỉ cần số điện thoại để bắt đầu"}</p>

        <label className="mb-3 block space-y-1.5"><span className="label">Cửa hàng</span>
          <select className="field" value={store} onChange={(e) => setStore(e.target.value)}>
            {stores.map((s) => <option key={s.id} value={s.id} className="bg-card">{s.name}</option>)}
          </select></label>

        {mode === "login" && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-md bg-background/60 p-1">
            {(["otp", "password"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t === "otp" ? "SĐT + OTP" : "Email + mật khẩu"}</button>
            ))}
          </div>
        )}

        {mode === "register" && (
          <label className="mb-3 block space-y-1.5"><span className="label">Họ tên</span><input className="field" placeholder="Nguyễn Văn A" /></label>
        )}

        {mode === "login" && tab === "password" ? (
          <div className="space-y-3">
            <input className="field" placeholder="Email" />
            <input className="field" type="password" placeholder="Mật khẩu" />
            <button className="btn-primary w-full" onClick={finish}>Đăng nhập</button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block space-y-1.5"><span className="label">Số điện thoại</span>
              <div className="flex gap-2">
                <input className="field font-mono" placeholder="0912 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button className="btn-outline shrink-0" disabled={left > 0} onClick={send}>{left > 0 ? `${left}s` : sent ? "Gửi lại" : "Gửi mã"}</button>
              </div></label>
            {sent && (
              <label className="block space-y-1.5"><span className="label">Mã OTP (6 số)</span>
                <input className="field text-center font-mono text-xl tracking-[0.6em]" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="••••••" /></label>
            )}
            <button className="btn-primary w-full" disabled={!sent || otp.length !== 6}
              onClick={() => otp === "123456" ? finish() : toast.error("Mã OTP không đúng")}>
              {mode === "login" ? "Xác nhận đăng nhập" : "Tạo tài khoản"}
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? <>Chưa có tài khoản? <Link to="/register" className="font-medium text-primary">Đăng ký</Link></>
            : <>Đã có tài khoản? <Link to="/login" className="font-medium text-primary">Đăng nhập</Link></>}
        </p>
      </div>
    </div>
  );
}
