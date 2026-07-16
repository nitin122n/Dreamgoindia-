import { SEO } from "@/components/common/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { usePage } from "@/hooks/useCMS";

export default function TermsPage() {
  const { data: page, isLoading } = usePage("terms");

  return (
    <>
      <SEO
        title={page?.seo_title ?? "Terms & Conditions"}
        description={page?.seo_description ?? "Terms and conditions for Dream Go India."}
      />

      <section className="bg-gradient-to-br from-primary/10 to-orange-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            {page?.title ?? "Terms & Conditions"}
          </h1>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-12">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
          </div>
        ) : (
          <div
            className="prose prose-gray max-w-none leading-relaxed text-gray-600"
            dangerouslySetInnerHTML={{
              __html:
                page?.content ??
                "<p>Terms and conditions content will be available soon. Contact us at hello@dreamgoindia.com for any queries.</p>",
            }}
          />
        )}
        <p className="mt-8 text-xs text-gray-400">
          Last updated: {page?.updated_at ? new Date(page.updated_at).toLocaleDateString() : "July 2026"}
        </p>
      </section>
    </>
  );
}
