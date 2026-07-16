import React, { useState, useRef } from "react";
import {
  User, Mail, Phone, Calendar as CalendarIcon,
  Users, Upload, CheckCircle, AlertCircle,
  QrCode, ExternalLink, ArrowRight, ArrowLeft,
  Smartphone, FileImage
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
const qrCodeImage = "/payment_qr_code.jpeg";

interface RegistrationFormProps {
  onSuccess: (regId: string) => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  // Step state: 1 = Registration Details, 2 = Payment & Screenshot Upload
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    age: "",
    gender: "",
    emergencyNumber: "",
  });

  // File Upload State
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // Validation, Loading & Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image compressor and converter
  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Please upload an image file (PNG, JPG, or JPEG)"));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Downscale to maximum 700px width/height to keep size small
          const MAX_WIDTH = 700;
          const MAX_HEIGHT = 700;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress quality to 70% JPEG
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Failed to load image file"));
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
    });
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address format";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = "Must be a 10-digit mobile number";
    }

    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    } else {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 99) {
        newErrors.age = "Age must be between 5 and 99";
      }
    }

    if (!formData.gender) newErrors.gender = "Please select your gender";

    if (!formData.emergencyNumber.trim()) {
      newErrors.emergencyNumber = "Emergency contact number is required";
    } else if (!/^[0-9]{10}$/.test(formData.emergencyNumber.trim())) {
      newErrors.emergencyNumber = "Must be a 10-digit emergency mobile number";
    } else if (formData.contactNumber.trim() === formData.emergencyNumber.trim()) {
      newErrors.emergencyNumber = "Emergency number should be different from your main contact";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const processFile = async (file: File) => {
    try {
      setApiError(null);
      const compressedBase64 = await compressAndConvertToBase64(file);
      setScreenshot(compressedBase64);
      setScreenshotName(file.name);
    } catch (err: any) {
      setApiError(err.message || "Failed to process image");
      setScreenshot(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  // RegistrationForm.tsx mein ye update karein:
  const handleSubmit = async () => {
    if (!screenshot) {
      setApiError("Please upload the transaction screenshot");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Apne Google Apps Script ka URL yahan rakhein
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPj_CGYGzPZPG3AYtFGJas5qb2UWgl5kVxrl7G5W1NIJw3xBXk06K2HkakpomYfsYPtw/exec";

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        // Mode 'no-cors' use karna pad sakta hai agar CORS error aaye
        mode: 'no-cors',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          screenshot,
        }),
      });

      // Note: no-cors mode mein response read nahi ho sakta, 
      // isliye hum direct success maan lenge
      onSuccess("Registration Successful");
    } catch (err) {
      console.error("Submission failed:", err);
      setApiError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPI deep link details for direct mobile payment
  const upiId = "9691972515@upi"; // Default standard merchant or contact upi id
  const upiUrl = `upi://pay?pa=${upiId}&pn=Ratlam%20Fun%20Run&am=149&cu=INR&tn=FunRun%20Registration`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" id="form-container">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${step === 1 ? "bg-orange-600 text-white" : "bg-green-100 text-green-700"}`}>
            {step === 1 ? "1" : <CheckCircle className="h-5 w-5 text-green-600" />}
          </div>
          <span className={`text-sm font-semibold ${step === 1 ? "text-orange-600" : "text-gray-500"}`}>Participant Details</span>
        </div>
        <div className="h-0.5 flex-1 mx-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${step === 2 ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-400"}`}>
            2
          </div>
          <span className={`text-sm font-semibold ${step === 2 ? "text-orange-600" : "text-gray-400"}`}>Payment (₹199)</span>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-md border border-gray-100 md:p-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleNextStep}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Registration Form</h2>
                <p className="text-sm text-gray-500 mt-1">Please enter correct details for your Fun Run entry certificate.</p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="name">
                  <User className="h-4 w-4 text-orange-600" /> Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your complete name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition ${errors.name ? "border-red-400 bg-red-50/10 focus:ring-red-100" : "border-gray-300 focus:border-orange-500"}`}
                />
                {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.name}</p>}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="email">
                  <Mail className="h-4 w-4 text-orange-600" /> Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition ${errors.email ? "border-red-400 bg-red-50/10 focus:ring-red-100" : "border-gray-300 focus:border-orange-500"}`}
                />
                {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Contact Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="contactNumber">
                    <Phone className="h-4 w-4 text-orange-600" /> Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition ${errors.contactNumber ? "border-red-400 bg-red-50/10 focus:ring-red-100" : "border-gray-300 focus:border-orange-500"}`}
                  />
                  {errors.contactNumber && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.contactNumber}</p>}
                </div>

                {/* Emergency Contact Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="emergencyNumber">
                    <Phone className="h-4 w-4 text-orange-600 text-red-500" /> Emergency Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="emergencyNumber"
                    name="emergencyNumber"
                    maxLength={10}
                    placeholder="Guardian or family mobile"
                    value={formData.emergencyNumber}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition ${errors.emergencyNumber ? "border-red-400 bg-red-50/10 focus:ring-red-100" : "border-gray-300 focus:border-orange-500"}`}
                  />
                  {errors.emergencyNumber && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.emergencyNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="age">
                    <CalendarIcon className="h-4 w-4 text-orange-600" /> Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min={5}
                    max={120}
                    placeholder="E.g. 25"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition ${errors.age ? "border-red-400 bg-red-50/10 focus:ring-red-100" : "border-gray-300 focus:border-orange-500"}`}
                  />
                  {errors.age && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.age}</p>}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5" htmlFor="gender">
                    <Users className="h-4 w-4 text-orange-600" /> Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition ${errors.gender ? "border-red-400 bg-red-50/10 focus:ring-red-100" : "border-gray-300 focus:border-orange-500"}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.gender}</p>}
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4">
                <button
                  type="submit"
                  id="btn-next-step"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-orange-700 active:bg-orange-800 transition cursor-pointer"
                >
                  Proceed to Payment (₹199)
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Pay & Upload Screenshot</h2>
                <p className="text-sm text-gray-500 mt-1">Scan the QR code to pay ₹199, then upload your transaction receipt/screenshot.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Presentation */}
                <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="relative group bg-white p-3 rounded-xl shadow-xs border border-orange-100">
                    <img
                      src={qrCodeImage}
                      alt="Payment UPI QR Code"
                      className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/5 rounded-lg pointer-events-none group-hover:bg-transparent transition" />
                  </div>

                  {/* UPI Details */}
                  <div className="text-center mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Official UPI Address</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{upiId}</p>
                    <p className="text-xs text-orange-600 font-bold mt-1">Fee: ₹199.00</p>
                  </div>

                  {/* Direct payment link for mobile users */}
                  <a
                    href={upiUrl}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 text-xs font-bold shadow-sm transition md:hidden"
                  >
                    <Smartphone className="h-4 w-4" />
                    Pay via UPI App (GPay/PhonePe)
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Upload & Instructions */}
                <div className="space-y-4">
                  {/* Simple steps */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex gap-2 items-start">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">1</span>
                      <p>Open GPay, PhonePe, Paytm, or any UPI app.</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">2</span>
                      <p>Scan this QR code and complete your ₹199 payment.</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">3</span>
                      <p>Take a screenshot showing the transaction ID and amount.</p>
                    </div>
                  </div>

                  {/* Drag and Drop Screenshot Uploader */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-orange-600" /> Transaction Screenshot <span className="text-red-500">*</span>
                    </label>

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerFileSelect}
                      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${isDragging
                        ? "border-orange-500 bg-orange-50/30"
                        : screenshot
                          ? "border-green-400 bg-green-50/10"
                          : "border-gray-300 hover:border-orange-400 hover:bg-gray-50/40"
                        }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {screenshot ? (
                        <div className="space-y-2">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <FileImage className="h-6 w-6" />
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-green-700">Receipt uploaded!</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px] mx-auto mt-0.5">{screenshotName || "screenshot.jpg"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setScreenshot(null);
                              setScreenshotName("");
                            }}
                            className="text-xs font-semibold text-red-600 hover:underline hover:text-red-700"
                          >
                            Change Screenshot
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                            <Upload className="h-5 w-5" />
                          </div>
                          <div className="text-xs text-gray-500">
                            <p className="font-semibold text-gray-700 text-sm">Drag & drop your screenshot</p>
                            <p className="mt-1">or <span className="text-orange-600 font-semibold hover:underline">browse files</span></p>
                            <p className="text-[10px] text-gray-400 mt-2">Supports PNG, JPG, JPEG formats</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Errors Display */}
              {apiError && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-red-700 text-sm flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <p className="font-semibold">Submission Issue</p>
                    <p className="text-xs mt-0.5">{apiError}</p>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  id="btn-prev-step"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  id="btn-submit-registration"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-orange-700 active:bg-orange-800 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting Registration...
                    </>
                  ) : (
                    <>
                      Submit Registration
                      <CheckCircle className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
