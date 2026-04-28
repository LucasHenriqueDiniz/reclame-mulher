import { NextResponse } from "next/server";
import { CompaniesRepo } from "@/server/repos/companies";

function formatAvgResponseTime(avgHours: number | null) {
  if (avgHours == null || avgHours <= 0) {
    return "Sem respostas ainda";
  }

  if (avgHours < 24) {
    return `${avgHours}h`;
  }

  const days = Math.round(avgHours / 24);
  return `${days}d`;
}

export async function GET() {
  try {
    const publicCompanies = await CompaniesRepo.findPublic();
    const orderedCompanies = publicCompanies
      .filter((company) => company.slug)
      .sort((a, b) => {
        const aVerified = a.verifiedAt ? 1 : 0;
        const bVerified = b.verifiedAt ? 1 : 0;

        if (aVerified !== bVerified) {
          return bVerified - aVerified;
        }

        return a.name.localeCompare(b.name, "pt-BR");
      });

    const selectedCompanies = orderedCompanies.slice(0, 4);
    const statsMap = await CompaniesRepo.getStatsBatch(selectedCompanies.map((c) => c.id));

    const topCompanies = selectedCompanies.map((company) => {
      const stats = statsMap.get(company.id)!;

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        sector: company.sector ?? "Não informado",
        region:
          company.region ??
          ([company.city, company.state].filter(Boolean).join(" / ") || "Não informada"),
        verifiedAt: company.verifiedAt?.toISOString() ?? null,
        stats: {
          totalComplaints: stats.totalComplaints,
          resolvedComplaints: stats.resolvedCases,
          resolutionRate: stats.resolutionRate,
          avgResponseTime: formatAvgResponseTime(stats.avgResponseHours),
        },
      };
    });

    return NextResponse.json(topCompanies);
  } catch (error) {
    console.error("Error fetching top companies:", error);
    return NextResponse.json([], { status: 200 });
  }
}
