"use client";

import { useActionState } from "react";
import { updateJob } from "@/actions/job";
import {
  getFieldError,
  getFieldValue,
  getInputStyles,
  formStyles,
} from "@/lib/form-utils";

type EditJobFormProps = {
  job: any;
};

export const EditJobForm = ({ job }: EditJobFormProps) => {
  const updateJobWithId = updateJob.bind(null, job.id);

  const [state, formAction, isPending] = useActionState(updateJobWithId, {
    message: "",
    errors: {},
    fields: {},
  });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.message && (
        <div
          className={`p-4 rounded border font-bold ${Object.keys(state.errors || {}).length > 0 ? "bg-red-50 text-red-700! border-red-200" : "bg-gray-50 text-gray-800! border-gray-200"}`}
        >
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="title" className={formStyles.label}>
          Tytuł stanowiska *
        </label>
        <input
          id="title"
          name="title"
          defaultValue={getFieldValue(state, "title") ?? job.title}
          className={getInputStyles(state, "title")}
        />
        {getFieldError(state, "title") && (
          <p className={formStyles.errorText}>
            {getFieldError(state, "title")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company" className={formStyles.label}>
            Nazwa firmy *
          </label>
          <input
            id="company"
            name="company"
            defaultValue={getFieldValue(state, "company") ?? job.company}
            className={getInputStyles(state, "company")}
          />
          {getFieldError(state, "company") && (
            <p className={formStyles.errorText}>
              {getFieldError(state, "company")}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="location" className={formStyles.label}>
            Lokalizacja *
          </label>
          <input
            id="location"
            name="location"
            defaultValue={getFieldValue(state, "location") ?? job.location}
            className={getInputStyles(state, "location")}
          />
          {getFieldError(state, "location") && (
            <p className={formStyles.errorText}>
              {getFieldError(state, "location")}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="salary_from" className={formStyles.label}>
            Widełki od (PLN)
          </label>
          <input
            id="salary_from"
            name="salary_from"
            type="number"
            defaultValue={
              getFieldValue(state, "salary_from") ?? (job.salary_from || "")
            }
            className={getInputStyles(state, "salary_from")}
          />
          {getFieldError(state, "salary_from") && (
            <p className={formStyles.errorText}>
              {getFieldError(state, "salary_from")}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="salary_to" className={formStyles.label}>
            Widełki do (PLN)
          </label>
          <input
            id="salary_to"
            name="salary_to"
            type="number"
            defaultValue={
              getFieldValue(state, "salary_to") ?? (job.salary_to || "")
            }
            className={getInputStyles(state, "salary_to")}
          />
          {getFieldError(state, "salary_to") && (
            <p className={formStyles.errorText}>
              {getFieldError(state, "salary_to")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="employment_type" className={formStyles.label}>
          Rodzaj umowy *
        </label>
        <select
          id="employment_type"
          name="employment_type"
          defaultValue={
            getFieldValue(state, "employment_type") ??
            (job.employment_type || "B2B")
          }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact_email" className={formStyles.label}>
            Email kontaktowy *
          </label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            defaultValue={
              getFieldValue(state, "contact_email") ?? job.contact_email
            }
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
            defaultChecked={getFieldValue(state, "is_remote") ?? job.is_remote}
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

      <div>
        <label htmlFor="tags" className={formStyles.label}>
          Tagi (po przecinku)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={
            getFieldValue(state, "tags") ?? (job.tags?.join(", ") || "")
          }
          placeholder="np. React, Next.js, Tailwind"
          className={getInputStyles(state, "tags")}
        />
        {getFieldError(state, "tags") && (
          <p className={formStyles.errorText}>{getFieldError(state, "tags")}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className={formStyles.label}>
          Opis stanowiska *
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={getFieldValue(state, "description") ?? job.description}
          rows={8}
          className={`${getInputStyles(state, "description")} resize-y`}
        ></textarea>
        {getFieldError(state, "description") && (
          <p className={formStyles.errorText}>
            {getFieldError(state, "description")}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 disabled:shadow-none"
      >
        {isPending ? "Zapisywanie zmian..." : "Zapisz zmiany"}
      </button>
    </form>
  );
};
