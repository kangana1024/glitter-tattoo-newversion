import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

interface ContactPreviewProps {
  heading: string;
  companyName: string;
  address: string;
  phones: string[];
  email: string;
  ctaText: string;
  ctaHref: string;
}

export default function ContactPreview({
  heading,
  companyName,
  address,
  phones,
  email,
  ctaText,
  ctaHref,
}: ContactPreviewProps) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent-blue/10 to-secondary/10"></div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl -ml-20 -mb-20 animate-float"></div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl rounded-3xl p-10 sm:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 dark:border-white/10">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent mb-8">
            {heading}
          </h2>
          <div className="space-y-4 mb-10">
            <p className="font-heading text-lg font-semibold text-text-primary">
              {companyName}
            </p>
            <p className="font-body text-text-secondary leading-relaxed">
              {address}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {phones.map((phone, i) => (
                <a
                  key={i}
                  href={`tel:${phone.replace(/[^+0-9]/g, "")}`}
                  className="inline-flex items-center gap-2 font-body text-primary hover:text-primary/80 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                  {phone}
                </a>
              ))}
            </div>
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 font-body text-primary hover:text-primary/80 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              {email}
            </a>
          </div>
          <Button href={ctaHref} variant="primary" size="lg">
            {ctaText}
          </Button>
        </div>
      </Container>
    </section>
  );
}
