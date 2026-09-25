import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { actions, useApp, usd } from "@/lib/store";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Ví — Nạp tiền & lịch sử giao dịch" },
      { name: "description", content: "Xem số dư ví, nạp tiền và theo dõi giao dịch." },
      { property: "og:title", content: "Ví — Nạp tiền & lịch sử giao dịch" },
      { property: "og:description", content: "Xem số dư ví, nạp tiền và theo dõi giao dịch." },
    ],
  }),
  component: WalletPage,
});

const presets = [5, 10, 20, 50, 100];
const methods = ["USDT", "Thẻ ngân hàng", "MoMo"];

function WalletPage() {
  const { balance, held, txns } = useApp();
  const [amount, setAmount] = useState(10);
  const [method, setMethod] = useState(methods[0]);

  return (
    <AppShell title="Ví" subtitle="Số dư và nạp tiền vào tài khoản">
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <section className="panel p-6">
            <div className="label">Số dư khả dụng</div>
            <div className="mt-1 text-5xl font-bold text-primary">{usd(balance - held)}</div>
            <div className="mt-2 text-sm text-muted-foreground">Tổng {usd(balance)} · Đang giữ {usd(held)}</div>
          </section>
          <section className="panel overflow-hidden">
            <div className="border-b px-5 py-3 font-semibold">Lịch sử giao dịch</div>
            {txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b px-5 py-3 last:border-0">
                <div><div className="text-sm font-medium">{t.label}</div><div className="font-mono text-xs text-muted-foreground">{t.time}</div></div>
                <span className={`font-mono font-semibold ${t.amount > 0 ? "text-success" : "text-muted-foreground"}`}>{t.amount > 0 ? "+" : "−"}{usd(Math.abs(t.amount))}</span>
              </div>
            ))}
          </section>
        </div>

        <section className="panel h-fit space-y-4 p-5">
          <h2 className="font-semibold">Nạp tiền</h2>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((p) => (
              <button key={p} onClick={() => setAmount(p)} className={`btn btn-sm ${amount === p ? "bg-primary text-primary-foreground" : "border border-input"}`}>${p}</button>
            ))}
          </div>
          <label className="block space-y-1.5"><span className="label">Số tiền (USD)</span>
            <input type="number" min={1} className="field" value={amount} onChange={(e) => setAmount(+e.target.value)} /></label>
          <div className="space-y-1.5"><span className="label">Phương thức</span>
            <div className="grid gap-2">
              {methods.map((m) => (
                <button key={m} onClick={() => setMethod(m)} className={`btn justify-start border ${method === m ? "border-primary text-primary" : "border-input"}`}>{m}</button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" disabled={!(amount > 0)}
            onClick={() => { actions.topUp(amount, method); toast.success(`Đã nạp ${usd(amount)} qua ${method}`); }}>
            Nạp {usd(amount || 0)}
          </button>
          <p className="text-xs text-muted-foreground">Đây là bản dựng giao diện — chưa kết nối cổng thanh toán thật.</p>
        </section>
      </div>
    </AppShell>
  );
}
