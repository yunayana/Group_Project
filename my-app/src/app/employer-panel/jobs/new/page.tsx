"use client";

import Link from "next/link";
import { createJob } from "@/actions/job";
import { ArrowLeft } from "lucide-react";
import { useActionState } from "react";
import {
  getFieldError,
  getFieldValue,
  getInputStyles,
  formStyles,
} from "@/lib/form-utils";

export default function NewJobPage() {
  const [state, formAction, isPending] = useActionState(createJob, {
    errors: {},
    message: "",
    fields: {},
  });

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
              <label htmlFor="title" className={formStyles.label}>
                Tytuł stanowiska *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={getFieldValue(state, "title")}
                className={getInputStyles(state, "title")}
                placeholder="np. Senior React Developer"
              />
              {getFieldError(state, "title") && (
                <p className={formStyles.errorText}>
                  {getFieldError(state, "title")}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="company" className={formStyles.label}>
                Nazwa Firmy *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                defaultValue={getFieldValue(state, "company")}
                className={getInputStyles(state, "company")}
                placeholder="np. TechMarket Sp. z o.o."
              />
              {getFieldError(state, "company") && (
                <p className={formStyles.errorText}>
                  {getFieldError(state, "company")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className={formStyles.label}>
                Lokalizacja *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                defaultValue={getFieldValue(state, "location")}
                className={getInputStyles(state, "location")}
                placeholder="np. Warszawa"
              />
              {getFieldError(state, "location") && (
                <p className={formStyles.errorText}>
                  {getFieldError(state, "location")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="employment_type" className={formStyles.label}>
                Typ umowy *
              </label>
              <select
                id="employment_type"
                name="employment_type"
                defaultValue={getFieldValue(state, "employment_type") || "B2B"}
                className={getInputStyles(state, "employment_type")}
              >
                <option value="B2B">B2B</option>
                <option value="Umowa o pracę">Umowa o Pracę</option>
                <option value="Umowa Zlecenie">Umowa Zlecenie</option>
              </select>
              {getFieldError(state, "employment_type") && (
                <p className={formStyles.errorText}>
                  {getFieldError(state, "employment_type")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact_email" className={formStyles.label}>
                Email kontaktowy *
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                defaultValue={getFieldValue(state, "contact_email")}
                className={getInputStyles(state, "contact_email")}
                placeholder="rekrutacja@firma.pl"
              />
              {getFieldError(state, "contact_email") && (
                <p className={formStyles.errorText}>
                  {getFieldError(state, "contact_email")}
                </p>
              )}
            </div>
            <div className="flex items-center h-full pt-6 md:pl-6 md:border-l border-gray-200">
              <input
                type="checkbox"
                id="is_remote"
                name="is_remote"
                defaultChecked={!!getFieldValue(state, "is_remote")}
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
              <label htmlFor="salary_from" className={formStyles.label}>
                Wynagrodzenie Od (PLN)
              </label>
              <div>
                <input
                  type="number"
                  id="salary_from"
                  name="salary_from"
                  defaultValue={getFieldValue(state, "salary_from")}
                  className={`${getInputStyles(state, "salary_from")} pr-16`}
                  placeholder="6000"
                />
              </div>
              {getFieldError(state, "salary_from") && (
                <p className={formStyles.errorText}>
                  {getFieldError(state, "salary_from")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="salary_to" className={formStyles.label}>
                Wynagrodzenie Do (PLN)
              </label>
              <div>
                <input
                  type="number"
                  id="salary_to"
                  name="salary_to"
                  defaultValue={getFieldValue(state, "salary_to")}
                  className={`${getInputStyles(state, "salary_to")} pr-16`}
                  placeholder="9000"
                />
              </div>
              {getFieldError(state, "salary_to") && (
                <p className={formStyles.errorText}>
                  {getFieldError(state, "salary_to")}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className={formStyles.label}>
              Technologie / Tagi
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              defaultValue={getFieldValue(state, "tags")}
              className={getInputStyles(state, "tags")}
              placeholder="np. React, TypeScript, Node.js"
            />
            <p className="mt-1 text-[10px] uppercase font-bold">
              Wartości rozdzielone przecinkami
            </p>
            {getFieldError(state, "tags") && (
              <p className={formStyles.errorText}>
                {getFieldError(state, "tags")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className={formStyles.label}>
              Opis i wymagania *
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={getFieldValue(state, "description")}
              className={`${getInputStyles(state, "description")} resize-y`}
              placeholder="Opisz zakres obowiązków..."
            ></textarea>
            {getFieldError(state, "description") && (
              <p className={formStyles.errorText}>
                {getFieldError(state, "description")}
              </p>
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
