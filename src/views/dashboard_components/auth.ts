export const authView = `
<!-- Auth View -->
<div id="auth-view" class="auth-container">
  <div class="auth-box">
    <div style="text-align:center;margin-bottom:32px">
      <div class="logo">FlipRead</div>
      <h2 style="font-size:24px" id="auth-title">Welcome Back</h2>
    </div>
    <div id="auth-msg" class="msg"></div>
    <div class="form-group"><input id="auth-name" placeholder="Full Name" class="hidden"></div>
    <div class="form-group"><input id="auth-email" placeholder="Email Address" type="email"></div>
    <div class="form-group"><input id="auth-pass" placeholder="Password" type="password"></div>
    <button onclick="submitAuth()" class="btn" style="width:100%" id="auth-btn">Sign In</button>
    <div style="text-align:center;margin-top:20px;font-size:14px;color:var(--text-secondary)">
      <span id="auth-toggle-text">New here?</span> <a onclick="toggleAuthMode()" style="color:var(--accent-cyan);cursor:pointer;font-weight:600" id="auth-toggle-link">Create Account</a>
    </div>
  </div>
</div>
`;
