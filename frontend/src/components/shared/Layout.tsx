import { Navigation, Footer } from "@/components/shared";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navigation />
=      {children}

      <Footer />
    </div>
  );
};