/** @jsxImportSource hono/jsx */

const IntegrationCard = ({ title, icon, color, desc, isFontAwesome = true }: { title: string, icon: string, color: string, desc: string, isFontAwesome?: boolean }) => (
  <div style="border:1px solid var(--border); border-radius:12px; padding:20px; background:var(--bg-elevated); display:flex; flex-direction:column; justify-content:space-between;">
    <div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
        <h4 style="margin:0; font-size:16px;">
          <i class={`${isFontAwesome ? 'fab' : 'fas'} fa-${icon}`} style={{ color, fontSize: '24px', verticalAlign: 'middle', marginRight: '8px' }}></i> 
          {title}
        </h4>
        <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:var(--bg-secondary); color:var(--text-secondary);">Not Connected</span>
      </div>
      <p style="font-size:13px; color:var(--text-secondary); margin-bottom: 16px;">{desc}</p>
    </div>
    <button class="btn-outline" style="width:100%" x-on:click={`alert('${title} integration coming soon')`}>Connect {title}</button>
  </div>
);

export const integrationsView = () => (
    <>
        {/* Integrations View */}
        <div id="view-integrations" class="view-section">
          <div class="view-header">
            <div>
              <h2>Integrations</h2>
              <p class="text-secondary">Connect SHOPUBLISH with your favorite tools and platforms.</p>
            </div>
          </div>

          <div class="card" style="margin-top:24px;padding:32px;">
            <h3 style="margin-bottom: 24px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Payment Gateways</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px;">
              <IntegrationCard title="Stripe" icon="stripe" color="#6366f1" desc="Accept credit cards and popular payment methods securely." />
              <IntegrationCard title="PayPal" icon="paypal" color="#0ea5e9" desc="Allow customers to pay conveniently via their PayPal accounts." />
            </div>

            <h3 style="margin-bottom: 24px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Email Integrations</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px;">
              <IntegrationCard title="Mailchimp" icon="mailchimp" color="#facc15" desc="Sync your store members automatically to your Mailchimp audiences." />
              <IntegrationCard title="SendGrid" icon="paper-plane" color="#10b981" desc="Leverage SendGrid APIs for powerful transactional email workflows." isFontAwesome={false} />
            </div>

            <h3 style="margin-bottom: 24px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">CRM Integrations</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px;">
              <IntegrationCard title="HubSpot" icon="hubspot" color="#f97316" desc="Sync leads and track customer activity inside your HubSpot CRM." />
              <IntegrationCard title="Salesforce" icon="salesforce" color="#3b82f6" desc="Map store orders and metrics into Salesforce automatically." />
            </div>

            <h3 style="margin-bottom: 24px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Auditing & Analytics Software</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px;">
              <IntegrationCard title="Google Analytics 4" icon="chart-pie" color="#8b5cf6" desc="Track page views, events, and eCommerce auditing conversions." isFontAwesome={false} />
              <IntegrationCard title="QuickBooks" icon="file-invoice-dollar" color="#14b8a6" desc="Log transactions directly to your QuickBooks auditing and accounting books." isFontAwesome={false} />
            </div>
          </div>
        </div>
    </>
);
