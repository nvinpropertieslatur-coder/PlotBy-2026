import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

/**
 * Returns the centralized backend API base URL
 */
export function getBackendBaseUrl(): string {
  return API_BASE_URL;
}

export type SendWhatsAppOtpResult = {
  success: boolean;
  message?: string;
  cooldownSeconds?: number;
  expiresAt?: number;
  devNotice?: string;
  error?: string;
  code?: string;
};

export type VerifyWhatsAppOtpResult = {
  success: boolean;
  message?: string;
  user?: any;
  session?: any;
  isNewUser?: boolean;
  attemptsRemaining?: number;
  error?: string;
  code?: string;
  notice?: string;
};

/**
 * Requests a 4-digit WhatsApp OTP from the Plotby backend
 */
export async function sendWhatsAppOtp(phone: string): Promise<SendWhatsAppOtpResult> {
  const requestUrl = API_ENDPOINTS.WHATSAPP_SEND_OTP;
  console.log('[WhatsApp OTP] FINAL REQUEST URL:', requestUrl);

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Failed to send OTP via WhatsApp.',
        code: data.code,
        cooldownSeconds: data.secondsRemaining,
      };
    }

    return {
      success: true,
      message: data.message || 'OTP sent to your WhatsApp number.',
      cooldownSeconds: data.cooldownSeconds || 30,
      expiresAt: data.expiresAt,
      devNotice: data.devNotice,
    };
  } catch (err: any) {
    console.error('[sendWhatsAppOtp] Network error:', err.message);
    return {
      success: false,
      error: `Could not connect to WhatsApp auth server (${API_BASE_URL}). Ensure 'npm run server' is running on your computer and your phone is on Wi-Fi (192.168.29.205:3001).`,
      code: 'NETWORK_ERROR',
    };
  }
}

/**
 * Verifies the 4-digit WhatsApp OTP with the Plotby backend
 */
export async function verifyWhatsAppOtp(phone: string, otp: string): Promise<VerifyWhatsAppOtpResult> {
  const requestUrl = API_ENDPOINTS.WHATSAPP_VERIFY_OTP;
  console.log('[WhatsApp OTP] FINAL REQUEST URL:', requestUrl);

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Invalid OTP.',
        code: data.code,
        attemptsRemaining: data.attemptsRemaining,
      };
    }

    return {
      success: true,
      message: data.message || 'OTP verified successfully.',
      user: data.user,
      session: data.session,
      isNewUser: data.isNewUser,
      notice: data.notice,
    };
  } catch (err: any) {
    console.error('[verifyWhatsAppOtp] Network error:', err.message);
    return {
      success: false,
      error: `Could not connect to WhatsApp auth server (${API_BASE_URL}). Ensure 'npm run server' is running on your computer and your phone is on Wi-Fi (192.168.29.205:3001).`,
      code: 'NETWORK_ERROR',
    };
  }
}
