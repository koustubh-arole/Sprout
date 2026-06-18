import type { Metadata } from "next";
import { AuthScreen } from "@/components/AuthScreen";

export const metadata: Metadata = { title: "Log in — Sprout" };

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
