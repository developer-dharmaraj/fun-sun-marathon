import { useState } from "react";
import { 
  Footprints, CheckCircle2, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import HeroSection from "./components/HeroSection";
import RegistrationForm from "./components/RegistrationForm";

export default function App() {
  const [successRegId, setSuccessRegId] = useState<string | null>(null);

  const handleRegisterClick = () => {
    const formElement = document.getElementById("form-container");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRegistrationSuccess = (regId: string) => {
    setSuccessRegId(regId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setSuccessRegId(null);
    // Smooth scroll back to form
    setTimeout(() => {
      handleRegisterClick();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-sans" id="app-root">
      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => {
            setSuccessRegId(null);
          }}
          className="flex items-center gap-2 text-orange-600 font-extrabold text-lg select-none cursor-pointer"
        >
          <Footprints className="h-6 w-6" />
          <span>RATLAM RUN</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key="register-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Success Screen */}
            {successRegId ? (
              <div className="mx-auto max-w-xl px-4 py-16 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="rounded-3xl bg-white p-8 shadow-md border border-gray-100 space-y-6"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-gray-900">Registration Submitted!</h2>
                    <p className="text-sm text-gray-500">
                      Thank you for registering for the Ratlam Fun Run 2026. Your payment receipt is being verified by our team.
                    </p>
                  </div>

                  {/* Receipt Badge */}
                  <div className="rounded-2xl bg-orange-50/50 border border-orange-100 p-4 space-y-3 text-left">
                    <p className="text-xs font-semibold text-orange-800 uppercase tracking-wider flex items-center gap-1">
                      <ClipboardList className="h-3.5 w-3.5" /> Entry Registration Ticket
                    </p>
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-gray-700">
                      <div>
                        <p className="text-gray-400">Registration ID:</p>
                        <p className="font-mono font-bold text-gray-900 text-sm select-all">{successRegId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Registration Fee:</p>
                        <p className="font-bold text-gray-900">₹149.00 (Paid)</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Event Start:</p>
                        <p className="font-semibold text-gray-900">Oct 18, 2026 (6:00 AM)</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Venue Location:</p>
                        <p className="font-semibold text-gray-900">Nehru Stadium, Ratlam</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Guidance alert */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left text-xs text-gray-600 leading-relaxed">
                    <p className="font-semibold text-gray-800 mb-1">What happens next?</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-500">
                      <li>We will verify your uploaded UPI payment screenshot.</li>
                      <li>Your registration data is saved in real-time in the official Google Sheet database.</li>
                      <li>You will receive your physical running Bib and T-shirt at Nehru Stadium entry desk on Oct 17.</li>
                    </ol>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-grow inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 text-sm transition cursor-pointer"
                    >
                      Register Another Person
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <>
                {/* Hero Header */}
                <HeroSection onRegisterClick={handleRegisterClick} />

                {/* Form Container */}
                <div className="bg-slate-100 py-6">
                  <RegistrationForm onSuccess={handleRegistrationSuccess} />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 text-center text-xs text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p>© 2026 Ratlam Fun Run. Built for Karmyug Techzone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

