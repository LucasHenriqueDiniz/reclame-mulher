import { NextRequest, NextResponse } from "next/server";
import { CompaniesRepo } from "@/server/repos/companies";
import { db } from "@/db/client";
import { complaints, companies, profiles, projects } from "@/db/schema";
import { ilike, and, eq, desc, or, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const scope = searchParams.get("scope") || "all"; // all, companies, complaints
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query) {
      return NextResponse.json({
        companies: [],
        complaints: [],
        total: 0,
      });
    }

    const results: {
      companies: Array<{
        id: string;
        name: string;
        corporateName: string | null;
        sector: string | null;
        region: string | null;
        verifiedAt: Date | null;
        slug: string | null;
        stats: {
          totalProjects: number;
          activeProjects: number;
          totalComplaints: number;
          resolvedComplaints: number;
          resolutionRate: number;
        };
      }>;
      complaints: Array<{
        id: string;
        title: string;
        description: string;
        status: string;
        createdAt: Date;
        companyName: string | null;
        authorName: string | null;
      }>;
      total: number;
    } = {
      companies: [],
      complaints: [],
      total: 0,
    };

    // Buscar empresas com estatísticas
    if (scope === "all" || scope === "companies") {
      const companiesResults = await CompaniesRepo.findPublic(query, false);
      
      // Buscar estatísticas para cada empresa
      const companiesWithStats = await Promise.all(
        companiesResults.slice(0, limit).map(async (c) => {
          // Contar projetos
          const [projectStats] = await db
            .select({
              total: count(projects.id),
              active: sql<number>`count(case when ${projects.status} = 'IN_PROGRESS' then 1 end)`,
            })
            .from(projects)
            .where(eq(projects.companyId, c.id));

          // Contar reclamações
          const [complaintStats] = await db
            .select({
              total: count(complaints.id),
              resolved: sql<number>`count(case when ${complaints.status} = 'RESOLVED' then 1 end)`,
            })
            .from(complaints)
            .where(eq(complaints.companyId, c.id));

          const totalComplaints = Number(complaintStats?.total || 0);
          const resolvedComplaints = Number(complaintStats?.resolved || 0);
          const resolutionRate = totalComplaints > 0 
            ? Math.round((resolvedComplaints / totalComplaints) * 100) 
            : 0;

          return {
            id: c.id,
            name: c.name,
            corporateName: c.corporateName,
            sector: c.sector,
            region: c.region,
            verifiedAt: c.verifiedAt,
            slug: c.slug,
            stats: {
              totalProjects: Number(projectStats?.total || 0),
              activeProjects: Number(projectStats?.active || 0),
              totalComplaints,
              resolvedComplaints,
              resolutionRate,
            },
          };
        })
      );

      results.companies = companiesWithStats;
    }

    // Buscar reclamações públicas
    if (scope === "all" || scope === "complaints") {
      const complaintsResults = await db
        .select({
          id: complaints.id,
          title: complaints.title,
          description: complaints.description,
          status: complaints.status,
          createdAt: complaints.createdAt,
          companyName: companies.name,
          authorName: profiles.name,
        })
        .from(complaints)
        .leftJoin(companies, eq(complaints.companyId, companies.id))
        .leftJoin(profiles, eq(complaints.authorId, profiles.userId))
        .where(
          and(
            eq(complaints.isPublic, true),
            or(
              ilike(complaints.title, `%${query}%`),
              ilike(complaints.description, `%${query}%`)
            )
          )
        )
        .orderBy(desc(complaints.createdAt))
        .limit(limit);

      results.complaints = complaintsResults.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        createdAt: c.createdAt,
        companyName: c.companyName,
        authorName: c.authorName,
      }));
    }

    results.total = results.companies.length + results.complaints.length;

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar" },
      { status: 500 }
    );
  }
}
