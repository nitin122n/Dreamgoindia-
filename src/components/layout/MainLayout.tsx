import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { PageTransition } from "@/components/common/PageTransition";
import { LoginPopup } from "@/components/auth/LoginPopup";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <WhatsAppButton />
      <LoginPopup />
    </div>
  );
}
