
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

export function dashboardPage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlipRead Dashboard</title>
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:title" content="FlipRead Dashboard">
  <meta property="og:description" content="Manage your premium flipbooks and bookstore.">
  <meta property="og:image" content="${appUrl}/logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.88/dist/epub.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
  <script>pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';</script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
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
      ${promotionsView}
      ${storeView}
      ${membersView}
      ${inquiriesView}
      ${subscriptionView}
      ${knowledgeView}
      ${settingsView}
    </main>
  </div>

<script>
${dashboardScript}
</script>
</body>
</html>`;
}
