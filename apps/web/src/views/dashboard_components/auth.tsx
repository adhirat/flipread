/** @jsxImportSource hono/jsx */

export const authView = () => (
    <>
        {/* Auth View — two-panel split */}
        <div id="auth-view" class="auth-split">

          {/* LEFT: Brand panel */}
          <div class="auth-brand-panel">
            <a href="/" style="display:inline-flex;align-items:center;gap:10px;text-decoration:none;margin-bottom:52px">
              <img src="/logo.png" alt="SHOPUBLISH" style="height:32px;width:32px;border-radius:8px" />
              <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.3px">SHOPUBLISH</span>
            </a>

            <h1 style="font-size:34px;font-weight:700;line-height:1.25;margin-bottom:20px;color:#fff">
              Your shop, your content,<br />your audience.
            </h1>
            <p style="font-size:16px;line-height:1.75;color:rgba(255,255,255,0.8);max-width:380px;margin-bottom:44px">
              Publish documents, build a storefront, sell products, and grow your audience — all from one dashboard.
            </p>

            <div style="display:flex;flex-direction:column;gap:18px">
              <div style="display:flex;align-items:center;gap:14px">
                <div style="width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <i class="fas fa-file-alt" style="color:#fff;font-size:15px"></i>
                </div>
                <span style="font-size:14px;color:rgba(255,255,255,0.9)">Publish PDFs, EPUBs, videos and more</span>
              </div>
              <div style="display:flex;align-items:center;gap:14px">
                <div style="width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <i class="fas fa-store" style="color:#fff;font-size:15px"></i>
                </div>
                <span style="font-size:14px;color:rgba(255,255,255,0.9)">Built-in storefront and checkout</span>
              </div>
              <div style="display:flex;align-items:center;gap:14px">
                <div style="width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <i class="fas fa-users" style="color:#fff;font-size:15px"></i>
                </div>
                <span style="font-size:14px;color:rgba(255,255,255,0.9)">Member-only access and analytics</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Form panel */}
          <div class="auth-form-panel">
            <div style="width:100%;max-width:380px">

              <h2 style="font-size:26px;font-weight:700;letter-spacing:-0.3px;margin-bottom:8px" id="auth-title">Welcome back</h2>
              <p id="auth-subtitle" style="font-size:14px;color:var(--text-secondary);margin-bottom:28px;min-height:20px"></p>

              <div id="auth-msg" class="msg"></div>

              {/* Login / Register fields */}
              <div id="auth-fields">
                <div class="form-group">
                  <label>Full Name</label>
                  <input id="auth-name" placeholder="Jane Smith" class="hidden" />
                </div>
                <div class="form-group">
                  <label>Email address</label>
                  <input id="auth-email" placeholder="you@example.com" type="email" />
                </div>
                <div class="form-group">
                  <label>Password</label>
                  <input id="auth-pass" placeholder="••••••••" type="password" />
                  <div id="forgot-link-container" style="text-align:right;margin-top:8px">
                    <a onclick="window.setAuthMode('forgot')" style="font-size:12px;color:var(--color-accent);cursor:pointer;font-weight:500">
                      Forgot password?
                    </a>
                  </div>
                </div>
              </div>

              {/* Password reset field */}
              <div id="reset-fields" class="hidden">
                <div class="form-group">
                  <label>New password</label>
                  <input id="reset-pass" placeholder="Minimum 8 characters" type="password" />
                </div>
              </div>

              <button onclick="window.submitAuth()" class="btn" style="width:100%;padding:11px 18px;font-size:14px;font-weight:600" id="auth-btn">
                Sign In
              </button>

              <div id="auth-footer" style="text-align:center;margin-top:24px;font-size:14px;color:var(--text-secondary)">
                <span id="auth-toggle-text">Don't have an account?</span>
                <a onclick="window.toggleAuthMode()" style="color:var(--color-accent);cursor:pointer;font-weight:600;margin-left:4px" id="auth-toggle-link">
                  Create one free
                </a>
              </div>

              <div id="back-to-login" class="hidden" style="text-align:center;margin-top:20px;font-size:14px">
                <a onclick="window.setAuthMode('login')" style="color:var(--text-secondary);cursor:pointer">
                  &larr; Back to login
                </a>
              </div>

            </div>
          </div>

        </div>
    </>
);
