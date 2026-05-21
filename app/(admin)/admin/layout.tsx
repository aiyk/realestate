import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
