"use client";

import { companyTheme as S } from "./theme";
import { formatDate } from "./utils";

/** Backend can later add verificationRequestedAt, verificationRejectedAt for pending/rejected */
export type VerificationState = "none" | "pending" | "verified" | "rejected";

export function CompanyVerificationPanel({
  verifiedAt,
  verificationStatus,
}: {
  verifiedAt?: string | null;
  verificationStatus?: VerificationState;
}) {
  const isVerified = !!verifiedAt;
  const status: VerificationState =
    verificationStatus ?? (isVerified ? "verified" : "none");

  return (
    <div style={{ maxWidth: 480 }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: S.text,
          marginBottom: 20,
        }}
      >
        Verificar empresa
      </h3>
      {status === "verified" && (
        <div
          style={{
            background: "#D1FAE5",
            border: `1px solid ${S.green}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: S.green,
              marginBottom: 8,
            }}
          >
            ✓ Empresa verificada
          </div>
          <div style={{ fontSize: 14, color: S.muted }}>
            Verificada em {verifiedAt ? formatDate(verifiedAt) : "—"}. O selo
            de empresa verificada é exibido no seu perfil público.
          </div>
        </div>
      )}

      {status === "pending" && (
        <div
          style={{
            background: "#FEF3C7",
            border: `1px solid ${S.yellow}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: S.orange,
              marginBottom: 8,
            }}
          >
            Verificação em análise
          </div>
          <div style={{ fontSize: 14, color: S.muted }}>
            Nossa equipe está analisando sua solicitação. Nesta versão não sai
            aviso por e-mail — volte a esta tela para ver o resultado.
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div
          style={{
            background: "#FEE2E2",
            border: `1px solid ${S.red}44`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: S.red,
              marginBottom: 8,
            }}
          >
            Verificação rejeitada
          </div>
          <div style={{ fontSize: 14, color: S.muted }}>
            Peça mais informações a quem administra a plataforma.
          </div>
        </div>
      )}

      {status === "none" && (
        <>
          <div
            style={{
              background: S.light,
              border: `1px solid ${S.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: S.text,
                marginBottom: 8,
              }}
            >
              Sua empresa ainda não foi verificada
            </div>
            <div style={{ fontSize: 14, color: S.muted }}>
              Empresas verificadas recebem um selo no perfil público e têm mais
              visibilidade na plataforma.
            </div>
          </div>
          <p
            style={{
              fontSize: 14,
              color: S.text,
              marginBottom: 12,
              lineHeight: 1.6,
            }}
          >
            Para solicitar a verificação:
          </p>
          <ol
            style={{
              paddingLeft: 20,
              color: S.muted,
              fontSize: 14,
              lineHeight: 1.8,
              marginBottom: 16,
            }}
          >
            <li>Preencha todos os dados da empresa (CNPJ, endereço, responsável)</li>
            <li>
              Avise <strong>quem administra a plataforma</strong>. Nesta versão a
              verificação é feita direto pela administração: não há caixa de
              e-mail para onde mandar
            </li>
            <li>Tenha à mão o Cartão CNPJ e o documento do responsável</li>
          </ol>
        </>
      )}
    </div>
  );
}
