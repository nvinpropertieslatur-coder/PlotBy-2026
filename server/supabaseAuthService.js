// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { normalizePhone } = require('./otpStore');

class SupabaseAuthService {
  constructor() {
    this.initClients();
  }

  initClients() {
    this.supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.anonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    this.jwtSecret = process.env.SUPABASE_JWT_SECRET || '';

    if (this.supabaseUrl && this.serviceRoleKey) {
      this.adminClient = createClient(this.supabaseUrl, this.serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } else {
      this.adminClient = null;
    }

    if (this.supabaseUrl && this.anonKey) {
      this.publicClient = createClient(this.supabaseUrl, this.anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } else {
      this.publicClient = null;
    }
  }

  /**
   * Formats a phone number with leading + (e.g. +919876543210)
   */
  formatPhoneWithPlus(phone) {
    const digits = normalizePhone(phone);
    return `+${digits}`;
  }

  /**
   * Generates a deterministic high-entropy secret for this user's password auth
   */
  getDeterministicPassword(userId) {
    const salt = process.env.SUPABASE_AUTH_SALT || 'plotby_wa_auth_salt_v1';
    return crypto.createHmac('sha256', salt).update(`plotby:${userId}`).digest('hex') + 'Aa1!';
  }

  /**
   * Finds or creates a user by verified phone number and returns user + Supabase session
   */
  async authenticateUserByPhone(phone) {
    this.initClients();
    const formattedPhone = this.formatPhoneWithPlus(phone);
    const digits = normalizePhone(phone);

    // If no Supabase URL is available
    if (!this.supabaseUrl) {
      return {
        user: { id: `local-${digits}`, phone: formattedPhone },
        session: null,
        isNewUser: false,
      };
    }

    // If Admin client with service role key is configured:
    if (this.adminClient) {
      let user = null;
      let isNewUser = false;

      // 1. Search for existing user with this phone
      try {
        const { data: { users }, error: listError } = await this.adminClient.auth.admin.listUsers();
        if (!listError && Array.isArray(users)) {
          user = users.find(u => {
            if (!u.phone) return false;
            return normalizePhone(u.phone) === digits;
          }) || null;
        }
      } catch (err) {
        console.warn('[SupabaseAuthService] Error querying existing users:', err.message);
      }

      // 2. If no user found, create new user in Supabase auth
      if (!user) {
        isNewUser = true;
        const tempPassword = crypto.randomBytes(24).toString('hex') + 'Aa1!';
        const { data, error: createError } = await this.adminClient.auth.admin.createUser({
          phone: formattedPhone,
          password: tempPassword,
          phone_confirm: true,
          user_metadata: {
            phone: formattedPhone,
            auth_provider: 'whatsapp',
          },
        });

        if (createError) {
          // If already registered under a slightly different format:
          console.warn('[SupabaseAuthService] createUser error, trying fallback lookup:', createError.message);
        } else {
          user = data.user;
        }
      }

      // 3. Ensure phone is confirmed
      if (user && !user.phone_confirmed_at) {
        try {
          await this.adminClient.auth.admin.updateUserById(user.id, { phone_confirm: true });
        } catch (e) {
          // non-critical
        }
      }

      // 4. Sync public.users table
      if (user) {
        try {
          await this.adminClient.from('users').upsert(
            {
              id: user.id,
              phone: formattedPhone,
            },
            { onConflict: 'id' }
          );
        } catch (err) {
          console.warn('[SupabaseAuthService] Error syncing users table:', err.message);
        }
      }

      // 5. Generate authenticated session
      let session = null;
      if (user && this.publicClient) {
        try {
          // Update password to known deterministic password
          const authPassword = this.getDeterministicPassword(user.id);
          await this.adminClient.auth.admin.updateUserById(user.id, {
            password: authPassword,
            phone_confirm: true,
          });

          // Sign in with public client to obtain valid access_token and refresh_token
          const signInRes = await this.publicClient.auth.signInWithPassword({
            phone: formattedPhone,
            password: authPassword,
          });

          if (signInRes.data?.session) {
            session = signInRes.data.session;
          }
        } catch (sessionErr) {
          console.warn('[SupabaseAuthService] Could not issue session via signInWithPassword:', sessionErr.message);
        }
      }

      return {
        user: user || { id: `wa-${digits}`, phone: formattedPhone },
        session,
        isNewUser,
      };
    }

    // Fallback if SUPABASE_SERVICE_ROLE_KEY is not yet configured:
    console.info('[SupabaseAuthService] SUPABASE_SERVICE_ROLE_KEY not configured. Returning verified user payload.');
    return {
      user: { id: `wa-${digits}`, phone: formattedPhone },
      session: null,
      isNewUser: false,
      notice: 'Configure SUPABASE_SERVICE_ROLE_KEY in .env to enable server-side session issuance.',
    };
  }
}

module.exports = new SupabaseAuthService();
