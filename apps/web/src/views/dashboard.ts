
import { styles } from './dashboard_components/styles';
import { authView } from './dashboard_components/auth';
import { sidebar } from './dashboard_components/sidebar';
import { dashboardOverview } from './dashboard_components/dashboard_overview';
import { docsView } from './dashboard_components/docs';
import { storeView } from './dashboard_components/store';
import { membersView } from './dashboard_components/members';
import { inquiriesView } from './dashboard_components/inquiries';
import { subscriptionView } from './dashboard_components/subscription';
import { settingsView } from './dashboard_components/settings';
import { knowledgeView } from './dashboard_components/knowledge_base';
import { dashboardScript } from './dashboard_components/script';
import { composerView } from './dashboard_components/composer';
import { utilitiesView } from './dashboard_components/utilities';
import { productsView } from './dashboard_components/products';
import { ordersView } from './dashboard_components/orders';
import { promotionsView } from './dashboard_components/promotions';
import { categoriesView } from './dashboard_components/categories';
import { integrationsView } from './dashboard_components/integrations';

export function dashboardPage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SHOPUBLISH Dashboard</title>
  <link rel="icon" type="image/png" href="/logo.png">
  <link rel="apple-touch-icon" href="/logo.png">
  <meta property="og:title" content="SHOPUBLISH Dashboard">
  <meta property="og:description" content="Manage your premium flipbooks and bookstore.">
  <meta property="og:image" content="${appUrl}/logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
  <script>pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';</script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
  <!-- docx -->
  <script src="https://unpkg.com/docx@8.5.0/build/index.js"></script>
  <!-- pdf-lib -->
  <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
  <!-- Univer requirements and umd -->
  <link rel="stylesheet" href="https://unpkg.com/@univerjs/design@0.1.12/lib/index.css">
  <link rel="stylesheet" href="https://unpkg.com/@univerjs/ui@0.1.12/lib/index.css">
  <link rel="stylesheet" href="https://unpkg.com/@univerjs/docs-ui@0.1.12/lib/index.css">
  <link rel="stylesheet" href="https://unpkg.com/@univerjs/sheets-ui@0.1.12/lib/index.css">
  <link rel="stylesheet" href="https://unpkg.com/@univerjs/sheets-numfmt@0.1.12/lib/index.css">
  <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/rxjs@7.8.1/dist/bundles/rxjs.umd.min.js"></script>
  <script src="https://unpkg.com/clsx@2.0.0/dist/clsx.min.js"></script>
  <script src="https://unpkg.com/@wendellhu/redi@0.15.2/dist/redi.js"></script>
  <script src="https://unpkg.com/@univerjs/core@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/design@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/engine-render@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/engine-formula@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/ui@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/docs@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/docs-ui@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/sheets@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/sheets-ui@0.1.12/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/sheets-numfmt@0.1.12/lib/umd/index.js"></script>
  <!-- Reveal.js -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/reveal.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/theme/black.min.css" id="reveal-theme">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/5.0.4/reveal.min.js"></script>
  <style>
    ${styles}
  </style>
</head>
<body>

  ${authView}

  <div class="layout" id="dash-view" style="display:none">
    ${sidebar}
    <main class="content">
      ${dashboardOverview}
      ${composerView}
      ${docsView}
      ${utilitiesView}
      ${productsView}
      ${ordersView}
      ${categoriesView}
      ${promotionsView}
      ${storeView}
      ${membersView}
      ${inquiriesView}
      ${subscriptionView}
      ${knowledgeView}
      ${settingsView}
      ${integrationsView}
    </main>
  </div>

<script>
${dashboardScript}
</script>
</body>
</html>`;
}
