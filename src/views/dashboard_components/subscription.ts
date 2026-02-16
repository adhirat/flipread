export const subscriptionView = `
    <!-- Subscription View -->
    <div id="view-subscription" class="view-section">
      <div class="header">
        <h2>Subscription</h2>
        <div class="billing-toggle">
          <span id="bill-monthly" class="toggle-label" onclick="setBilling('monthly')">Monthly</span>
          <div class="toggle-switch active" onclick="toggleBilling()">
            <div class="toggle-knob"></div>
          </div>
          <span id="bill-yearly" class="toggle-label active" onclick="setBilling('yearly')">Yearly <span class="badge-save">Save 20%</span></span>
        </div>
        <div style="text-align:center;font-size:12px;opacity:0.6;margin-top:10px">* All prices exclude 10% GST</div>
      </div>
      
      <div style="display:flex;gap:24px;overflow-x:auto;padding-bottom:20px">
        <!-- Plans -->
        <div class="card" style="flex:1;min-width:280px">
          <h3 style="margin-bottom:8px">Basic</h3>
          <div class="price-display">
            <span class="currency">$</span><span class="amount" id="price-basic">2.08</span><span class="interval">/mo</span>
            <div class="billed-text" id="billed-basic">Billed $25 yearly</div>
          </div>
          <ul style="list-style:none;margin-bottom:24px;font-size:14px;color:var(--text-secondary);line-height:1.6">
            <li><i class="fas fa-check" style="color:var(--accent-cyan);margin-right:8px"></i> 5 Books Limit</li>
            <li><i class="fas fa-check" style="color:var(--accent-cyan);margin-right:8px"></i> 10 MB Uploads</li>
            <li><i class="fas fa-check" style="color:var(--accent-cyan);margin-right:8px"></i> 2,000 Views</li>
          </ul>
          <button onclick="checkout('basic')" class="btn btn-outline" style="width:100%">Choose Basic</button>
        </div>
        
        <div class="card" style="flex:1;min-width:280px;border-color:var(--accent-purple);box-shadow:0 0 20px rgba(139,92,246,0.1)">
          <div style="color:var(--accent-purple);font-size:12px;font-weight:700;text-transform:uppercase;margin-bottom:4px">Recommended</div>
          <h3 style="margin-bottom:8px">Pro</h3>
          <div class="price-display">
            <span class="currency">$</span><span class="amount" id="price-pro">7.50</span><span class="interval">/mo</span>
            <div class="billed-text" id="billed-pro">Billed $90 yearly</div>
          </div>
          <ul style="list-style:none;margin-bottom:24px;font-size:14px;color:var(--text-secondary);line-height:1.6">
             <li><i class="fas fa-check" style="color:var(--accent-purple);margin-right:8px"></i> 50 Books Limit</li>
            <li><i class="fas fa-check" style="color:var(--accent-purple);margin-right:8px"></i> 50 MB Uploads</li>
            <li><i class="fas fa-check" style="color:var(--accent-purple);margin-right:8px"></i> Password Protection</li>
          </ul>
          <button onclick="checkout('pro')" class="btn" style="width:100%;background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue))">Choose Pro</button>
        </div>

        <div class="card" style="flex:1;min-width:280px">
          <h3 style="margin-bottom:8px">Business</h3>
          <div class="price-display">
            <span class="currency">$</span><span class="amount" id="price-business">24.17</span><span class="interval">/mo</span>
            <div class="billed-text" id="billed-business">Billed $290 yearly</div>
          </div>
          <ul style="list-style:none;margin-bottom:24px;font-size:14px;color:var(--text-secondary);line-height:1.6">
             <li><i class="fas fa-check" style="color:var(--accent-magenta);margin-right:8px"></i> Unlimited Books</li>
            <li><i class="fas fa-check" style="color:var(--accent-magenta);margin-right:8px"></i> 200 MB Uploads</li>
            <li><i class="fas fa-check" style="color:var(--accent-magenta);margin-right:8px"></i> API Access</li>
          </ul>
          <button onclick="checkout('business')" class="btn btn-outline" style="width:100%">Choose Business</button>
        </div>
      </div>
    </div>
`;
