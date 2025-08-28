import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { AnalyticsInitializer } from "@/components/analytics-initializer";
import { ConsentBanner } from "@/components/consent-banner";
import { Navigation } from "@/components/navigation";
import { ToastProvider } from "@/components/toast";
import { ErrorBoundary } from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "Analytics Learning App",
  description: "Learn product analytics, feedback collection, and A/B testing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AnalyticsInitializer />
        <PostHogProvider>
          <ToastProvider>
            <ErrorBoundary>
              <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
                Skip to main content
              </a>
              <Navigation />
              <main id="main-content">
                {children}
              </main>
              <ConsentBanner />
            </ErrorBoundary>
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}