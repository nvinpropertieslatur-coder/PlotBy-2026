const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { generateOtp, hashOtp, saveOtp, verifyOtp, normalizePhone, checkRateLimit, _store } = require('../server/otpStore');
const whatsappService = require('../server/whatsappService');
const supabaseAuthService = require('../server/supabaseAuthService');
const { handleRequest } = require('../server/index');

test('WhatsApp Auth: phone normalization handles formats with spaces, hyphens and +', () => {
  assert.equal(normalizePhone('+91 98765-43210'), '919876543210');
  assert.equal(normalizePhone('+1 (555) 123-4567'), '15551234567');
  assert.equal(normalizePhone('09876543210'), '09876543210');
  assert.equal(normalizePhone(''), '');
  assert.equal(normalizePhone(null), '');
});

test('WhatsApp Auth: OTP generation produces secure 4-digit numeric strings', () => {
  for (let i = 0; i < 20; i++) {
    const otp = generateOtp();
    assert.match(otp, /^\d{4}$/);
    const num = parseInt(otp, 10);
    assert.ok(num >= 1000 && num <= 9999);
  }
});

test('WhatsApp Auth: hashing produces consistent HMAC-SHA256 digests and never matches wrong OTP', () => {
  const phone = '919876543210';
  const otp1 = '1234';
  const otp2 = '1235';

  const hash1 = hashOtp(phone, otp1);
  const hash1Repeat = hashOtp(phone, otp1);
  const hash2 = hashOtp(phone, otp2);

  assert.equal(hash1, hash1Repeat);
  assert.notEqual(hash1, hash2);
});

test('WhatsApp Auth: correct OTP verification succeeds and immediately removes record to prevent replay', () => {
  const phone = '919999911111';
  const otp = '847291';
  saveOtp(phone, otp);

  const successRes = verifyOtp(phone, otp);
  assert.equal(successRes.success, true);

  // Immediate replay must fail
  const replayRes = verifyOtp(phone, otp);
  assert.equal(replayRes.success, false);
  assert.equal(replayRes.code, 'NO_OTP_FOUND');
});

test('WhatsApp Auth: incorrect OTP reduces attempts remaining and rejects', () => {
  const phone = '919999922222';
  const otp = '6543';
  saveOtp(phone, otp);

  const fail1 = verifyOtp(phone, '1111');
  assert.equal(fail1.success, false);
  assert.equal(fail1.code, 'INVALID_OTP');
  assert.equal(fail1.attemptsRemaining, 4);

  const fail2 = verifyOtp(phone, '2222');
  assert.equal(fail2.success, false);
  assert.equal(fail2.attemptsRemaining, 3);
});

test('WhatsApp Auth: exceeding max attempts (5) invalidates the OTP and deletes the record', () => {
  const phone = '919999933333';
  const otp = '1122';
  saveOtp(phone, otp);

  verifyOtp(phone, '0001'); // 1
  verifyOtp(phone, '0002'); // 2
  verifyOtp(phone, '0003'); // 3
  verifyOtp(phone, '0004'); // 4
  const fail5 = verifyOtp(phone, '0005'); // 5

  assert.equal(fail5.success, false);
  assert.equal(fail5.code, 'MAX_ATTEMPTS_EXCEEDED');

  // Should no longer exist
  assert.equal(_store.has(phone), false);
});

test('WhatsApp Auth: expired OTP is rejected and purged', () => {
  const phone = '919999944444';
  const otp = '9988';
  saveOtp(phone, otp);

  // Force expiration
  const record = _store.get(phone);
  record.expiresAt = Date.now() - 1000;

  const expiredRes = verifyOtp(phone, otp);
  assert.equal(expiredRes.success, false);
  assert.equal(expiredRes.code, 'OTP_EXPIRED');
  assert.equal(_store.has(phone), false);
});

test('WhatsApp Auth: rate limiting enforces cooldown and rejects repeated sends within 30s', () => {
  const phone = '919999955555';
  saveOtp(phone, '1234');

  const check = checkRateLimit(phone);
  assert.equal(check.allowed, false);
  assert.equal(check.code, 'COOLDOWN_ACTIVE');
  assert.ok(check.secondsRemaining > 0 && check.secondsRemaining <= 30);
});

test('WhatsApp Auth: HTTP API /send-otp validates phone, enforces rate limit, and delivers mock in dev', async () => {
  const server = http.createServer(handleRequest);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  try {
    // 1. Invalid phone rejection
    const invalidRes = await fetch(`http://localhost:${port}/api/auth/whatsapp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '123' }),
    });
    assert.equal(invalidRes.status, 400);

    // 2. Valid phone send
    const phone = '+91 98888 12345';
    const validRes = await fetch(`http://localhost:${port}/api/auth/whatsapp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    assert.equal(validRes.status, 200);
    const validData = await validRes.json();
    assert.equal(validData.success, true);
    assert.equal(validData.cooldownSeconds, 30);

    // 3. Repeated send within cooldown triggers 429
    const repeatedRes = await fetch(`http://localhost:${port}/api/auth/whatsapp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    assert.equal(repeatedRes.status, 429);
    const repeatedData = await repeatedRes.json();
    assert.equal(repeatedData.code, 'COOLDOWN_ACTIVE');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('WhatsApp Auth: HTTP API /verify-otp validates OTP format and verifies correctly', async () => {
  const server = http.createServer(handleRequest);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  const phone = '919777712345';
  const otp = '4567';
  saveOtp(phone, otp);

  try {
    // Malformed OTP (not 4 digits)
    const malformedRes = await fetch(`http://localhost:${port}/api/auth/whatsapp/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp: '12' }),
    });
    assert.equal(malformedRes.status, 400);

    // Correct verification
    const correctRes = await fetch(`http://localhost:${port}/api/auth/whatsapp/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    assert.equal(correctRes.status, 200);
    const correctData = await correctRes.json();
    assert.equal(correctData.success, true);
    assert.ok(correctData.user);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('WhatsApp Auth: Meta service handles recipient validation and error formatting', () => {
  assert.throws(() => whatsappService.formatRecipient('abc'), /Invalid phone number/);
  assert.equal(whatsappService.formatRecipient('+91 9876543210'), '919876543210');
});
