"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // OAuth callbacks are not used. Redirect to app.
    router.push("/app");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#3BA5FF]" />
    </div>
  );
}
