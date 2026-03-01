/** @jsxImportSource hono/jsx */

export const utilitiesView = () => (
    <>
        {/* Utilities View */}
        <div id="view-utilities" class="view-section">
          <div class="view-header">
            <div>
              <h2>Utilities</h2>
              <p class="text-secondary">Trim, compress, merge, sort, convert, and manage your file attributes.</p>
            </div>
          </div>

          <div class="card" style="margin-top:24px;padding:32px;text-align:center;color:var(--text-muted)">
            <i class="fas fa-tools" style="font-size:48px;opacity:0.2;margin-bottom:16px;display:block"></i>
            <h3>No utilities queued</h3>
            <p style="font-size:14px;max-width:400px;margin:12px auto">Select a file from your docs to process it through utilities.</p>
          </div>
        </div>
    </>
);
