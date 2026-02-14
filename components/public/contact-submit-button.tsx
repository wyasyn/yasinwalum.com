"use client";

import { useFormStatus } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function ContactSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send Inquiry"}
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
    </Button>
  );
}
