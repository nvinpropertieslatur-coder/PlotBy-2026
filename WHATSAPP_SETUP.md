# Plotby Meta WhatsApp Cloud API Setup Guide

This guide walks you through configuring the official Meta WhatsApp Business Platform (WhatsApp Cloud API) for Plotby's OTP authentication.

---

## 1. Create a Meta Developer Account
1. Visit the [Meta for Developers Portal](https://developers.facebook.com/).
2. Log in with your Facebook account (preferably associated with your business).
3. Complete registration as a Meta Developer if you haven't already.

## 2. Create a Meta Application
1. Click **My Apps** in the top right corner.
2. Click **Create App**.
3. Select **Other** as the use case and click **Next**.
4. Choose **Business** as the app type and click **Next**.
5. Fill in:
   - **App Name**: `Plotby`
   - **App Contact Email**: Your official business email.
   - **Business Account**: Select your Meta Business Account (or create one).
6. Click **Create App**.

## 3. Add WhatsApp Cloud API to the App
1. On the App Dashboard, scroll to **Add products to your app**.
2. Find **WhatsApp** and click **Set up**.
3. You will be redirected to the **WhatsApp > API Setup** screen.

## 4. Obtain Phone Number ID & Business Account ID
On the **WhatsApp > API Setup** page:
- **Phone number ID**: A 15-digit number (e.g., `105938472918234`). Copy this to `WHATSAPP_PHONE_NUMBER_ID`.
- **WhatsApp Business Account ID**: A 15-digit number (e.g., `108472910384712`). Copy this to `WHATSAPP_BUSINESS_ACCOUNT_ID`.

## 5. Generate an Access Token
- **Temporary Access Token (24 Hours)**:
  - On the **API Setup** page, copy the **Temporary access token** for initial testing.
- **Permanent Access Token (Production)**:
  1. Open [Meta Business Suite](https://business.facebook.com/settings).
  2. Go to **Settings > System Users**.
  3. Click **Add**, name the system user `plotby-whatsapp-bot`, and assign the **Admin** role.
  4. Click **Assign Assets** and add your Plotby App with full control.
  5. Click **Generate New Token**, select the Plotby app, and check the permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
  6. Copy the generated permanent token and save it to `WHATSAPP_ACCESS_TOKEN`.

## 6. Create an Authentication Message Template
1. In the WhatsApp Manager, navigate to **Account Tools > Message Templates**.
2. Click **Create Template**.
3. Configure the template:
   - **Category**: `Authentication`
   - **Name**: `plotby_auth_otp`
   - **Language**: `English (US)` (`en_US`)
4. In the **Content** section:
   - Choose **Code expiration** (e.g., 5 minutes).
   - The body text will be pre-formatted by Meta:
     ```
     {{1}} is your Plotby verification code. For your security, do not share this code.
     ```
   - In **Buttons**, select **Copy code** button.
5. Click **Submit** for review. Meta's automated authentication template approvals typically complete within a few minutes.

## 7. Configure Environment Variables
In your backend `.env` file (never prefix backend secrets with `EXPO_PUBLIC_`):

```bash
# Meta WhatsApp Cloud API credentials
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_API_VERSION=v21.0
WHATSAPP_TEMPLATE_NAME=plotby_auth_otp
WHATSAPP_TEMPLATE_LANG=en_US

# Backend & Supabase
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret

# Frontend (Expo Go)
EXPO_PUBLIC_BACKEND_URL=http://<YOUR_LOCAL_IP>:3001
```

## 8. Test Using Meta's Test Phone Number
1. On the **WhatsApp > API Setup** page in the Meta Developer Console:
2. Look at **Step 1: Select phone numbers**:
   - Meta assigns a default sandbox "From" test number.
3. In **Step 2: Send and receive messages**:
   - Under **To**, select **Manage phone number list**.
   - Add your personal WhatsApp phone number (with country code, e.g., +91 9876543210).
   - Enter the verification code sent to your WhatsApp by Meta.
4. Start the Plotby backend:
   ```bash
   npm run server
   ```
5. In the Plotby app, enter that test phone number and tap **Continue with WhatsApp**.
6. Check your WhatsApp for the 6-digit OTP and enter it on the Plotby verification screen.

## 9. Connect Your Real Business Phone Number (Go Live)
1. In Meta Developer Console, navigate to **WhatsApp > API Setup**.
2. Scroll to the bottom and click **Add Phone Number** under Step 5.
3. Provide your official Plotby business display name, category, and website.
4. Enter your real SIM / VoIP phone number (must not be currently registered on regular WhatsApp or WhatsApp Business mobile app).
5. Verify the number via SMS or Voice Call.
6. Once registered, replace `WHATSAPP_PHONE_NUMBER_ID` in your backend `.env` with the new production Phone Number ID.

---

## Architecture & Security Overview
- **Zero Frontend Secret Exposure**: All Meta API tokens and Supabase service role keys reside strictly on the backend.
- **Cryptographic OTP Hashing**: OTPs are generated with `crypto.randomInt` and stored using HMAC-SHA256 with salt. Plaintext OTPs are never stored or logged in production.
- **Rate Limiting & Expiry**: 30-second resend cooldown, 5-minute expiry, and maximum 5 verification attempts.
- **Replay Protection**: The OTP record is deleted immediately upon successful verification.
