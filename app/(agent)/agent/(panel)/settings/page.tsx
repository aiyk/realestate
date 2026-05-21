import { redirect } from "next/navigation";

export default function SettingsRootPage() {
  redirect("/agent/settings/account");
}
