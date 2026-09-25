import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Tạo tài khoản — Fuyoura" },
      { name: "description", content: "Tạo tài khoản mới bằng số điện thoại và mã OTP." },
      { property: "og:title", content: "Tạo tài khoản — Fuyoura" },
      { property: "og:description", content: "Tạo tài khoản mới bằng số điện thoại và mã OTP." },
    ],
  }),
  component: () => <AuthCard mode="register" />,
});
