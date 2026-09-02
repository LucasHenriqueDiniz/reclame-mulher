"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchCompany, type SearchCompanyItem } from "@/components/company";

// Wizard components
import { ComplaintWizardShell } from "./wizard/complaint-wizard-shell";
import { ComplaintLoginBanner } from "./wizard/complaint-login-banner";
import { ComplaintCompanyHeader } from "./wizard/complaint-company-header";
import { ComplaintStepProgress } from "./wizard/complaint-step-progress";
import { ComplaintStepFooter } from "./wizard/complaint-step-footer";

// Step components
import { StepOne, type StepOneData } from "./steps/step-one";
import { StepTwo, type StepTwoData } from "./steps/step-two";
import { StepThree, type StepThreeData } from "./steps/step-three";
import { StepFour, type StepFourData } from "./steps/step-four";
import { uploadFiles } from "@/lib/uploadthing";

// Success card
import { ComplaintSuccessCard } from "./complaint-success-card";

const TOTAL_STEPS = 4;

export type CompanyInfo = {
  id: string;
  name: string;
  logoUrl?: string | null;
  verifiedAt?: string | null;
  region?: string | null;
};

export type ProjectOption = { id: string; name: string; status?: string };

type NewComplaintContentProps = {
  session: { userId: string } | null;
  company: CompanyInfo | null;
  projects: ProjectOption[];
  projectsInProgress?: number;
  initialProjectId?: string | null;
};

const defaultStepOne: StepOneData = {
  hasPreviousComplaintElsewhere: false,
  previousComplaintChannel: "",
};

const defaultStepTwo: StepTwoData = {
  title: "",
  description: "",
  problemLocation: "",
};

const defaultStepThree: StepThreeData = {
  attachments: [],
};

const defaultStepFour: StepFourData = {
  impactCategory: "",
  companyProjectId: "",
  urgencyLevel: "",
  impactScope: "",
  isAnonymous: false,
  isPublic: true,
};

