import WaterLogger from "@/components/WaterLogger";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function WaterPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <main style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <WaterLogger userId={user.id} />
    </main>
  );
}
