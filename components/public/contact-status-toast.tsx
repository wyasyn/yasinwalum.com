"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRef } from "react";

type ContactStatusToastProps = {
  status?: string;
  field?: string;
};

const fieldLabelMap: Record<string, string> = {
  name: "name",
  email: "email",
  inquiryType: "inquiry type",
  message: "message",
};

export function ContactStatusToast({ status, field }: ContactStatusToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const handledKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!status) {
      return;
    }

    const key = `${pathname}:${status}:${field ?? ""}`;
    if (handledKeyRef.current === key) {
      return;
    }
    handledKeyRef.current = key;

    if (status === "sent") {
      toast.success("Inquiry sent", {
        description: "Thanks. I will reply soon.",
      });
    } else if (status === "invalid") {
      const fieldLabel = field ? fieldLabelMap[field] ?? field : null;
      toast.error("Missing details", {
        description: fieldLabel
          ? `Please check the ${fieldLabel} field and try again.`
          : "Please complete required fields.",
      });
    } else if (status === "error") {
      toast.error("Send failed", {
        description: "Please try again in a moment.",
      });
    }

    router.replace(pathname);
  }, [field, pathname, router, status]);

  return null;
}
