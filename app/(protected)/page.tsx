import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RealEstateApp } from "@/components/real-estate-app";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return <RealEstateApp />;
}
