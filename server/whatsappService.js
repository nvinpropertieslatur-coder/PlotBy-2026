// @ts-nocheck
const axios = require('axios');
const { normalizePhone } = require('./otpStore');

/**
 * Meta WhatsApp Cloud API Service
 */
class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'plotby_auth_otp';
    this.templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US';
  }

  /**
   * Refreshes credentials from environment variables
   */
  reloadConfig() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'plotby_auth_otp';
    this.templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US';
  }

  /**
   * Checks if required Meta credentials are present and not placeholder values
   */
  isConfigured() {
    this.reloadConfig();
    const tokenValid = Boolean(
      this.accessToken &&
      !this.accessToken.includes('your_') &&
      this.accessToken !== 'placeholder' &&
      this.accessToken.length > 20
    );
    const phoneValid = Boolean(
      this.phoneNumberId &&
      !this.phoneNumberId.includes('your_') &&
      /^\d+$/.test(this.phoneNumberId)
    );
    return tokenValid && phoneValid;
  }

  /**
   * Formats phone number for Meta WhatsApp Cloud API (E.164 digits without +)
   */
  formatRecipient(phone) {
    const digits = normalizePhone(phone);
    if (!digits || digits.length < 10 || digits.length > 15) {
      throw new Error(`Invalid phone number: ${phone}. Must be a valid mobile number with country code.`);
    }
    return digits;
  }

  /**
   * Sends OTP via official Meta WhatsApp Cloud API
   * @param {string} phone - Recipient phone number (e.g. +919876543210 or 919876543210)
   * @param {string} otp - 4-digit OTP code
   */
  async sendOtp(phone, otp) {
    this.reloadConfig();
    const recipient = this.formatRecipient(phone);

    if (!this.isConfigured()) {
      const msg = 'Meta WhatsApp Cloud API credentials are not configured on the backend. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in your environment.';
      console.warn(`[WhatsAppService] ${msg}`);
      
      // In development / testing environment without Meta credentials:
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[WhatsAppService DEV MOCK] Sent OTP ${otp} to WhatsApp number +${recipient}`);
        return {
          success: true,
          devMock: true,
          message: 'Development mode: Meta credentials missing, OTP generated and logged to server console.',
          recipient,
        };
      }

      throw new Error(msg);
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    // 1. Try standard Meta Authentication Template with copy-code button
    const authTemplatePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: this.templateName,
        language: {
          code: this.templateLang,
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
        ],
      },
    };

    try {
      const response = await axios.post(url, authTemplatePayload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return {
        success: true,
        messageId: response.data?.messages?.[0]?.id,
        recipient,
      };
    } catch (primaryError) {
      const errorData = primaryError.response?.data?.error;
      console.warn('[WhatsAppService] Primary template send failed, checking fallback:', errorData?.message || primaryError.message);

      // 2. If failure is due to component structure (e.g. template without url button), retry with body-only component
      if (errorData && (errorData.code === 100 || errorData.code === 132000)) {
        try {
          const bodyOnlyPayload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'template',
            template: {
              name: this.templateName,
              language: {
                code: this.templateLang,
              },
              components: [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: otp,
                    },
                  ],
                },
              ],
            },
          };

          const fallbackResponse = await axios.post(url, bodyOnlyPayload, {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          });

          return {
            success: true,
            messageId: fallbackResponse.data?.messages?.[0]?.id,
            recipient,
          };
        } catch (fallbackError) {
          this.handleMetaApiError(fallbackError, recipient);
        }
      }

      this.handleMetaApiError(primaryError, recipient);
    }
  }

  /**
   * Formats Meta API errors into clean, informative messages
   */
  handleMetaApiError(error, recipient) {
    if (error.response?.data?.error) {
      const meta = error.response.data.error;
      const userMsg = meta.error_user_msg || meta.message || 'WhatsApp Cloud API request failed';
      console.error('[WhatsAppService] Meta API Error:', {
        code: meta.code,
        subcode: meta.error_subcode,
        message: meta.message,
        recipient,
      });

      if (meta.code === 190) {
        throw new Error('Meta WhatsApp access token has expired or is invalid. Please refresh WHATSAPP_ACCESS_TOKEN.');
      }
      if (meta.code === 131030) {
        throw new Error(`The phone number +${recipient} is not in your Meta WhatsApp test recipient list. Add it in Meta App Dashboard > WhatsApp > API Setup.`);
      }
      if (meta.code === 132000 || meta.code === 132001) {
        throw new Error(`WhatsApp template '${this.templateName}' (${this.templateLang}) not found or not approved in your Meta Business Account.`);
      }

      throw new Error(`WhatsApp API Error: ${userMsg} (Code ${meta.code})`);
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Connection to Meta WhatsApp Cloud API timed out. Please check your network and try again.');
    }

    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}

module.exports = new WhatsAppService();
