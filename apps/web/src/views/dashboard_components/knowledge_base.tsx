/** @jsxImportSource hono/jsx */

export const knowledgeView = () => (
    <>
        {/* Knowledge Base View */}
        <div id="view-knowledge" class="view-section">
          <div class="header"><h2>Knowledge Base</h2></div>
          
          <div class="kb-container" style="display:flex;gap:30px;max-width:1000px">
            {/* Sidebar Navigation */}
            <div class="kb-sidebar" style="width:240px;flex-shrink:0;position:sticky;top:80px;align-self:start">
              <div class="kb-nav" style="border-right:1px solid var(--border);padding-right:20px">
                <h4 style="margin-bottom:12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted)">General</h4>
                <a href="#kb-getting-started" class="kb-link active" {...{ 'x-on:click.prevent': "window.scrollToKb('kb-getting-started')" }}>Getting Started</a>
                <a href="#kb-managing-books" class="kb-link" {...{ 'x-on:click.prevent': "window.scrollToKb('kb-managing-books')" }}>Managing Books</a>
                
                <h4 style="margin:24px 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted)">Store</h4>
                <a href="#kb-customization" class="kb-link" {...{ 'x-on:click.prevent': "window.scrollToKb('kb-customization')" }}>Store Customization</a>
                <a href="#kb-domains" class="kb-link" {...{ 'x-on:click.prevent': "window.scrollToKb('kb-domains')" }}>Custom Domains</a>
                <a href="#kb-members" class="kb-link" {...{ 'x-on:click.prevent': "window.scrollToKb('kb-members')" }}>Team Members</a>
                
                <h4 style="margin:24px 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted)">Advanced</h4>
                <a href="#kb-analytics" class="kb-link" {...{ 'x-on:click.prevent': "window.scrollToKb('kb-analytics')" }}>Analytics</a>
                <a href="#kb-api" class="kb-link" {...{ 'x-on:click.prevent': "window.scrollToKb('kb-api')" }}>API Access</a>
                <a href="#kb-billing" class="kb-link" {...{ 'x-on:click.prevent': "window.scrollToKb('kb-billing')" }}>Billing & Plans</a>
              </div>
            </div>

            {/* Main Content */}
            <div class="kb-content" style="flex:1">
              
              <section id="kb-getting-started" class="kb-section">
                <h3 style="font-size:24px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">Getting Started</h3>
                <p>Welcome to SHOPUBLISH! Our platform helps you publish, sell, and share your PDF and EPUB books with a premium reading experience.</p>
                <div class="kb-card">
                  <h4>Create Your First Book</h4>
                  <p>Once you've logged in, click the prominent <span class="badge">Upload Book</span> button in the top right. Select your PDF or EPUB file. You can also upload a custom cover image at this stage.</p>
                </div>
              </section>

              <section id="kb-managing-books" class="kb-section" style="margin-top:40px">
                <h3 style="font-size:24px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">Managing Books</h3>
                <p>Your library is the heart of your store. Here's how to manage your publications.</p>
                
                <h4 style="margin-top:20px">Editing Metadata</h4>
                <p>Click the <i class="fas fa-pen"></i> icon on any book card to open the editor. You can change the title, visibility status, and even replace the cover image.</p>
                
                <h4 style="margin-top:20px">Password Protection (Pro+)</h4>
                <p>If you are on a Pro plan or higher, you can set a password for individual books in the edit modal. Users will be prompted to enter this password before they can read the book.</p>
              </section>

              <section id="kb-customization" class="kb-section" style="margin-top:40px">
                <h3 style="font-size:24px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">Store Customization</h3>
                <p>Make your store unique with our powerful customization tools available in the <strong>Store</strong> tab.</p>
                
                <ul style="margin-left:20px;margin-top:10px;line-height:1.8">
                  <li><strong>Themes:</strong> Choose from presets like <em>Magazine</em>, <em>Minimal</em>, or <em>Dark Luxe</em>.</li>
                  <li><strong>Branding:</strong> Upload your own logo and set a custom accent color.</li>
                  <li><strong>Hero Section:</strong> Add a banner image and custom title to welcome visitors.</li>
                </ul>
              </section>

              <section id="kb-domains" class="kb-section" style="margin-top:40px">
                <h3 style="font-size:24px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">Custom Domains</h3>
                <div style="background:var(--bg-elevated);padding:16px;border-radius:8px;border-left:4px solid var(--accent-purple)">
                  <p><strong>Note:</strong> Custom domains are a <strong>Pro</strong> and <strong>Business</strong> feature.</p>
                </div>
                <p style="margin-top:12px">To use your own domain (e.g., <code>books.yourname.com</code>):</p>
                <ol style="margin-left:20px;line-height:1.8">
                  <li>Go to your DNS provider (GoDaddy, Namecheap, Cloudflare, etc.).</li>
                  <li>Create a <strong>CNAME</strong> record.</li>
                  <li>Point it to <code>SHOPUBLISH.COM</code>.</li>
                  <li>Enter your domain in the <strong>Store Settings</strong> &gt; <strong>Custom Domain</strong> field.</li>
                  <li>Click Save. It may take up to 24 hours for DNS to propagate.</li>
                </ol>
              </section>

              <section id="kb-members" class="kb-section" style="margin-top:40px">
                <h3 style="font-size:24px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">Team Members</h3>
                <p>Collaborate with your team or give access to specific users.</p>
                <p>In the <strong>Members</strong> tab, you can invite users by email. They will receive an access key to view your private store. This is ideal for internal documentation or exclusive content access.</p>
              </section>

              <section id="kb-analytics" class="kb-section" style="margin-top:40px">
                <h3 style="font-size:24px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">Analytics</h3>
                <p>Track how your content is performing. We provide:</p>
                <ul style="color: var(--text-secondary); line-height: 1.7;">
                  <li><strong>Total Views:</strong> Aggregate views across all books.</li>
                  <li><strong>Geographic Data:</strong> See which countries your readers are from.</li>
                  <li><strong>Activity Logs:</strong> A detailed audit trail of all changes made to your account.</li>
                </ul>
                 <p style="margin-top:10px">Activity logs can be viewed on your main dashboard overview.</p>
              </section>

              <section id="kb-api" class="kb-section" style="margin-top:40px">
                <h3 style="font-size:24px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">API Access</h3>
                <p>Developers on the <strong>Business</strong> plan can access our REST API.</p>
                <p>Generate an API Key in the <strong>Settings</strong> tab. You can use this key to programmatically manage books and members.</p>
                <p><a href="/api/swagger" target="_blank" class="btn-outline" style="display:inline-block;margin-top:10px;text-decoration:none"><i class="fas fa-external-link-alt"></i> View API Documentation</a></p>
              </section>

               <section id="kb-billing" class="kb-section" style="margin-top:40px">
                <h3 style="font-size:24px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">Billing & Plans</h3>
                <p>We offer flexible billing options. You can upgrade or downgrade at any time in the <strong>Subscription</strong> tab.</p>
                <p>All payments are securely processed via Stripe. We offer both monthly and yearly billing cycles, with a 20% discount on yearly plans.</p>
              </section>
              
              <div style="height:100px"></div>
            </div>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
        .kb-link { 
          display: block; 
          padding: 8px 12px; 
          color: var(--text-secondary); 
          text-decoration: none; 
          border-radius: 6px; 
          margin-bottom: 2px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .kb-link:hover { background: var(--bg-elevated); color: var(--text-primary); }
        .kb-link.active { background: var(--bg-elevated); color: var(--accent-cyan); font-weight: 500; }
        .kb-section p { line-height: 1.7; margin-bottom: 12px; color: var(--text-secondary); }
        .kb-section li { margin-bottom: 8px; color: var(--text-secondary); }
        .kb-card { background: var(--bg-elevated); padding: 20px; border-radius: 8px; border: 1px solid var(--border); margin: 20px 0; }
        .kb-card h4 { margin-bottom: 8px; color: var(--text-primary); }
        ` }} />
    </>
);
