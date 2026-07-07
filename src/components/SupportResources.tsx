"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  supportResources,
  getResourcesByCategory,
  getCategoryLabel,
  getCategoryColor,
  getAllCategories,
  type ResourceCategory,
} from "@/lib/support-resources";

interface SupportResourcesProps {
  /**
   * If provided, only shows resources from specified category
   */
  category?: ResourceCategory;

  /**
   * If true, shows all resources in a grouped layout
   */
  grouped?: boolean;

  /**
   * Custom title for the component
   */
  title?: string;

  /**
   * Custom description
   */
  description?: string;

  /**
   * If true, shows as minimal/compact version
   */
  compact?: boolean;
}

/**
 * Individual resource card component with full accessibility
 */
function ResourceCard({
  resource,
}: {
  resource: (typeof supportResources)[0];
}) {
  const colors = getCategoryColor(resource.category);

  return (
    <Card
      className={`border-l-4 transition-all hover:shadow-lg ${colors.border}`}
      role="article"
      aria-label={`Recurso: ${resource.name}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">
              {resource.name}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {resource.description}
            </CardDescription>
          </div>
          {resource.available24h && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 whitespace-nowrap"
              aria-label="Disponível 24 horas"
            >
              <Clock className="h-3 w-3" />
              24h
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {resource.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 flex-shrink-0 text-gray-600" aria-hidden="true" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <a
                  href={`tel:${resource.phone.replace(/\D/g, "")}`}
                  className="font-medium text-blue-600 hover:underline break-all"
                  aria-label={`Ligar para ${resource.phone}`}
                >
                  {resource.phone}
                </a>
              </div>
            </div>
          )}

          {resource.whatsapp && (
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true" />
              <a
                href={`https://wa.me/${resource.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-600 hover:underline"
                aria-label={`WhatsApp ${resource.whatsapp}`}
              >
                {resource.whatsapp}
              </a>
            </div>
          )}

          {resource.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 flex-shrink-0 text-gray-600" aria-hidden="true" />
              <a
                href={`mailto:${resource.email}`}
                className="font-medium text-blue-600 hover:underline break-all"
                aria-label={`Email: ${resource.email}`}
              >
                {resource.email}
              </a>
            </div>
          )}

          {resource.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 flex-shrink-0 text-gray-600" aria-hidden="true" />
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline truncate"
                aria-label={`Website: ${resource.website}`}
              >
                Acessar site
                <ExternalLink className="ml-2 h-3 w-3 inline" aria-hidden="true" />
              </a>
            </div>
          )}

          {resource.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 flex-shrink-0 text-gray-600 mt-1" aria-hidden="true" />
              <address className="not-italic text-sm text-gray-700">
                {resource.address}
              </address>
            </div>
          )}
        </div>

        {/* Notes */}
        {resource.notes && (
          <div
            className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 border border-gray-200"
            role="note"
          >
            <strong>Nota:</strong> {resource.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main SupportResources component
 * Displays support resources with full accessibility features
 */
export function SupportResources({
  category,
  grouped = true,
  title = "Recursos de Suporte",
  description,
  compact = false,
}: SupportResourcesProps) {
  const categoriesToShow: ResourceCategory[] = category
    ? [category]
    : getAllCategories();

  const resourcesByCategory = categoriesToShow.map((cat) => ({
    category: cat,
    resources: getResourcesByCategory(cat),
  }));

  // If showing single category
  if (category) {
    const resources = getResourcesByCategory(category);

    return (
      <div className="w-full" role="region" aria-labelledby="support-resources-title">
        <div className="mb-6">
          <h2
            id="support-resources-title"
            className="text-2xl font-bold text-gray-900"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    );
  }

  // If showing grouped by category with tabs
  if (grouped && !compact) {
    return (
      <div className="w-full" role="region" aria-labelledby="support-resources-title">
        <div className="mb-6">
          <h2
            id="support-resources-title"
            className="text-2xl font-bold text-gray-900"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>

        <Tabs
          defaultValue={categoriesToShow[0]}
          className="w-full"
          aria-label="Categorias de recursos de suporte"
        >
          <TabsList
            className="grid w-full gap-2"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
            }}
          >
            {resourcesByCategory.map(({ category: cat, resources }) => (
              <TabsTrigger key={cat} value={cat} aria-label={`${getCategoryLabel(cat)} (${resources.length} recursos)`}>
                <span className="text-sm">{getCategoryLabel(cat)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {resourcesByCategory.map(({ category: cat, resources }) => (
            <TabsContent
              key={cat}
              value={cat}
              className="mt-6 space-y-6"
              role="tabpanel"
              aria-labelledby={`tab-${cat}`}
            >
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Compact view - list format
  return (
    <div className="w-full" role="region" aria-labelledby="support-resources-title">
      <div className="mb-4">
        <h2
          id="support-resources-title"
          className="text-lg font-bold text-gray-900"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>

      <div className="space-y-4">
        {supportResources.map((resource) => {
          const colors = getCategoryColor(resource.category);

          return (
            <div
              key={resource.id}
              className={`rounded-lg border-l-4 p-4 ${colors.bg} ${colors.border}`}
              role="article"
              aria-label={resource.name}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    {resource.description}
                  </p>

                  {/* Compact contact info */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resource.phone && (
                      <a
                        href={`tel:${resource.phone.replace(/\D/g, "")}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                        aria-label={`Ligar: ${resource.phone}`}
                      >
                        <Phone className="h-3 w-3" />
                        {resource.phone}
                      </a>
                    )}
                    {resource.website && (
                      <a
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                        aria-label={`Website: ${resource.website}`}
                      >
                        <Globe className="h-3 w-3" />
                        Site
                      </a>
                    )}
                  </div>
                </div>

                {resource.available24h && (
                  <Badge
                    variant="secondary"
                    className="flex-shrink-0 whitespace-nowrap"
                    aria-label="Disponível 24 horas"
                  >
                    24h
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
