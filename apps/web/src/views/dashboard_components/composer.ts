export const composerView = `
    <!-- Composer View -->
    <div id="view-composer" class="view-section">
      <div class="view-header">
        <div>
          <h2>Composer</h2>
          <p class="text-secondary">Edit your existing files or create new documents online.</p>
        </div>
        <div style="display:flex;gap:12px">
            <button class="btn" onclick="initUniver()"><i class="fas fa-play"></i> Initialize Univer</button>
        </div>
      </div>

      <!-- Composer Tabs -->
      <div class="tabs" style="margin-top:24px;border-bottom:1px solid var(--border);display:flex;gap:24px">
        <div class="tab active" onclick="switchComposerTab('doc')" id="tab-composer-doc" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-primary);border-bottom:2px solid var(--accent)">Document (DOCX)</div>
        <div class="tab" onclick="switchComposerTab('sheet')" id="tab-composer-sheet" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary)">Spreadsheet (Univer)</div>
        <div class="tab" onclick="switchComposerTab('pdf')" id="tab-composer-pdf" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary)">PDF Editor</div>
        <div class="tab" onclick="switchComposerTab('ppt')" id="tab-composer-ppt" style="padding-bottom:12px;cursor:pointer;font-weight:500;color:var(--text-secondary)">Presentation (Reveal.js)</div>
      </div>

      <!-- Docx Tools -->
      <div id="composer-doc" class="composer-pane card" style="margin-top:24px;padding:32px;">
        <h3 style="margin-bottom:16px"><i class="fas fa-file-word text-secondary"></i> Create DOCX Document</h3>
        <div class="form-group">
          <label>Document Title</label>
          <input type="text" id="docx-title" placeholder="Enter document title...">
        </div>
        <div class="form-group">
          <label>Content</label>
          <textarea id="docx-content" rows="10" placeholder="Type your document content here..."></textarea>
        </div>
        <button class="btn" onclick="generateDocx()"><i class="fas fa-download"></i> Generate & Download DOCX</button>
      </div>

      <!-- Univer Tools -->
      <div id="composer-sheet" class="composer-pane card" style="display:none;margin-top:24px;padding:0;">
        <div style="padding:16px;border-bottom:1px solid var(--border)">
          <h3 style="margin:0"><i class="fas fa-file-excel text-secondary"></i> Spreadsheet Editor (Univer)</h3>
        </div>
        <div id="univer-container" style="width:100%; height:600px; display:none;"></div>
        <div id="univer-placeholder" style="padding:60px 20px; text-align:center;">
           <p class="text-secondary">Click "Initialize Univer" at the top to load the robust sheet editor.</p>
        </div>
      </div>

      <!-- PDF Tools -->
      <div id="composer-pdf" class="composer-pane card" style="display:none;margin-top:24px;padding:32px;">
        <h3 style="margin-bottom:16px"><i class="fas fa-file-pdf text-secondary"></i> Create PDF Document</h3>
        <div class="form-group">
          <label>PDF Heading</label>
          <input type="text" id="pdf-heading" placeholder="Enter PDF heading...">
        </div>
        <div class="form-group">
          <label>Body Text</label>
          <textarea id="pdf-body" rows="10" placeholder="Type your PDF content here..."></textarea>
        </div>
        <button class="btn" onclick="generatePdf()"><i class="fas fa-download"></i> Generate & Download PDF</button>
      </div>
      <!-- PPT Tools -->
      <div id="composer-ppt" class="composer-pane card" style="display:none;margin-top:24px;padding:32px;">
        <h3 style="margin-bottom:16px"><i class="fas fa-file-powerpoint text-secondary"></i> Create Presentation</h3>
        <div class="form-group">
          <label>Slide Contents (Markdown - split slides using ---)</label>
          <textarea id="ppt-markdown" rows="10" placeholder="# Slide 1 Heading\\n\\nSlide 1 content.\\n\\n---\\n\\n# Slide 2 Heading\\n\\nSlide 2 content."></textarea>
        </div>
        <div style="display:flex; gap:12px;">
          <button class="btn" onclick="previewPpt()"><i class="fas fa-play"></i> Preview Presentation</button>
          <button class="btn-outline" onclick="generatePpt()"><i class="fas fa-download"></i> Download HTML Presentation</button>
        </div>
        <div id="ppt-preview-container" style="display:none; margin-top:24px; width:100%; height:400px; border:1px solid var(--border); border-radius:8px; position:relative;">
          <div class="reveal">
            <div class="slides" id="ppt-slides-container"></div>
          </div>
        </div>
      </div>
    </div>
`;
