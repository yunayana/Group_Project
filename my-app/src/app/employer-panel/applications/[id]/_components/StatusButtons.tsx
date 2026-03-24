"use client";

import { useState } from "react";
import { updateApplicationStatus } from "@/actions/application";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

type Props = {
  applicationId: string;
  currentStatus: string;
};

export const StatusButtons = ({ applicationId, currentStatus }: Props) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: "accepted" | "rejected") => {
    setIsPending(true);
    const result = await updateApplicationStatus(applicationId, newStatus);

    if (!result.success) {
      alert(result.message);
    } else {
      router.refresh();
    }
    setIsPending(false);
  };

  return (
    <div className="flex gap-3">
      {currentStatus !== "accepted" && (
        <button
          onClick={() => handleStatusChange("accepted")}
          disabled={isPending}
          className={`flex ${isPending ? "cursor-wait" : "cursor-pointer"} items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50`}
        >
          <Check className="w-5 h-5" /> Akceptuj
        </button>
      )}

      {currentStatus !== "rejected" && (
        <button
          onClick={() => handleStatusChange("rejected")}
          disabled={isPending}
          className={`flex ${isPending ? "cursor-wait" : "cursor-pointer"} items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50`}
        >
          <X className="w-5 h-5" /> Odrzuć
        </button>
      )}
    </div>
  );
};
