import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const f = createUploadthing();

// FileRouter para a aplicação
export const ourFileRouter = {
  // Rota para upload de imagens do blog (apenas ADMIN)
  blogImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getSession();
      
      if (!session?.userId) {
        throw new Error("Unauthorized");
      }

      // Verificar se é ADMIN
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
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = file.ufsUrl ?? file.url;
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", fileUrl);

      return { url: fileUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
