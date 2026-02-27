export const integrationsView = `
    <!-- Integrations View -->
    <div id="view-integrations" class="view-section">
      <div class="view-header">
        <div>
          <h2>Integrations</h2>
          <p class="text-secondary">Connect ShoPublish with your favorite tools and platforms.</p>
        </div>
      </div>

      <div class="card" style="margin-top:24px;padding:32px;">
        <h3 style="margin-bottom: 24px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Payment Gateways</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px;">
          
          <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <h4 style="margin:0; font-size:16px;"><i class="fab fa-stripe" style="color:#6366f1; font-size:24px; vertical-align:middle; margin-right:8px;"></i> Stripe</h4>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Accept credit cards and popular payment methods securely.</p>
            </div>
            <button class="btn-outline" style="width:100%" onclick="alert('Stripe integration coming soon')">Connect Stripe</button>
          </div>

          <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
               <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <h4 style="margin:0; font-size:16px;"><i class="fab fa-paypal" style="color:#0ea5e9; font-size:24px; vertical-align:middle; margin-right:8px;"></i> PayPal</h4>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Allow customers to pay conveniently via their PayPal accounts.</p>
            </div>
            <button class="btn-outline" style="width:100%" onclick="alert('PayPal integration coming soon')">Connect PayPal</button>
          </div>

        </div>

        <h3 style="margin-bottom: 24px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Email Integrations</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px;">
          
          <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <h4 style="margin:0; font-size:16px;"><i class="fab fa-mailchimp" style="color:#facc15; font-size:24px; vertical-align:middle; margin-right:8px;"></i> Mailchimp</h4>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Sync your store members automatically to your Mailchimp audiences.</p>
            </div>
            <button class="btn-outline" style="width:100%" onclick="alert('Mailchimp integration coming soon')">Connect Mailchimp</button>
          </div>

          <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <h4 style="margin:0; font-size:16px;"><i class="fas fa-paper-plane" style="color:#10b981; font-size:20px; vertical-align:middle; margin-right:8px;"></i> SendGrid</h4>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Leverage SendGrid APIs for powerful transactional email workflows.</p>
            </div>
            <button class="btn-outline" style="width:100%" onclick="alert('SendGrid integration coming soon')">Connect SendGrid</button>
          </div>

        </div>

        <h3 style="margin-bottom: 24px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">CRM Integrations</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px;">
          
           <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <h4 style="margin:0; font-size:16px;"><i class="fab fa-hubspot" style="color:#f97316; font-size:24px; vertical-align:middle; margin-right:8px;"></i> HubSpot</h4>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Sync leads and track customer activity inside your HubSpot CRM.</p>
            </div>
            <button class="btn-outline" style="width:100%" onclick="alert('HubSpot integration coming soon')">Connect HubSpot</button>
          </div>

          <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <h4 style="margin:0; font-size:16px;"><i class="fab fa-salesforce" style="color:#3b82f6; font-size:24px; vertical-align:middle; margin-right:8px;"></i> Salesforce</h4>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Map store orders and metrics into Salesforce automatically.</p>
            </div>
            <button class="btn-outline" style="width:100%" onclick="alert('Salesforce integration coming soon')">Connect Salesforce</button>
          </div>

        </div>

        <h3 style="margin-bottom: 24px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Auditing & Analytics Software</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px;">
          
          <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <h4 style="margin:0; font-size:16px;"><i class="fas fa-chart-pie" style="color:#8b5cf6; font-size:20px; vertical-align:middle; margin-right:8px;"></i> Google Analytics 4</h4>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Track page views, events, and eCommerce auditing conversions.</p>
            </div>
            <button class="btn-outline" style="width:100%" onclick="alert('GA4 integration coming soon')">Connect GA4</button>
          </div>

          <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                <h4 style="margin:0; font-size:16px;"><i class="fas fa-file-invoice-dollar" style="color:#14b8a6; font-size:20px; vertical-align:middle; margin-right:8px;"></i> QuickBooks</h4>
                <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
              </div>
              <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">Log transactions directly to your QuickBooks auditing and accounting books.</p>
            </div>
            <button class="btn-outline" style="width:100%" onclick="alert('QuickBooks integration coming soon')">Connect QuickBooks</button>
          </div>

        </div>

      </div>
    </div>
`;
