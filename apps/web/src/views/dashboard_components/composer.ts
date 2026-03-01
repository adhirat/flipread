import { docxView } from './editors/docx_editor';
import { pdfView } from './editors/pdf_editor';
import { sheetsView } from './editors/sheets_editor';
import { pptView } from './editors/ppt_editor';
import { imageView } from './editors/image_editor';
import { videoView } from './editors/video_editor';
import { markdownView } from './editors/markdown_editor';

export const composerView = `
    <!-- Composer View -->
    <div id="view-composer" class="view-section">
      <div class="view-header">
        <div>
          <h2>Composer</h2>
          <p class="text-secondary">Edit your existing files or create new documents online.</p>
        </div>
      </div>

      <!-- Composer Tabs -->
      <div class="tabs" style="margin-top:24px;border-bottom:1px solid var(--border);display:flex;gap:24px;overflow-x:auto;padding-bottom:12px">
        <div class="tab active" onclick="switchComposerTab('doc')" id="tab-composer-doc" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-primary);border-bottom:2px solid var(--accent);white-space:nowrap">Document (DOCX)</div>
        <div class="tab" onclick="switchComposerTab('sheet')" id="tab-composer-sheet" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary);white-space:nowrap">Spreadsheet (Univer)</div>
        <div class="tab" onclick="switchComposerTab('pdf')" id="tab-composer-pdf" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary);white-space:nowrap">PDF Editor</div>
        <div class="tab" onclick="switchComposerTab('ppt')" id="tab-composer-ppt" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary);white-space:nowrap">Presentation (Reveal.js)</div>
        <div class="tab" onclick="switchComposerTab('md')" id="tab-composer-md" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary);white-space:nowrap">Markdown (Editor)</div>
        <div class="tab" onclick="switchComposerTab('image')" id="tab-composer-image" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary);white-space:nowrap">Image Editor (Filerobot)</div>
        <div class="tab" onclick="switchComposerTab('video')" id="tab-composer-video" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary);white-space:nowrap">Video Editor (Webcut)</div>
      </div>

      <!-- Advanced Editor Panes -->
      ${docxView}
      ${sheetsView}
      ${pdfView}
      ${pptView}
      ${markdownView}
      ${imageView}
      ${videoView}

    </div>
`;

