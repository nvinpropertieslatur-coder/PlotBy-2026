/**
 * Centralized API configuration for Plotby.
 *
 * For physical Android devices running Expo Go over Wi-Fi, the backend URL
 * points to the computer's Wi-Fi IPv4 address (http://192.168.29.205:3001).
 *
 * In production or custom environments, configure EXPO_PUBLIC_API_URL in .env.
 */

const DEFAULT_API_URL = 'http://192.168.29.205:3001';

export const API_BASE_URL: string = (
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  DEFAULT_API_URL
).trim().replace(/\/+$/, '');

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  WHATSAPP_SEND_OTP: `${API_BASE_URL}/api/auth/whatsapp/send-otp`,
  WHATSAPP_VERIFY_OTP: `${API_BASE_URL}/api/auth/whatsapp/verify-otp`,
} as const;
