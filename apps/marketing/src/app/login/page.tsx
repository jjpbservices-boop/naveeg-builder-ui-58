import { redirect } from "next/navigation";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:4312";

export default function LoginRedirect() {
  redirect(`${DASHBOARD_URL}/app`);
}
