import { CompanyComplaintDetailContent } from "./_components/company-complaint-detail-content";

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  const { id } = await params;

  return <CompanyComplaintDetailContent id={id} />;
}

