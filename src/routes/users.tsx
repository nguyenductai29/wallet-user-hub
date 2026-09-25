import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { actions, stores, useApp, usd, type User } from "@/lib/store";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Quản lý người dùng" },
      { name: "description", content: "Danh sách người dùng theo cửa hàng, vai trò, số dư ví và trạng thái." },
      { property: "og:title", content: "Quản lý người dùng" },
      { property: "og:description", content: "Danh sách người dùng theo cửa hàng, vai trò, số dư ví và trạng thái." },
    ],
  }),
  component: UsersPage,
});

const statusMap = { active: ["Hoạt động", "text-success"], locked: ["Đã khoá", "text-destructive"], new: ["Mới", "text-primary"] } as const;

function UsersPage() {
  const { users } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | User["status"]>("all");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", storeId: "s1" });

  const list = users.filter((u) => (filter === "all" || u.status === filter) && (u.name + u.phone + u.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell title="Quản lý người dùng" subtitle={`${users.length} thành viên`}>
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b p-4">
          <div className="relative w-64"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input className="field pl-9" placeholder="Tìm tên, SĐT, email…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          {(["all", "active", "new", "locked"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? "bg-primary text-primary-foreground" : "border border-input"}`}>
              {f === "all" ? "Tất cả" : statusMap[f][0]}
            </button>
          ))}
          <button className="btn-primary btn-sm ml-auto" onClick={() => setAdding(!adding)}><Plus className="size-4" />Thêm user</button>
        </div>

        {adding && (
          <form className="grid gap-2 border-b p-4 md:grid-cols-5" onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.phone) return toast.error("Nhập tên và số điện thoại");
            actions.addUser({ ...form, role: "Khách", balance: 0, status: "new" });
            setForm({ name: "", phone: "", email: "", storeId: "s1" }); setAdding(false); toast.success("Đã thêm user");
          }}>
            <input className="field" placeholder="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="field" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <select className="field" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>
              {stores.map((s) => <option key={s.id} value={s.id} className="bg-card">{s.name}</option>)}
            </select>
            <button className="btn-success">Lưu</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead><tr className="border-b text-left">
              {["Người dùng", "Vai trò", "Store", "Số dư ví", "Trạng thái", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3"><div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{u.name.split(" ").map((w) => w[0]).slice(-2).join("")}</span>
                    <div><div className="font-medium">{u.name}</div><div className="font-mono text-xs text-muted-foreground">{u.phone} · {u.email}</div></div>
                  </div></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.role}</td>
                  <td className="px-4 py-3 text-xs">{stores.find((s) => s.id === u.storeId)?.name}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{usd(u.balance)}</td>
                  <td className={`px-4 py-3 font-medium ${statusMap[u.status][1]}`}>{statusMap[u.status][0]}</td>
                  <td className="px-4 py-3 text-right">
                    <button className={`btn-outline btn-sm ${u.status === "locked" ? "text-success" : "text-destructive"}`} onClick={() => actions.toggleLock(u.id)}>
                      {u.status === "locked" ? "Mở khoá" : "Khoá"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
