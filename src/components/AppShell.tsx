import { Link, useRouterState } from "@tanstack/react-router";
import { Flame, Wallet, Users, LogOut, Store as StoreIcon, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { actions, stores, useApp, usd } from "@/lib/store";

const nav = [
  { to: "/", label: "OTP", icon: Flame },
  { to: "/wallet", label: "Ví", icon: Wallet },
  { to: "/users", label: "Quản lý user", icon: Users },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { storeId, balance, held } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className={`${open ? "flex" : "hidden"} fixed inset-y-0 left-0 z-30 w-60 flex-col bg-sidebar p-4 md:static md:flex`}>
        <div className="mb-6 px-2 text-xl font-bold tracking-tight">Fuy<span className="text-primary">o</span>ura</div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <n.icon className="size-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/login" className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
          <LogOut className="size-4" /> Đăng xuất
        </Link>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button className="btn-outline btn-sm md:hidden" onClick={() => setOpen(!open)} aria-label="Menu"><Menu className="size-4" /></button>
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 rounded-md border bg-card px-2.5">
                <StoreIcon className="size-4 text-primary" />
                <select value={storeId} onChange={(e) => actions.setStore(e.target.value)} className="h-9 bg-transparent text-sm outline-none">
                  {stores.map((s) => <option key={s.id} value={s.id} className="bg-card">{s.name}</option>)}
                </select>
              </label>
              <span className="text-sm text-muted-foreground">Khả dụng: <b className="text-foreground">{usd(balance - held)}</b></span>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
