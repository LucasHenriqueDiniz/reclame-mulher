"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { MainHeader } from "@/components/layout/MainHeader";

const NEW_COMPLAINT_PATH = "/app/complaints/new";
const COMPLAINT_DETAIL_REGEX = /^\/app\/complaints\/[0-9a-f-]{36}$/i;

interface AppLayoutGuardProps {
  children: ReactNode;
  session: { userId: string } | null;
}

export function AppLayoutGuard({ children, session }: AppLayoutGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isNewComplaint = pathname?.startsWith(NEW_COMPLAINT_PATH) ?? false;
  const isComplaintDetail = pathname != null && COMPLAINT_DETAIL_REGEX.test(pathname);
  const allowedWithoutSession = isNewComplaint || isComplaintDetail;

  useEffect(() => {
    if (session == null && !allowedWithoutSession) {
      router.replace("/login");
    }
  }, [session, allowedWithoutSession, router]);

  const showHeader = (session != null || isComplaintDetail) && !isNewComplaint;

  return (
    <>
      {showHeader && <MainHeader />}
      {children}
    </>
  );
}
