"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { jobSchema } from "@/lib/schemas/jobSchema";

export type FormState = {
  errors?: Record<string, string[]>;
  message?: string;
  fields?: Record<string, any>;
};

export async function createJob(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabaseServer = await createClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) return { message: "Brak autoryzacji" };

  const rawData = {
    title: formData.get("title"),
    company: formData.get("company"),
    location: formData.get("location"),
    employment_type: formData.get("employment_type"),
    contact_email: formData.get("contact_email"),
    is_remote: formData.get("is_remote") === "on",
    salary_from: formData.get("salary_from"),
    salary_to: formData.get("salary_to"),
    tags: formData.get("tags"),
    description: formData.get("description"),
  };

  const validatedFields = jobSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      fields: rawData,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Popraw błędy w formularzu",
    };
  }

  const slug = `${validatedFields.data.title.toLowerCase().replace(/ /g, "-")}-${crypto.randomUUID().split("-")[0]}`;

  const applyUrl = `https://example.com/apply/${slug}`;

  const tagsRaw = formData.get("tags") as string;
  const tagsArray = tagsRaw
    ? tagsRaw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const { error } = await supabaseServer.from("jobs").insert({
    ...validatedFields.data,
    employer_id: user.id,
    slug,
    apply_url: applyUrl,
    tags: tagsArray,
    is_published: true,
  });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("DB Error:", error);
    }
    return { message: "Błąd bazy danych. Spróbuj ponownie", fields: rawData };
  }

  revalidatePath("/employer-panel");
  redirect("/employer-panel");
}

export async function deleteJob(jobId: string) {
  const supabaseServer = await createClient();

  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return { success: false, message: "Brak autoryzacji" };
  }

  const { error } = await supabaseServer
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("employer_id", user.id);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Delete DB Error:", error);
    }

    return {
      success: false,
      message: "Błąd podczas usuwania ogłoszenia z bazy",
    };
  }

  revalidatePath("/employer-panel/jobs");
  revalidatePath("/employer-panel");

  return { success: true, message: "Ogłoszenie zostało pomyślnie usunięte" };
}
