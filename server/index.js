// @ts-nocheck
const fs = require('fs');
const path = require('path');

// Auto-load .env file if present
const envFilePath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envFilePath)) {
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const http = require('http');
const { parse } = require('url');
const { generateOtp, checkRateLimit, saveOtp, verifyOtp, normalizePhone } = require('./otpStore');
const whatsappService = require('./whatsappService');
const supabaseAuthService = require('./supabaseAuthService');

const PORT = parseInt(process.env.PORT, 10) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Helper to parse JSON request bodies
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Helper to send JSON responses
 */
function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

/**
 * Main request router
 */
async function handleRequest(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;

  try {
    // ===================================================
    // GET /api/health
    // ===================================================
    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        service: 'plotby-whatsapp-auth',
        metaConfigured: whatsappService.isConfigured(),
        supabaseConfigured: Boolean(supabaseAuthService.adminClient),
        timestamp: new Date().toISOString(),
      });
    }

    // ===================================================
    // POST /api/auth/whatsapp/send-otp
    // ===================================================
    if (req.method === 'POST' && pathname === '/api/auth/whatsapp/send-otp') {
      const body = await parseJsonBody(req);
      const { phone } = body;

      if (!phone || typeof phone !== 'string') {
        return sendJson(res, 400, {
          success: false,
          error: 'Phone number is required.',
        });
      }

      const digits = normalizePhone(phone);
      if (digits.length < 10 || digits.length > 15) {
        return sendJson(res, 400, {
          success: false,
          error: 'Please enter a valid mobile number with country code (e.g. +91 9876543210).',
        });
      }

      // 1. Rate limiting check
      const rateLimit = checkRateLimit(digits);
      if (!rateLimit.allowed) {
        return sendJson(res, 429, {
          success: false,
          code: rateLimit.code,
          error: rateLimit.message,
          secondsRemaining: rateLimit.secondsRemaining,
        });
      }

      // 2. Generate secure 4-digit OTP
      const otp = generateOtp();

      // 3. Save hashed OTP (never store plaintext OTP)
      const saveResult = saveOtp(digits, otp);

      // 4. Send via Meta WhatsApp Cloud API
      try {
        const sendResult = await whatsappService.sendOtp(phone, otp);

        const responsePayload = {
          success: true,
          message: 'OTP sent successfully to your WhatsApp number.',
          cooldownSeconds: saveResult.cooldownSeconds,
          expiresAt: saveResult.expiresAt,
        };

        if (sendResult.devMock) {
          responsePayload.devNotice = sendResult.message;
        }

        return sendJson(res, 200, responsePayload);
      } catch (sendError) {
        console.error('[send-otp] Delivery error:', sendError.message);
        return sendJson(res, 502, {
          success: false,
          error: sendError.message || 'Failed to deliver OTP to WhatsApp.',
        });
      }
    }

    // ===================================================
    // POST /api/auth/whatsapp/verify-otp
    // ===================================================
    if (req.method === 'POST' && pathname === '/api/auth/whatsapp/verify-otp') {
      const body = await parseJsonBody(req);
      const { phone, otp } = body;

      if (!phone || !otp) {
        return sendJson(res, 400, {
          success: false,
          error: 'Both phone number and OTP are required.',
        });
      }

      const digits = normalizePhone(phone);
      const cleanedOtp = String(otp).trim();

      if (!/^\d{4}$/.test(cleanedOtp)) {
        return sendJson(res, 400, {
          success: false,
          error: 'OTP must be a 4-digit numeric code.',
        });
      }

      // 1. Verify OTP against stored hash (checks expiry, attempts, invalidates upon success)
      const verification = verifyOtp(digits, cleanedOtp);

      if (!verification.success) {
        return sendJson(res, 400, {
          success: false,
          code: verification.code,
          error: verification.message,
          attemptsRemaining: verification.attemptsRemaining,
        });
      }

      // 2. Authenticate or create user in Supabase
      try {
        const authResult = await supabaseAuthService.authenticateUserByPhone(phone);

        return sendJson(res, 200, {
          success: true,
          message: 'Verification successful.',
          user: authResult.user,
          session: authResult.session,
          isNewUser: authResult.isNewUser,
          notice: authResult.notice,
        });
      } catch (authError) {
        console.error('[verify-otp] Supabase auth error:', authError.message);
        return sendJson(res, 500, {
          success: false,
          error: 'OTP verified, but authentication session could not be established. Please try again.',
        });
      }
    }

    // 404 for unknown endpoints
    return sendJson(res, 404, {
      success: false,
      error: 'Not Found',
    });
  } catch (err) {
    console.error('[server error]', err);
    return sendJson(res, 500, {
      success: false,
      error: 'Internal server error',
    });
  }
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Plotby WhatsApp Auth Server listening on http://${HOST}:${PORT}`);
    console.log(`- Health check (Local): http://localhost:${PORT}/api/health`);
    console.log(`- Health check (Wi-Fi LAN / Phone): http://192.168.29.205:${PORT}/api/health`);
    console.log(`- Meta WhatsApp configured: ${whatsappService.isConfigured() ? 'YES' : 'NO (Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env)'}`);
  });
}

module.exports = {
  server,
  handleRequest,
};
