// @ts-nocheck
const crypto = require('crypto');

// Server secret salt for HMAC hashing of OTPs (never store plaintext OTPs)
const HMAC_SECRET = process.env.OTP_HMAC_SECRET || crypto.randomBytes(32).toString('hex');
const OTP_EXPIRY_MS = (parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5) * 60 * 1000;
const RESEND_COOLDOWN_MS = (parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 30) * 1000;
const MAX_VERIFY_ATTEMPTS = parseInt(process.env.MAX_VERIFY_ATTEMPTS, 10) || 5;
const MAX_HOURLY_REQUESTS = 6;

// In-memory OTP store: phone -> { hash, expiresAt, attempts, lastSentAt, hourlyRequests }
const store = new Map();

/**
 * Normalizes phone number to digits only (E.164 without leading +)
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Generates a cryptographically secure random 4-digit OTP
 */
function generateOtp() {
  return crypto.randomInt(1000, 10000).toString();
}

/**
 * Computes HMAC-SHA256 hash of OTP for a given phone
 */
function hashOtp(phone, otp) {
  const normalized = normalizePhone(phone);
  return crypto.createHmac('sha256', HMAC_SECRET).update(`${normalized}:${otp.trim()}`).digest('hex');
}

/**
 * Checks if a phone can be sent a new OTP (rate limiting)
 */
function checkRateLimit(phone) {
  const normalized = normalizePhone(phone);
  const now = Date.now();
  const existing = store.get(normalized);

  if (!existing) {
    return { allowed: true };
  }

  // 1. Resend cooldown check
  if (now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const secondsRemaining = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    return {
      allowed: false,
      code: 'COOLDOWN_ACTIVE',
      secondsRemaining,
      message: `Please wait ${secondsRemaining} second${secondsRemaining > 1 ? 's' : ''} before requesting another OTP.`,
    };
  }

  // 2. Hourly rate limit check
  const oneHourAgo = now - 60 * 60 * 1000;
  const recentRequests = (existing.hourlyRequests || []).filter(ts => ts > oneHourAgo);
  if (recentRequests.length >= MAX_HOURLY_REQUESTS) {
    return {
      allowed: false,
      code: 'HOURLY_LIMIT_EXCEEDED',
      message: 'Too many OTP requests for this number. Please try again after an hour.',
    };
  }

  return { allowed: true };
}

/**
 * Stores a securely hashed OTP for the given phone with 5-minute expiry
 */
function saveOtp(phone, otp) {
  const normalized = normalizePhone(phone);
  const now = Date.now();
  const hash = hashOtp(normalized, otp);
  const existing = store.get(normalized);

  const oneHourAgo = now - 60 * 60 * 1000;
  const recentRequests = (existing?.hourlyRequests || []).filter(ts => ts > oneHourAgo);
  recentRequests.push(now);

  store.set(normalized, {
    hash,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    lastSentAt: now,
    hourlyRequests: recentRequests,
  });

  return {
    expiresAt: now + OTP_EXPIRY_MS,
    cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
  };
}

/**
 * Verifies the entered OTP against the stored hash
 */
function verifyOtp(phone, enteredOtp) {
  const normalized = normalizePhone(phone);
  const now = Date.now();
  const record = store.get(normalized);

  if (!record) {
    return {
      success: false,
      code: 'NO_OTP_FOUND',
      message: 'No OTP found for this number. Please request an OTP first.',
    };
  }

  // Check expiration (5 minutes)
  if (now > record.expiresAt) {
    store.delete(normalized);
    return {
      success: false,
      code: 'OTP_EXPIRED',
      message: 'This OTP has expired. Please request a new one.',
    };
  }

  // Check max attempts
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    store.delete(normalized);
    return {
      success: false,
      code: 'MAX_ATTEMPTS_EXCEEDED',
      message: 'Maximum verification attempts exceeded. Please request a new OTP.',
    };
  }

  record.attempts += 1;

  // Constant-time comparison
  const expectedHash = record.hash;
  const actualHash = hashOtp(normalized, enteredOtp);

  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const actualBuffer = Buffer.from(actualHash, 'hex');

  let isValid = false;
  if (expectedBuffer.length === actualBuffer.length) {
    isValid = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  }

  if (!isValid) {
    const attemptsRemaining = MAX_VERIFY_ATTEMPTS - record.attempts;
    if (attemptsRemaining <= 0) {
      store.delete(normalized);
      return {
        success: false,
        code: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      };
    }
    return {
      success: false,
      code: 'INVALID_OTP',
      attemptsRemaining,
      message: `Incorrect OTP. You have ${attemptsRemaining} attempt${attemptsRemaining > 1 ? 's' : ''} left.`,
    };
  }

  // Verification succeeded -> Invalidate OTP immediately to prevent reuse
  store.delete(normalized);

  return {
    success: true,
    message: 'OTP verified successfully.',
  };
}

/**
 * Clears expired records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of store.entries()) {
    if (now > record.expiresAt && (!record.hourlyRequests || record.hourlyRequests.length === 0)) {
      store.delete(phone);
    }
  }
}, 60 * 1000).unref();

module.exports = {
  generateOtp,
  hashOtp,
  checkRateLimit,
  saveOtp,
  verifyOtp,
  normalizePhone,
  _store: store, // exported for unit testing
};
