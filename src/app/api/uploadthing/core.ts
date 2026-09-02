import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const f = createUploadthing();

// FileRouter for the app
export const ourFileRouter = {
  // Blog image uploads (ADMIN only)
  blogImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getSession();
      
      if (!session?.userId) {
        throw new Error("Unauthorized");
      }

      // Check the caller is ADMIN
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, session.userId))
        .limit(1);

      if (profile?.role !== "ADMIN") {
        throw new Error("Forbidden: Admin access required");
      }

      return { userId: session.userId };
    })
    .onUploadComplete(async ({ file }) => {
      const fileUrl = file.ufsUrl ?? file.url;
      return { url: fileUrl };
    }),

  // Complaint attachment uploads (signed-in users)
  complaintAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session?.userId) {
        throw new Error("Unauthorized");
      }
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ file }) => {
      const fileUrl = file.ufsUrl ?? file.url;
      return { url: fileUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
