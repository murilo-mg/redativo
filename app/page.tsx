import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (authData?.claims) {
    redirect("/dashboard");
  }

  redirect("/login");
}