"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProjectType = "mobile-app" | "website" | "web-app";

type ProjectTypeSelectProps = {
  name: string;
  defaultValue?: ProjectType;
};

export function ProjectTypeSelect({
  name,
  defaultValue = "mobile-app",
}: ProjectTypeSelectProps) {
  const [value, setValue] = useState<ProjectType>(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={(nextValue) => setValue(nextValue as ProjectType)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Project type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="mobile-app">Mobile App</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="web-app">Web App</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}
