export type ActionState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      fields?: Record<string, any>;
    }
  | null
  | undefined;

export const getFieldError = (state: ActionState, fieldName: string) => {
  return state?.errors?.[fieldName]?.[0];
};

export const getFieldValue = (state: ActionState, fieldName: string) => {
  return state?.fields?.[fieldName];
};

export const formStyles = {
  label: "block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider",
  errorText: "mt-1 text-xs text-red-600 font-medium",
};

export const getInputStyles = (state: ActionState, fieldName: string) => {
  const hasError = !!getFieldError(state, fieldName);
  const baseStyles =
    "w-full p-3 bg-gray-50 border rounded outline-none transition-colors";

  const errorStyles = hasError
    ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
    : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return `${baseStyles} ${errorStyles}`;
};
