
// Viewer HTML template generators
// This file re-exports specific viewers for backward compatibility and ease of use.

export { escapeHtml } from './viewers/viewerUtils';
export { pdfViewerHTML } from './viewers/pdfViewer';
export { epubViewerHTML } from './viewers/epubViewer';
export { documentViewerHTML } from './viewers/documentViewer';
export { pptViewerHTML } from './viewers/pptViewer';
export { spreadsheetViewerHTML } from './viewers/spreadsheetViewer';
export { textViewerHTML } from './viewers/textViewer';
export { imageViewerHTML } from './viewers/imageViewer';

// Web (Scrolled) Viewers
export { pdfWebViewerHTML } from './viewers/pdfWebViewer';
export { epubWebViewerHTML } from './viewers/epubWebViewer';
export { docxWebViewerHTML } from './viewers/docxWebViewer';
export { pptWebViewerHTML } from './viewers/pptWebViewer';
export { spreadsheetWebViewerHTML } from './viewers/spreadsheetWebViewer';
export { textWebViewerHTML } from './viewers/textWebViewer';
export { imageWebViewerHTML } from './viewers/imageWebViewer';
export { passwordPage, errorPage, memberAccessPage, memberRegisterPage, memberForgotPage } from './viewers/commonPages';
