"use client";

import Link from "next/link";
import { createJob } from "@/actions/createJob";
import { ArrowLeft } from "lucide-react";
import { useActionState } from "react";

export default function NewJobPage() {
  const [state, formAction, isPending] = useActionState(createJob, {
    errors: {},
    message: "",
    fields: {},
  });

  const getError = (fieldName: string) => state?.errors?.[fieldName]?.[0];
  const getFieldValue = (fieldName: string) => state?.fields?.[fieldName];

  const labelStyles =
    "block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider";

  const inputStyles = (fieldName: string) => `
    w-full p-3 bg-gray-50 border rounded focus:ring-1 outline-none transition-colors
    ${
      getError(fieldName)
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    }
  `;

  const errorTextStyles = "mt-1 text-xs text-red-600! font-medium";

  return (
    <section className="p-8 w-full max-w-4xl mx-auto bg-gray-50">
      <Link
        href="/employer-panel"
        className="flex hover:underline mb-6 items-center gap-2 font-medium "
      >
        <ArrowLeft className="w-4 h-4" /> Wróć do panelu
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <header className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-bold mb-1">Dodaj nowe ogłoszenie</h1>
          <p>Wypełnij poniższe pola, aby opublikować nową ofertę pracy</p>
        </header>

        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className={labelStyles}>
                Tytuł stanowiska *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={getFieldValue("title")}
                className={inputStyles("title")}
                placeholder="np. Senior React Developer"
              />
              {getError("title") && (
                <p className={errorTextStyles}>{getError("title")}</p>
              )}
            </div>
            <div>
              <label htmlFor="company" className={labelStyles}>
                Nazwa Firmy *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                defaultValue={getFieldValue("company")}
                className={inputStyles("company")}
                placeholder="np. TechMarket Sp. z o.o."
              />
              {getError("company") && (
                <p className={errorTextStyles}>{getError("company")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className={labelStyles}>
                Lokalizacja *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                defaultValue={getFieldValue("location")}
                className={inputStyles("location")}
                placeholder="np. Warszawa"
              />
              {getError("location") && (
                <p className={errorTextStyles}>{getError("location")}</p>
              )}
            </div>
            <div>
              <label htmlFor="employment_type" className={labelStyles}>
                Typ umowy *
              </label>
              <select
                id="employment_type"
                name="employment_type"
                defaultValue={getFieldValue("employment_type") || "B2B"}
                className={inputStyles("employment_type")}
              >
                <option value="B2B">B2B</option>
                <option value="Umowa o pracę">Umowa o Pracę</option>
                <option value="Umowa Zlecenie">Umowa Zlecenie</option>
              </select>
              {getError("employment_type") && (
                <p className={errorTextStyles}>{getError("employment_type")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact_email" className={labelStyles}>
                Email kontaktowy *
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                defaultValue={getFieldValue("contact_email")}
                className={inputStyles("contact_email")}
                placeholder="rekrutacja@firma.pl"
              />
              {getError("contact_email") && (
                <p className={errorTextStyles}>{getError("contact_email")}</p>
              )}
            </div>
            <div className="flex items-center h-full pt-6 md:pl-6 md:border-l border-gray-200">
              <input
                type="checkbox"
                id="is_remote"
                name="is_remote"
                defaultChecked={!!getFieldValue("is_remote")}
                className="w-5 h-5 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="is_remote"
                className="ml-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
              >
                Praca w pełni zdalna
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="salary_from" className={labelStyles}>
                Wynagrodzenie Od (PLN)
              </label>
              <div>
                <input
                  type="number"
                  id="salary_from"
                  name="salary_from"
                  defaultValue={getFieldValue("salary_from")}
                  className={`${inputStyles("salary_from")} pr-16`}
                  placeholder="6000"
                />
              </div>
              {getError("salary_from") && (
                <p className={errorTextStyles}>{getError("salary_from")}</p>
              )}
            </div>

            <div>
              <label htmlFor="salary_to" className={labelStyles}>
                Wynagrodzenie Do (PLN)
              </label>
              <div>
                <input
                  type="number"
                  id="salary_to"
                  name="salary_to"
                  defaultValue={getFieldValue("salary_to")}
                  className={`${inputStyles("salary_to")} pr-16`}
                  placeholder="9000"
                />
              </div>
              {getError("salary_to") && (
                <p className={errorTextStyles}>{getError("salary_to")}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className={labelStyles}>
              Technologie / Tagi
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              defaultValue={getFieldValue("tags")}
              className={inputStyles("tags")}
              placeholder="np. React, TypeScript, Node.js"
            />
            <p className="mt-1 text-[10px] uppercase font-bold">
              Wartości rozdzielone przecinkami
            </p>
            {getError("tags") && (
              <p className={errorTextStyles}>{getError("tags")}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className={labelStyles}>
              Opis i wymagania *
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={getFieldValue("description")}
              className={`${inputStyles("description")} resize-y`}
              placeholder="Opisz zakres obowiązków..."
            ></textarea>
            {getError("description") && (
              <p className={errorTextStyles}>{getError("description")}</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            {state?.message && (
              <p
                className={`mb-4 text-sm p-3 rounded border ${Object.keys(state.errors || {}).length > 0 ? "text-red-600! bg-red-50 border-red-200" : " bg-gray-50 border-gray-200"}`}
              >
                {state.message}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full ${isPending ? "cursor-wait" : "cursor-pointer"} bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded transition-colors shadow-lg shadow-blue-200 disabled:shadow-none`}
            >
              {isPending ? "Publikowanie..." : "Opublikuj ogłoszenie"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
