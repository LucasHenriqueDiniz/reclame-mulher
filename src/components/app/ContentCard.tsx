import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export function ContentCard({ children, className = "", innerClassName = "" }: ContentCardProps) {
  return (
    <Card className={`mt-5 shadow-md border-0 overflow-hidden ${className}`}>
      <CardContent className={`p-0 ${innerClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}
