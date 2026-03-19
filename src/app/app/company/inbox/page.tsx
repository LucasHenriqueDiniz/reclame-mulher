import { redirect } from "next/navigation";

export default function CompanyInboxPage() {
  redirect("/app/company/dashboard?tab=complaints");
}

