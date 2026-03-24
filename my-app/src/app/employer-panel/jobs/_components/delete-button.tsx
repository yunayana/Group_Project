"use client";

import { deleteJob } from "@/actions/job";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteButtonProps = {
  jobId: string;
};

export const DeleteButton = ({ jobId }: DeleteButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Czy na pewno chcesz bezpowrotnie usunąć to ogłoszenie?",
    );

    if (!isConfirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteJob(jobId);

      if (!result.success) {
        alert(`Błąd: ${result.message}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Wystąpił błąd krytyczny:", error);
      }
      alert("Wystąpił nieoczekiwany błąd podczas usuwania");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      disabled={isDeleting}
      onClick={handleDelete}
      className="flex-1 md:flex-none cursor-pointer flex items-center justify-center gap-2 p-2 text-red-600! hover:bg-red-50! rounded-lg transition-colors border border-red-100"
      title="Usuń"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
};