export function NewComplaintContent({
  session,
  company,
  projects,
  projectsInProgress = 0,
  initialProjectId,
}: NewComplaintContentProps) {
  const [step, setStep] = useState(1);
  const [stepOne, setStepOne] = useState<StepOneData>(defaultStepOne);
  const [stepTwo, setStepTwo] = useState<StepTwoData>(defaultStepTwo);
  const [stepThree, setStepThree] = useState<StepThreeData>(defaultStepThree);
  const [stepFour, setStepFour] = useState<StepFourData>({
    ...defaultStepFour,
    companyProjectId: initialProjectId ?? "",
  });
  const [searchCompanyModalOpen, setSearchCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyInfo | null>(null);
  const [selectedCompanyProjects, setSelectedCompanyProjects] = useState<ProjectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdComplaint, setCreatedComplaint] = useState<{
    id: string;
    title: string;
    companyName: string;
    verified?: boolean;
  } | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    const res = await uploadFiles("complaintAttachment", {
      files: [file],
    });
    const uploaded = res[0];
    if (!uploaded) {
      throw new Error("Falha ao enviar arquivo");
    }
    return {
      file_path: uploaded.url,
      file_name: file.name,
      content_type: file.type,
      size_bytes: file.size,
    };
  }, []);

  const effectiveCompany = selectedCompany ?? company;
  const effectiveProjects = selectedCompany ? selectedCompanyProjects : projects;
  const projectsInProgressCount = selectedCompany
    ? effectiveProjects.filter((p) => (p as ProjectOption & { status?: string }).status === "IN_PROGRESS").length
    : projectsInProgress;

  const handleSelectCompany = useCallback(async (item: SearchCompanyItem) => {
    const info: CompanyInfo = {
      id: item.id,
      name: item.name,
      logoUrl: item.logoUrl,
      region: item.region,
      verifiedAt: item.verifiedAt,
    };
    setSelectedCompany(info);
    setSearchCompanyModalOpen(false);
    try {
      const res = await fetch(`/api/companies/${item.id}/projects`);
      if (res.ok) {
        const list = await res.json();
        setSelectedCompanyProjects(
          (Array.isArray(list) ? list : []).map((p: { id: string; name: string; status?: string }) => ({
            id: p.id,
            name: p.name,
            status: p.status,
          }))
        );
      } else {
        setSelectedCompanyProjects([]);
      }
    } catch {
      setSelectedCompanyProjects([]);
    }
  }, []);

  const buildPayload = useCallback(() => {
    if (!effectiveCompany) return null;

    const attachment_paths = stepThree.attachments
      .filter((a) => a.file_path)
      .map((a) => ({
        file_path: a.file_path,
        file_name: a.file_name,
        content_type: a.content_type,
        size_bytes: a.size_bytes,
      }));

    return {
      company_id: effectiveCompany.id,
      project_id: stepFour.companyProjectId || undefined,
      title: stepTwo.title.trim(),
      description: stepTwo.description.trim(),
      problem_location: stepTwo.problemLocation.trim() || undefined,
      has_previous_complaint_elsewhere: stepOne.hasPreviousComplaintElsewhere,
      previous_complaint_channel: stepOne.hasPreviousComplaintElsewhere
        ? (stepOne.previousComplaintChannel?.trim() || undefined)
        : undefined,
      impact_category: stepFour.impactCategory || undefined,
      urgency_level: stepFour.urgencyLevel || undefined,
      impact_scope: stepFour.impactScope || undefined,
      is_anonymous: stepFour.isAnonymous,
      is_public: stepFour.isPublic,
      attachment_paths: attachment_paths.length ? attachment_paths : undefined,
    };
  }, [effectiveCompany, stepOne, stepTwo, stepThree, stepFour]);

  const submit = useCallback(async () => {
    const payload = buildPayload();
    if (!payload || !session) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error ?? "Erro ao criar relato.");
        return;
      }
      setCreatedComplaint({
        id: data.id,
        title: data.title,
        companyName: effectiveCompany?.name ?? "",
        verified: effectiveCompany?.verifiedAt != null,
      });
      setStep(TOTAL_STEPS + 1);
    } finally {
      setSubmitting(false);
    }
  }, [buildPayload, session, effectiveCompany]);

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else submit();
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const canProceed =
    (step === 1) ||
    (step === 2 && stepTwo.title.trim().length >= 3 && stepTwo.description.trim().length >= 10) ||
    (step === 3) ||
    (step === 4 && stepFour.impactCategory && stepFour.urgencyLevel && stepFour.impactScope);

  if (createdComplaint) {
    return (
      <ComplaintWizardShell>
        <ComplaintSuccessCard
          title={createdComplaint.title}
          complaintId={createdComplaint.id}
          companyName={createdComplaint.companyName}
          verified={createdComplaint.verified}
        />
      </ComplaintWizardShell>
    );
  }

  const canSubmit = Boolean(effectiveCompany && session);
  
  // Pick the button label from the current step and state
  const getNextLabel = () => {
    if (step === 3) {
      return stepThree.attachments.length > 0 ? "Continuar" : "Continuar sem foto";
    }
    if (step === TOTAL_STEPS) {
      return "Enviar relato";
    }
    return "Continuar";
  };

  const nextLabel = getNextLabel();

  return (
    <ComplaintWizardShell>
      {/* Botão para voltar */}
      <Link 
        href="/app/complaints"
        className="inline-flex items-center gap-2 mb-4 text-[#607D8B] hover:text-[#1E88E5] transition-colors"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-['Poppins'] font-medium text-sm">
          Voltar para minhas reclamações
        </span>
      </Link>

      {!session && <ComplaintLoginBanner />}

      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 bg-white backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {effectiveCompany ? (
            <ComplaintCompanyHeader
              name={effectiveCompany.name}
              logoUrl={effectiveCompany.logoUrl}
              verified={effectiveCompany.verifiedAt != null}
              region={effectiveCompany.region ?? undefined}
              projectsCount={projectsInProgressCount}
            />
          ) : (
            <div className="rounded-xl border-2 border-dashed border-[#1E88E5]/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 px-5 py-6 text-center transition-all duration-300 hover:border-[#1E88E5]/50 hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="w-12 h-12 rounded-lg bg-[#1E88E5]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#1E88E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-['Poppins'] font-semibold text-[#2A3F54] text-base mb-0.5">
                      Selecione uma empresa
                    </p>
                    <p className="font-['Poppins'] text-[#607D8B] text-xs">
                      Busque a empresa para iniciar seu relato
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  className="bg-[#1E88E5] hover:bg-[#1976D2] text-white px-6 py-2.5 h-auto rounded-lg font-['Poppins'] font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex-shrink-0"
                  onClick={() => setSearchCompanyModalOpen(true)}
                >
                  Buscar
                </Button>
              </div>
            </div>
          )}

          <ComplaintStepProgress currentStep={step} totalSteps={TOTAL_STEPS} />

          {/* Steps com animação de transição */}
          <div className="relative overflow-hidden w-full">
            <div
              className="flex transition-all duration-500 ease-out"
              style={{
                transform: `translateX(-${(step - 1) * 100}%)`,
              }}
            >
              <div className="w-full flex-shrink-0 px-1" style={{ width: "100%" }}>
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <StepOne data={stepOne} onChange={setStepOne} />
                </div>
              </div>
              <div className="w-full flex-shrink-0 px-1" style={{ width: "100%" }}>
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <StepTwo data={stepTwo} onChange={setStepTwo} />
                </div>
              </div>
              <div className="w-full flex-shrink-0 px-1" style={{ width: "100%" }}>
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <StepThree
                    data={stepThree}
                    onChange={setStepThree}
                    onUpload={handleUpload}
                  />
                </div>
              </div>
              <div className="w-full flex-shrink-0 px-1" style={{ width: "100%" }}>
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <StepFour
                    data={stepFour}
                    onChange={setStepFour}
                    projects={effectiveProjects}
                  />
                </div>
              </div>
            </div>
          </div>

          <ComplaintStepFooter
            onBack={goPrev}
            onNext={goNext}
            showBackButton={step > 1}
            nextLabel={nextLabel}
            disableNext={!canProceed || (step === TOTAL_STEPS && !canSubmit)}
            loading={submitting}
          />

          {submitError && (
            <p className="text-sm text-red-600 text-center font-['Poppins']">
              {submitError}
            </p>
          )}
          {!canSubmit && step === TOTAL_STEPS && (
            <p className="text-sm text-[#607D8B] text-center font-['Poppins']">
              {!session ? "Faça login para enviar." : "Selecione uma empresa para enviar."}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={searchCompanyModalOpen} onOpenChange={setSearchCompanyModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border-0 animate-in fade-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle className="font-['Poppins'] font-semibold text-[#2A3F54] text-xl">
              Selecionar empresa
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SearchCompany
              onSelect={handleSelectCompany}
              placeholder="Buscar por nome da empresa..."
            />
          </div>
        </DialogContent>
      </Dialog>
    </ComplaintWizardShell>
  );
}
