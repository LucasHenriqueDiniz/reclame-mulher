"use client";

import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { SupportResources } from "@/components/SupportResources";
import {
  getAllCategories,
  getCategoryLabel,
  getCategoryColor,
} from "@/lib/support-resources";

export default function SupportResourcesPage() {
  const categories = getAllCategories();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <MainHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#190E4F] to-[#2A1B5E] py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Recursos de Suporte
            </h1>
            <p className="text-lg text-gray-100 max-w-2xl mx-auto">
              Encontre os contatos de órgãos de defesa, delegacias especializadas e organizações que podem ajudar mulheres em situação de violência ou desigualdade de gênero.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Intro Cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <div className="rounded-lg border-l-4 border-blue-300 bg-blue-50 p-6">
              <h2 className="font-semibold text-blue-900 mb-2">
                Atendimento Urgente
              </h2>
              <p className="text-sm text-blue-800">
                Em caso de risco imediato, ligue <strong>190 (Polícia)</strong> ou <strong>100 (Disque Denúncia)</strong> para denunciar violações de direitos.
              </p>
            </div>

            <div className="rounded-lg border-l-4 border-pink-300 bg-pink-50 p-6">
              <h2 className="font-semibold text-pink-900 mb-2">
                Orientação Jurídica
              </h2>
              <p className="text-sm text-pink-800">
                A Defensoria Pública oferece <strong>atendimento jurídico gratuito</strong> para mulheres que precisam de orientação legal.
              </p>
            </div>
          </div>

          {/* Category Overview */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Categorias de Recurso
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const colors = getCategoryColor(category);
                const label = getCategoryLabel(category);

                return (
                  <div
                    key={category}
                    className={`rounded-lg border-2 p-4 transition-transform hover:scale-105 ${colors.bg} ${colors.border}`}
                  >
                    <h3 className={`font-semibold ${colors.text}`}>
                      {label}
                    </h3>
                    <p className="text-sm text-gray-700 mt-2">
                      Acesse abaixo para informações detalhadas sobre este tipo de recurso.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Resources Component */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <SupportResources
              title="Todos os Recursos Disponíveis"
              description="Navegue pelas categorias abaixo para encontrar o contato e os detalhes de cada serviço."
              grouped
            />
          </div>

          {/* Important Notes Section */}
          <section className="mt-12 rounded-lg border-2 border-gray-200 bg-gray-50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Informações Importantes
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Direitos das Mulheres
                </h3>
                <p className="text-gray-700">
                  Toda mulher tem direito a viver livre de violência e discriminação. Os recursos listados aqui existem para proteger seus direitos e oferecer apoio quando necessário.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Confidencialidade
                </h3>
                <p className="text-gray-700">
                  Todos os órgãos listados garantem sigilo e confidencialidade. Denúncias podem ser feitas anonimamente através dos canais 100, 180 e 191.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Assistência Jurídica Gratuita
                </h3>
                <p className="text-gray-700">
                  A Defensoria Pública oferece assistência jurídica <strong>completamente gratuita</strong> para mulheres carentes. Você não precisa pagar nada para ter acesso a um advogado.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Como Usar Esta Página
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Clique nos números de telefone para ligar diretamente</li>
                  <li>Acesse os sites para mais informações</li>
                  <li>Envie emails para orientações escritas</li>
                  <li>Muitos serviços funcionam 24 horas (veja marcação "24h")</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Números de Emergência
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Disque 100:</strong> Denúncia de violação de direitos humanos
                  </p>
                  <p className="text-gray-700">
                    <strong>Disque 180:</strong> Atendimento à mulher vítima de violência
                  </p>
                  <p className="text-gray-700">
                    <strong>Disque 191:</strong> Polícia Federal - Denúncias de crimes federais
                  </p>
                  <p className="text-gray-700">
                    <strong>190:</strong> Polícia Militar - Emergências
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-12 rounded-lg bg-gradient-to-r from-[#190E4F] to-[#2A1B5E] p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Você não está sozinha
            </h2>
            <p className="text-gray-100 mb-6 max-w-2xl mx-auto">
              Se você está sofrendo violência ou discriminação, busque ajuda. Existem profissionais preparados para ouvi-la e orientá-la através dos canais disponibilizados nesta página.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/app/complaints/new"
                className="inline-block bg-white text-[#190E4F] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Fazer uma Reclamação
              </a>
              <a
                href="/"
                className="inline-block border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Voltar ao Início
              </a>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
