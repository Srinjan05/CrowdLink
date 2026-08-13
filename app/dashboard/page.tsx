import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/supabase/queries";
import { DashboardView } from "@/components/dashboard/dashboard-view";

const VIEWS = new Set(["overview", "alerts", "zones", "reports", "settings"]);

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const requested = typeof searchParams.view === "string" ? searchParams.view : "";
  const view = VIEWS.has(requested) ? requested : "overview";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData(supabase, user.id);

  return <DashboardView initialData={data} userId={user.id} view={view} />;
}
