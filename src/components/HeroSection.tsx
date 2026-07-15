import { Calendar, MapPin, Trophy, Sparkles, Footprints, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onRegisterClick: () => void;
}

export default function HeroSection({ onRegisterClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 py-16 px-4 md:py-24 md:px-8 border-b border-orange-100">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-5xl text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold text-orange-700 md:text-sm"
        >
          <Sparkles className="h-4 w-4 text-orange-600" />
          Ratlam's Biggest Athletic Celebration
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
        >
          Ratlam <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Fun Run</span> 2026
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base text-gray-600 md:text-lg leading-relaxed"
        >
          Tie your shoelaces, bring your high energy, and run together with your family and friends. 
          Celebrate health, fitness, and unity in the heart of Ratlam!
        </motion.p>

        {/* Quick Info Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-orange-50">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Date & Time</p>
              <p className="text-sm font-semibold text-gray-800">Sunday, Oct 18, 6:00 AM</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-orange-50">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Start Line</p>
              <p className="text-sm font-semibold text-gray-800">Nehru Stadium, Ratlam</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-orange-50">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Registration Fee</p>
              <p className="text-sm font-bold text-orange-600">₹149 Only</p>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10"
        >
          <button
            onClick={onRegisterClick}
            id="btn-register-hero"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-4 text-base font-bold text-white shadow-md hover:bg-orange-700 active:bg-orange-800 transition duration-150 cursor-pointer"
          >
            <Footprints className="h-5 w-5" />
            Register & Pay Now
          </button>
          <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 inline" /> Secured Payment Verification via UPI QR Code
          </p>
        </motion.div>
      </div>
    </section>
  );
}
