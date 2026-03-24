"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: "accepted" | "rejected" | "submitted",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Brak autoryzacji" };

  const { data: appData, error: appError } = await supabase
    .from("applications")
    .select("jobs!fk_app_job!inner(employer_id)")
    .eq("id", applicationId)
    .single();

  if (appError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Błąd Supabase podczas sprawdzania uprawnień:", appError);
    }
  }

  const jobInfo = Array.isArray(appData?.jobs)
    ? appData?.jobs[0]
    : (appData?.jobs as any);

  if (appError || !appData || jobInfo?.employer_id !== user.id) {
    return { success: false, message: "Brak dostępu do tej aplikacji" };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: newStatus })
    .eq("id", applicationId);

  if (error) {
    console.error("Błąd aktualizacji statusu:", error);
    return { success: false, message: "Błąd bazy danych" };
  }

  revalidatePath(`/employer-panel/applications/${applicationId}`);
  revalidatePath("/employer-panel/applications");

  return { success: true };
}
