import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Fuyoura" },
      { name: "description", content: "Đăng nhập bằng số điện thoại + OTP theo cửa hàng." },
      { property: "og:title", content: "Đăng nhập — Fuyoura" },
      { property: "og:description", content: "Đăng nhập bằng số điện thoại + OTP theo cửa hàng." },
    ],
  }),
  component: () => <AuthCard mode="login" />,
});
