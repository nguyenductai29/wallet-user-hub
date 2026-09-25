import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Smartphone, Eraser, X, RotateCw, Zap, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { actions, services, stores, useApp, usd } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OTP — Nhận mã xác minh theo store" },
      { name: "description", content: "Lấy số điện thoại và nhận mã OTP cho từng cửa hàng." },
      { property: "og:title", content: "OTP — Nhận mã xác minh theo store" },
      { property: "og:description", content: "Lấy số điện thoại và nhận mã OTP cho từng cửa hàng." },
    ],
  }),
  component: OtpPage,
});

const copy = (t: string) => { navigator.clipboard?.writeText(t); toast.success(`Đã chép ${t}`); };

function OtpPage() {
  const { rows, storeId, balance, held } = useApp();
  const [serviceId, setServiceId] = useState(services[0].id);
  const [qty, setQty] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const svc = services.find((s) => s.id === serviceId)!;
  const list = showAll ? rows : rows.filter((r) => r.storeId === storeId);
  const storeName = (id: string) => stores.find((s) => s.id === id)?.name;

  const take = () => {
    if (svc.price * qty > balance - held) return toast.error("Số dư không đủ, vui lòng nạp tiền");
    actions.getNumbers(svc.name, svc.price, qty);
    toast.success(`Đã lấy ${qty} số — đang chờ mã`);
  };

  return (
    <AppShell title="OTP" subtitle="Nhận mã xác minh cho app & website">
      <div className="space-y-4">
        <section className="panel flex flex-wrap items-center gap-6 p-5">
          <Stat label="Số dư ví" value={usd(balance)} />
          <span className="text-muted-foreground">−</span>
          <Stat label="Đang giữ" value={usd(held)} accent />
          <span className="text-muted-foreground">=</span>
          <Stat label="Khả dụng" value={usd(balance - held)} accent />
          <Link to="/wallet" className="btn-primary btn-sm ml-auto">Nạp tiền</Link>
          <ul className="grid w-full gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <li>① Lấy số không mất phí, tiền được giữ tạm</li>
            <li>② Chỉ trừ tiền khi nhận được mã</li>
            <li>③ Không có mã trong 10 phút: huỷ & hoàn tiền</li>
          </ul>
        </section>

        <section className="panel space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <Field label="Store"><div className="field flex items-center">{storeName(storeId)}</div></Field>
            <Field label="Quốc gia"><div className="field flex items-center">+81/日本/japan(jpn)</div></Field>
            <Field label="Dịch vụ">
              <select className="field" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {services.map((s) => <option key={s.id} value={s.id} className="bg-card">{s.id} | {s.name} — {usd(s.price)}</option>)}
              </select>
            </Field>
            <Field label="Số lượng"><input type="number" min={1} max={50} className="field" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(50, +e.target.value || 1)))} /></Field>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-success" onClick={take}><Smartphone className="size-4" />Lấy số</button>
            <button className="btn-primary" onClick={actions.clearReceived}><Eraser className="size-4" />Xoá đã nhận mã</button>
            <button className="btn-danger" onClick={actions.clearAll}><X className="size-4" />Xoá danh sách</button>
            <button className="btn-outline" onClick={() => setShowAll(!showAll)}><RotateCw className="size-4" />{showAll ? "Chỉ store này" : "Hiện tất cả"}</button>
            <span className="ml-auto text-lg font-bold text-primary">{usd(svc.price * qty)}</span>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Zap className="size-3.5 text-primary" />Lấy số nhiều nên dùng kênh riêng, tỉ lệ nhận mã cao hơn.</p>
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b px-4 py-3 text-sm text-muted-foreground">Hiển thị {list.length} bản ghi</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  {["Thời gian", "Store", "Dịch vụ", "Số điện thoại", "Mã", "Nội dung SMS", "Trạng thái", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Chưa có số nào. Bấm "Lấy số" để bắt đầu.</td></tr>}
                {list.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3 font-mono text-xs">{r.time}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{storeName(r.storeId)}</td>
                    <td className="px-4 py-3">{r.service}</td>
                    <td className="px-4 py-3"><span className="font-mono font-bold">{r.phone}</span> <button className="btn-outline btn-sm ml-1 h-6" onClick={() => copy(r.phone)}><Copy className="size-3" /></button></td>
                    <td className="px-4 py-3">
                      {r.code ? <><span className="font-mono text-lg font-bold tracking-widest text-primary">{r.code}</span> <button className="btn-outline btn-sm ml-1 h-6" onClick={() => copy(r.code!)}><Copy className="size-3" /></button></>
                        : r.status === "waiting" ? <Loader2 className="size-4 animate-spin text-primary" /> : "—"}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs">{r.sms ?? ""}</td>
                    <td className="px-4 py-3"><Status s={r.status} /></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status === "waiting" && <button className="btn-outline btn-sm" onClick={() => actions.release(r.id)}>Huỷ</button>}
                      {r.status === "released" && <button className="btn-outline btn-sm text-link" onClick={() => actions.getNumbers(r.service, r.price, 1)}>Lấy lại số này</button>}
                      {r.status === "received" && <span className="text-xs text-muted-foreground">{usd(r.price)}</span>}
                      <button className="ml-2 text-muted-foreground hover:text-foreground" onClick={() => actions.remove(r.id)} aria-label="Xoá"><X className="inline size-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div><div className="label">{label}</div><div className={`text-xl font-bold ${accent ? "text-primary" : ""}`}>{value}</div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="label">{label}</span>{children}</label>;
}
function Status({ s }: { s: string }) {
  const m: Record<string, [string, string]> = {
    waiting: ["Đang chờ mã", "text-primary"], received: ["Đã nhận", "text-success"],
    released: ["Đã giải phóng", "text-muted-foreground"], failed: ["Thất bại", "text-destructive"],
  };
  return <span className={`text-sm font-medium ${m[s][1]}`}>{m[s][0]}</span>;
}
