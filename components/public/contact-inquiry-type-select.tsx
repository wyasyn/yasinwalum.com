"use client";

import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type InquiryType = "project" | "consulting" | "collaboration" | "other";

type ContactInquiryTypeSelectProps = {
  name: string;
  defaultValue?: InquiryType;
};

export function ContactInquiryTypeSelect({
  name,
  defaultValue = "project",
}: ContactInquiryTypeSelectProps) {
  const [value, setValue] = useState<InquiryType>(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={(next) => setValue(next as InquiryType)}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Inquiry type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="project">Project build</SelectItem>
            <SelectItem value="consulting">Consulting</SelectItem>
            <SelectItem value="collaboration">Collaboration</SelectItem>
            <SelectItem value="other">Other inquiry</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}
