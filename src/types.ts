export interface Registration {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  age: number;
  gender: string;
  emergencyNumber: string;
  screenshot: string; // Base64 data URL of the payment screenshot
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface AppConfig {
  googleSheetUrl: string;
  adminPasscode: string;
}
