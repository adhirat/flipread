/** @jsxImportSource hono/jsx */

export const subscriptionView = () => (
    <>
        {/* Subscription View */}
        <div id="view-subscription" class="view-section">

          {/* Header — title only, no content crammed in */}
          <div class="header">
            <h2>Subscription</h2>
          </div>

          {/* Billing toggle — outside .header so it isn't height-clipped */}
          <div class="billing-toggle">
            <span id="bill-monthly" class="toggle-label" x-on:click="window.setBilling('monthly')">Monthly</span>
            <div class="toggle-switch active" x-on:click="window.toggleBilling()">
              <div class="toggle-knob"></div>
            </div>
            <span id="bill-yearly" class="toggle-label active" x-on:click="window.setBilling('yearly')">
              Yearly <span class="badge-save">Save 20%</span>
            </span>
          </div>
          <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-bottom:32px">
            * All prices exclude 10% GST
          </div>

          {/* Pricing cards — CSS grid, no overflow-x scroll */}
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;align-items:start">

            {/* Basic */}
            <div class="card" style="margin-bottom:0">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);margin-bottom:8px">Basic</div>
              <div class="price-display">
                <span class="currency">$</span><span class="amount" id="price-basic">2.08</span><span class="interval">/mo</span>
                <div class="billed-text" id="billed-basic">Billed $25 yearly</div>
              </div>
              <ul style="list-style:none;margin-bottom:24px;font-size:13px;color:var(--text-secondary);line-height:1.7;display:flex;flex-direction:column;gap:6px">
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>5 published books</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>10 MB max file size</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>2,000 monthly views</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Bookstore page</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Basic analytics</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Custom viewer background</li>
              </ul>
              <button x-on:click="window.checkout('basic')" class="btn-outline" style="width:100%;justify-content:center">Choose Basic</button>
            </div>

            {/* Pro — Most Popular */}
            <div class="card" style="margin-bottom:0;border-color:var(--color-accent);box-shadow:var(--shadow-md);position:relative;padding-top:44px">
              <div style="position:absolute;top:0;left:0;right:0;background:var(--color-accent);color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;padding:7px 16px;border-radius:var(--radius-lg) var(--radius-lg) 0 0;text-align:center">
                Most Popular
              </div>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--color-accent);margin-bottom:8px">Pro</div>
              <div class="price-display">
                <span class="currency">$</span><span class="amount" id="price-pro">7.50</span><span class="interval">/mo</span>
                <div class="billed-text" id="billed-pro">Billed $90 yearly</div>
              </div>
              <ul style="list-style:none;margin-bottom:24px;font-size:13px;color:var(--text-secondary);line-height:1.7;display:flex;flex-direction:column;gap:6px">
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>50 published books</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>50 MB max file size</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>50,000 monthly views</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>Custom slugs &amp; themes</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>Password protection</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>Remove branding</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>Detailed analytics</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>Custom domain</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>Private store mode</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>50 store members</li>
                <li><i class="fas fa-check" style="color:var(--color-accent);margin-right:8px;font-size:11px"></i>Private book sharing</li>
              </ul>
              <button x-on:click="window.checkout('pro')" class="btn" style="width:100%;justify-content:center">Choose Pro</button>
            </div>

            {/* Business */}
            <div class="card" style="margin-bottom:0">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);margin-bottom:8px">Business</div>
              <div class="price-display">
                <span class="currency">$</span><span class="amount" id="price-business">24.17</span><span class="interval">/mo</span>
                <div class="billed-text" id="billed-business">Billed $290 yearly</div>
              </div>
              <ul style="list-style:none;margin-bottom:24px;font-size:13px;color:var(--text-secondary);line-height:1.7;display:flex;flex-direction:column;gap:6px">
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Unlimited books</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>200 MB max file size</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Unlimited views</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Everything in Pro</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Custom domain</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>API access</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Priority support</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Unlimited store members</li>
                <li><i class="fas fa-check" style="color:var(--color-success);margin-right:8px;font-size:11px"></i>Export analytics data</li>
              </ul>
              <button x-on:click="window.checkout('business')" class="btn-outline" style="width:100%;justify-content:center">Choose Business</button>
            </div>

          </div>
        </div>
    </>
);
