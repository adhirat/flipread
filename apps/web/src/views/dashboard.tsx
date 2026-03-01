/** @jsxImportSource hono/jsx */
import { html } from 'hono/html'
import { styles } from './dashboard_components/styles';
import { authView } from './dashboard_components/auth';
import { sidebar } from './dashboard_components/sidebar';
import { dashboardOverview } from './dashboard_components/dashboard_overview';
import { docsView } from './dashboard_components/docs';
import { storeView } from './dashboard_components/store';
import { membersView } from './dashboard_components/members';
import { inquiriesView } from './dashboard_components/inquiries';
import { subscriptionView } from './dashboard_components/subscription';
import { settingsView } from './dashboard_components/settings_view';
import { knowledgeView } from './dashboard_components/knowledge_base';
import { dashboardScript } from './dashboard_components/script';
import { composerView } from './dashboard_components/composer';
import { utilitiesView } from './dashboard_components/utilities';
import { productsView } from './dashboard_components/products';
import { ordersView } from './dashboard_components/orders';
import { promotionsView } from './dashboard_components/promotions';
import { categoriesView } from './dashboard_components/categories';
import { integrationsView } from './dashboard_components/integrations_view';

export function dashboardPage(appUrl: string) {
  return (
    <>
      {html`<!DOCTYPE html>`}
      <html lang="en" data-theme="light">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SHOPUBLISH Dashboard</title>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta property="og:title" content="SHOPUBLISH Dashboard" />
        <meta property="og:description" content="Manage your premium flipbooks and bookstore." />
        <meta property="og:image" content={`${appUrl}/logo.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
        <script dangerouslySetInnerHTML={{ __html: "pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';" }} />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css"/>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
        
        {/* docx */}
        <script src="https://unpkg.com/docx@8.5.0/build/index.js"></script>
        {/* pdf-lib */}
        <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>

        {/* Univer CSS & JS are lazy-loaded on demand by initUniver() in the Sheets editor */}

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/reveal.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/theme/black.min.css" id="reveal-theme" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/reveal.min.js"></script>
        <script src="https://scaleflex.cloudimg.io/v7/plugins/filerobot-image-editor/latest/filerobot-image-editor.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/webcut@0.1.0-alpha.6/dist/webcut.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/webcut@0.1.0-alpha.6/dist/webcut.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        {/* Dashboard UI State (Alpine.js) */}
        <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>

        {authView()}

        <div class="layout" id="dash-view" x-data="{ currentView: 'dashboard', sidebarCollapsed: false }" x-init="{ const h = window.location.hash.replace('#',''); if(h && ['composer','docs','utilities','products','orders','categories','promotions','store','members','inquiries','subscription','knowledge','settings','integrations'].includes(h)) currentView = h; }" style="display:none" x-show="true">
          {sidebar()}
          <main class="content">
            <div x-show="currentView === 'dashboard'">{dashboardOverview()}</div>
            <div x-show="currentView === 'composer'">{composerView()}</div>
            <div x-show="currentView === 'docs'">{docsView()}</div>
            <div x-show="currentView === 'utilities'">{utilitiesView()}</div>
            <div x-show="currentView === 'products'">{productsView()}</div>
            <div x-show="currentView === 'orders'">{ordersView()}</div>
            <div x-show="currentView === 'categories'">{categoriesView()}</div>
            <div x-show="currentView === 'promotions'">{promotionsView()}</div>
            <div x-show="currentView === 'store'">{storeView()}</div>
            <div x-show="currentView === 'members'">{membersView()}</div>
            <div x-show="currentView === 'inquiries'">{inquiriesView()}</div>
            <div x-show="currentView === 'subscription'">{subscriptionView()}</div>
            <div x-show="currentView === 'knowledge'">{knowledgeView()}</div>
            <div x-show="currentView === 'settings'">{settingsView()}</div>
            <div x-show="currentView === 'integrations'">{integrationsView()}</div>
          </main>
        </div>

        <script dangerouslySetInnerHTML={{ __html: dashboardScript }} />
      </body>
    </html>
    </>
  )
}
