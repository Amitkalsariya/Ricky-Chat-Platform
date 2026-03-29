// ═══════════════════════════════════════════
//  Ricky Chat — Premium Email Templates
// ═══════════════════════════════════════════

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #0f0f23; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; }
  .wrapper { width: 100%; background-color: #0f0f23; padding: 40px 0; }
  .container { max-width: 560px; margin: 0 auto; }
  .card { background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  .header { padding: 48px 40px 32px; text-align: center; position: relative; }
  .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #667eea 100%); }
  .logo-circle { display: inline-block; width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); line-height: 72px; text-align: center; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(102,126,234,0.35); }
  .logo-text { color: #ffffff; font-size: 32px; font-weight: 800; text-decoration: none; }
  .brand-name { font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
  .content { padding: 8px 40px 40px; }
  .greeting { font-size: 28px; font-weight: 800; color: #ffffff; margin: 0 0 16px; letter-spacing: -0.5px; line-height: 1.3; }
  .text { font-size: 15px; line-height: 1.7; color: #a0aec0; margin: 0 0 24px; }
  .btn-container { text-align: center; margin: 36px 0; }
  .btn { display: inline-block; padding: 16px 40px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; color: #ffffff !important; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 8px 24px rgba(102,126,234,0.4), inset 0 1px 0 rgba(255,255,255,0.2); letter-spacing: 0.3px; }
  .info-box { background: rgba(102,126,234,0.08); border: 1px solid rgba(102,126,234,0.15); border-radius: 16px; padding: 20px 24px; margin: 24px 0; }
  .info-box p { margin: 0; font-size: 13px; color: #8b9dc3; line-height: 1.6; }
  .info-box strong { color: #667eea; }
  .warning-box { background: rgba(245,101,101,0.08); border: 1px solid rgba(245,101,101,0.15); border-radius: 16px; padding: 20px 24px; margin: 24px 0; }
  .warning-box p { margin: 0; font-size: 13px; color: #fc8181; line-height: 1.6; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); margin: 32px 0; }
  .link-text { font-size: 12px; color: #4a5568; word-break: break-all; margin: 16px 0 0; }
  .link-text a { color: #667eea; text-decoration: underline; }
  .footer { padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.04); }
  .footer p { margin: 0 0 8px; font-size: 12px; color: #4a5568; }
  .footer .brand { color: #667eea; font-weight: 600; }
  .social-row { margin-top: 16px; }
  .social-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin: 0 4px; }
  .feature-grid { margin: 28px 0; }
  .feature-item { display: inline-block; width: 46%; vertical-align: top; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 14px; margin: 4px 2%; border: 1px solid rgba(255,255,255,0.04); }
  .feature-icon { font-size: 24px; margin-bottom: 8px; }
  .feature-title { font-size: 13px; font-weight: 700; color: #e2e8f0; margin: 0; }
  .feature-desc { font-size: 11px; color: #718096; margin: 4px 0 0; line-height: 1.5; }
  .stat-row { display: flex; justify-content: center; gap: 24px; margin: 20px 0; }
  .stat-item { text-align: center; }
  .stat-num { font-size: 24px; font-weight: 800; color: #667eea; }
  .stat-label { font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; }
`;

// ───────────────────────────────────────────
//  1. PASSWORD RESET EMAIL
// ───────────────────────────────────────────
export const getResetPasswordTemplate = (resetUrl, userName = 'there') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password — Ricky Chat</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="logo-circle">
            <span class="logo-text">R</span>
          </div>
          <p class="brand-name">Ricky Chat</p>
        </div>

        <div class="content">
          <h1 class="greeting">Reset your password 🔐</h1>
          <p class="text">
            Hey ${userName}, we received a request to reset the password for your Ricky Chat account. No worries — it happens to the best of us!
          </p>
          <p class="text">
            Click the button below to create a new, secure password. This link is time-sensitive for your protection.
          </p>

          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
          </div>

          <div class="warning-box">
            <p>⏱️ <strong>This link expires in 10 minutes.</strong> If you didn't request a password reset, you can safely ignore this email — your account is still secure.</p>
          </div>

          <div class="divider"></div>

          <p class="link-text">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} <span class="brand">Ricky Chat</span>. All rights reserved.</p>
          <p>Secure messaging, beautifully crafted.</p>
          <div class="social-row">
            <span class="social-dot" style="background:#667eea;"></span>
            <span class="social-dot" style="background:#764ba2;"></span>
            <span class="social-dot" style="background:#f093fb;"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// ───────────────────────────────────────────
//  2. WELCOME / SIGN-UP EMAIL
// ───────────────────────────────────────────
export const getWelcomeTemplate = (fullname, appUrl = 'http://localhost:5173') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Ricky Chat!</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="logo-circle">
            <span class="logo-text">R</span>
          </div>
          <p class="brand-name">Ricky Chat</p>
        </div>

        <div class="content">
          <h1 class="greeting">Welcome, ${fullname}! 🎉</h1>
          <p class="text">
            Your Ricky Chat account is ready. You've just joined the most beautiful, fastest messaging platform designed for people who value privacy and style.
          </p>

          <!--[if mso]><table role="presentation" width="100%"><tr><td width="46%" valign="top"><![endif]-->
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <p class="feature-title">Lightning Fast</p>
              <p class="feature-desc">Real-time messaging with zero lag</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <p class="feature-title">Fully Secure</p>
              <p class="feature-desc">End-to-end encrypted chats</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">👥</div>
              <p class="feature-title">Group Chats</p>
              <p class="feature-desc">Create & manage groups easily</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎙️</div>
              <p class="feature-title">Voice Notes</p>
              <p class="feature-desc">Send voice messages instantly</p>
            </div>
          </div>

          <div class="btn-container">
            <a href="${appUrl}" class="btn" target="_blank">Start Chatting Now →</a>
          </div>

          <div class="info-box">
            <p>💡 <strong>Pro tip:</strong> Complete your profile by uploading a photo and setting your status — it helps friends find and recognize you!</p>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} <span class="brand">Ricky Chat</span>. All rights reserved.</p>
          <p>Built with ❤️ for a better chatting experience.</p>
          <div class="social-row">
            <span class="social-dot" style="background:#667eea;"></span>
            <span class="social-dot" style="background:#764ba2;"></span>
            <span class="social-dot" style="background:#f093fb;"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// ───────────────────────────────────────────
//  3. PASSWORD CHANGED CONFIRMATION
// ───────────────────────────────────────────
export const getPasswordChangedTemplate = (userName = 'there') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed — Ricky Chat</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="logo-circle">
            <span class="logo-text">R</span>
          </div>
          <p class="brand-name">Ricky Chat</p>
        </div>

        <div class="content">
          <h1 class="greeting">Password updated ✅</h1>
          <p class="text">
            Hey ${userName}, your Ricky Chat password was successfully changed. You're all set to continue messaging!
          </p>

          <div class="info-box">
            <p>🔒 <strong>Security notice:</strong> If you did NOT make this change, please reset your password immediately and contact our support team.</p>
          </div>

          <p class="text" style="font-size:13px; color:#718096;">
            For your security, you've been logged in on the device where the password was reset. All other sessions remain active.
          </p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} <span class="brand">Ricky Chat</span>. All rights reserved.</p>
          <p>Your security is our priority.</p>
          <div class="social-row">
            <span class="social-dot" style="background:#667eea;"></span>
            <span class="social-dot" style="background:#764ba2;"></span>
            <span class="social-dot" style="background:#f093fb;"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// ───────────────────────────────────────────
//  4. GOOGLE SIGN-UP WELCOME EMAIL
// ───────────────────────────────────────────
export const getGoogleWelcomeTemplate = (fullname, appUrl = 'http://localhost:5173') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Ricky Chat via Google!</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="logo-circle">
            <span class="logo-text">R</span>
          </div>
          <p class="brand-name">Ricky Chat</p>
        </div>

        <div class="content">
          <h1 class="greeting">Welcome, ${fullname}! 🚀</h1>
          <p class="text">
            You've signed up using your Google account and your Ricky Chat profile is now live. No password to remember — just seamless access every time.
          </p>

          <div class="btn-container">
            <a href="${appUrl}" class="btn" target="_blank">Open Ricky Chat →</a>
          </div>

          <div class="info-box">
            <p>🎨 <strong>Get started:</strong> Upload a profile picture, set your status, and jump into group chats — your friends are waiting!</p>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} <span class="brand">Ricky Chat</span>. All rights reserved.</p>
          <p>Signed in with Google • Secured by Ricky</p>
          <div class="social-row">
            <span class="social-dot" style="background:#667eea;"></span>
            <span class="social-dot" style="background:#764ba2;"></span>
            <span class="social-dot" style="background:#f093fb;"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

// ───────────────────────────────────────────
//  5. SIGN-UP OTP VERIFICATION
// ───────────────────────────────────────────
export const getSignupOTPTemplate = (otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code — Ricky Chat</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="logo-circle">
            <span class="logo-text">R</span>
          </div>
          <p class="brand-name">Ricky Chat</p>
        </div>

        <div class="content">
          <h1 class="greeting">Verify your email ✨</h1>
          <p class="text">
            You're almost there! Please use the 6-digit verification code below to complete your account registration.
          </p>

          <div style="background: rgba(99, 102, 241, 0.1); border: 2px dashed rgba(99, 102, 241, 0.5); padding: 20px; border-radius: 12px; font-size: 36px; font-weight: 800; color: #8b5cf6; letter-spacing: 8px; margin: 30px auto; display: block; text-align: center; max-width: 200px;">
            ${otp}
          </div>

          <div class="info-box" style="border-left-color: #ef4444; background-color: rgba(239, 68, 68, 0.05);">
            <p>⏳ <strong>Important:</strong> This code will expire in 5 minutes. Do not share this code with anyone.</p>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} <span class="brand">Ricky Chat</span>. All rights reserved.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <div class="social-row">
            <span class="social-dot" style="background:#667eea;"></span>
            <span class="social-dot" style="background:#764ba2;"></span>
            <span class="social-dot" style="background:#f093fb;"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

