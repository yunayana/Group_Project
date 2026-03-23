import { z } from "zod";

export const jobSchema = z
  .object({
    title: z.string().min(5, "Tytuł musi mieć min. 5 znaków"),
    company: z.string().min(2, "Nazwa firmy jest wymagana"),
    location: z.string().min(2, "Lokalizacja jest wymagana"),
    employment_type: z.enum(["B2B", "Umowa o pracę", "Umowa Zlecenie"], {
      message: "Wybierz poprawny typ umowy",
    }),
    contact_email: z.email("Podaj poprawny adres email"),
    is_remote: z.boolean().default(false),
    salary_from: z.preprocess(
      (val) => (val === "" ? null : val),
      z.coerce.number().positive().nullable(),
    ),
    salary_to: z.preprocess(
      (val) => (val === "" ? null : val),
      z.coerce.number().positive().nullable(),
    ),
    tags: z.string().optional().or(z.literal("")),
    description: z.string().min(20, "Opis musi mieć przynajmniej 20 znaków"),
  })
  .refine(
    (data) => {
      if (data.salary_from && data.salary_to) {
        return data.salary_to >= data.salary_from;
      }
      return true;
    },
    {
      message: "Wynagrodzenie 'Do' nie może być niższe niż 'Od'",
      path: ["salary_to"],
    },
  );
