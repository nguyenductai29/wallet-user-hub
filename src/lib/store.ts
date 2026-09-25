import { useSyncExternalStore } from "react";

export type Store = { id: string; name: string };
export type OtpRow = {
  id: string; time: string; storeId: string; country: string; service: string;
  phone: string; code?: string; sms?: string; price: number;
  status: "waiting" | "received" | "released" | "failed";
};
export type User = {
  id: string; name: string; phone: string; email: string; role: "Quản trị" | "Nhân viên" | "Khách";
  storeId: string; balance: number; status: "active" | "locked" | "new";
};
export type Txn = { id: string; time: string; label: string; amount: number };

export const stores: Store[] = [
  { id: "s1", name: "Store Tokyo #01" },
  { id: "s2", name: "Store Osaka #02" },
  { id: "s3", name: "Store HCM #03" },
];
export const services = [
  { id: "70008", name: "Suntory", price: 0.45 },
  { id: "1008", name: "WhatsApp", price: 0.62 },
  { id: "2031", name: "LINE", price: 0.55 },
  { id: "3302", name: "Mercari", price: 1.36 },
];

const now = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

type State = { storeId: string; balance: number; held: number; rows: OtpRow[]; users: User[]; txns: Txn[] };
let state: State = {
  storeId: "s1",
  balance: 7.56,
  held: 0,
  rows: [
    { id: "r1", time: "09-24 15:35:40", storeId: "s1", country: "+81/日本/japan", service: "Suntory", phone: "7092813682", code: "8730", sms: "ジハンピアプリの認証コードは 8730 です", price: 0.45, status: "received" },
    { id: "r2", time: "09-24 15:28:52", storeId: "s1", country: "+81/日本/japan", service: "Suntory", phone: "7093237709", price: 0.45, status: "released" },
    { id: "r3", time: "09-24 15:24:52", storeId: "s2", country: "+81/日本/japan", service: "LINE", phone: "7093041370", price: 0.55, status: "released" },
  ],
  users: [
    { id: "u1", name: "Linh Nguyễn", phone: "0912 884 207", email: "linh@shop.vn", role: "Quản trị", storeId: "s1", balance: 7.56, status: "active" },
    { id: "u2", name: "Trần Đặng", phone: "0987 331 905", email: "dang@shop.vn", role: "Nhân viên", storeId: "s1", balance: 2.1, status: "active" },
    { id: "u3", name: "Phạm Hòa", phone: "0902 447 118", email: "hoa@mail.com", role: "Khách", storeId: "s2", balance: 0, status: "new" },
    { id: "u4", name: "Ngô Mai", phone: "0934 556 270", email: "mai@mail.com", role: "Khách", storeId: "s3", balance: 0.45, status: "locked" },
  ],
  txns: [
    { id: "t1", time: "09-24 15:35", label: "Nhận mã Suntory", amount: -0.45 },
    { id: "t2", time: "09-24 10:02", label: "Nạp tiền USDT", amount: 5 },
    { id: "t3", time: "09-22 18:40", label: "Nạp tiền thẻ", amount: 3 },
  ],
};
const subs = new Set<() => void>();
const set = (fn: (s: State) => Partial<State>) => { state = { ...state, ...fn(state) }; subs.forEach((l) => l()); };
export const useApp = () => useSyncExternalStore((l) => (subs.add(l), () => subs.delete(l)), () => state, () => state);

export const actions = {
  setStore: (storeId: string) => set(() => ({ storeId })),
  getNumbers: (service: string, price: number, qty: number) => {
    const fresh: OtpRow[] = Array.from({ length: qty }, () => ({
      id: crypto.randomUUID(), time: now(), storeId: state.storeId, country: "+81/日本/japan", service,
      phone: "70" + Math.floor(10000000 + Math.random() * 89999999), price, status: "waiting",
    }));
    set((s) => ({ rows: [...fresh, ...s.rows], held: s.held + price * qty }));
    fresh.forEach((r) => setTimeout(() => {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      set((s) => ({
        rows: s.rows.map((x) => x.id === r.id && x.status === "waiting" ? { ...x, status: "received", code, sms: `認証コードは ${code} です` } : x),
        held: Math.max(0, s.held - r.price), balance: s.balance - r.price,
        txns: [{ id: crypto.randomUUID(), time: r.time.slice(0, 11), label: `Nhận mã ${r.service}`, amount: -r.price }, ...s.txns],
      }));
    }, 3000 + Math.random() * 3000));
  },
  release: (id: string) => set((s) => {
    const r = s.rows.find((x) => x.id === id);
    return { rows: s.rows.map((x) => x.id === id ? { ...x, status: "released" } : x), held: r?.status === "waiting" ? Math.max(0, s.held - r.price) : s.held };
  }),
  remove: (id: string) => set((s) => ({ rows: s.rows.filter((x) => x.id !== id) })),
  clearReceived: () => set((s) => ({ rows: s.rows.filter((x) => x.status !== "received") })),
  clearAll: () => set(() => ({ rows: [], held: 0 })),
  topUp: (amount: number, method: string) => set((s) => ({
    balance: s.balance + amount,
    txns: [{ id: crypto.randomUUID(), time: now().slice(0, 11), label: `Nạp tiền ${method}`, amount }, ...s.txns],
  })),
  toggleLock: (id: string) => set((s) => ({ users: s.users.map((u) => u.id === id ? { ...u, status: u.status === "locked" ? "active" : "locked" } : u) })),
  addUser: (u: Omit<User, "id">) => set((s) => ({ users: [{ ...u, id: crypto.randomUUID() }, ...s.users] })),
};

export const usd = (n: number) => `$${n.toFixed(2)}`;
