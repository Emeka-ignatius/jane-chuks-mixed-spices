import React from "react";
import { cn } from "@/lib/utils";
import { IMaxWidthWrapper } from "@/lib/types";

export default function MaxWidthWrapper({
  className,
  children,
}: IMaxWidthWrapper) {
  return (
    <div className={cn("max-w-7xl mx-auto px-5 md:px-10", className)}>
      {children}
    </div>
  );
}
