import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { AgentShell } from "@/components/agent/agent-shell";

export default async function AgentPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/agent");
  if (user.role !== "AGENT") redirect("/agent/apply");
  return <AgentShell>{children}</AgentShell>;
}
