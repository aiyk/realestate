import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";

export default async function AgentIndex() {
  const u = await getSessionUser();
  if (!u) redirect("/login?next=/agent");
  if (u.role === "AGENT") redirect("/agent/dashboard");
  redirect("/agent/apply");
}
