export const inquiriesView = `
    <!-- Inquiries View -->
    <div id="view-inquiries" class="view-section">
      <div class="view-header">
        <div>
          <h2>Store Inquiries</h2>
          <p class="text-secondary">View and respond to messages from your store visitors.</p>
        </div>
        <div style="display:flex;gap:12px">
            <button class="btn-outline" onclick="loadInquiries()"><i class="fas fa-sync-alt"></i> Refresh</button>
        </div>
      </div>

      <div class="card" style="margin-top:24px;padding:16px;margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div style="display:flex;gap:4px;background:var(--bg-elevated);padding:4px;border-radius:10px;border:1px solid var(--border)">
            <button class="inquiry-tab active" id="inquiry-tab-pending" onclick="setInquiryFilter('pending')" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;border-radius:6px;transition:0.2s">Pending</button>
            <button class="inquiry-tab" id="inquiry-tab-done" onclick="setInquiryFilter('done')" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;border-radius:6px;transition:0.2s">Done</button>
            <button class="inquiry-tab" id="inquiry-tab-archived" onclick="setInquiryFilter('archived')" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;border-radius:6px;transition:0.2s">Archived</button>
            <button class="inquiry-tab" id="inquiry-tab-all" onclick="setInquiryFilter('all')" style="padding:6px 12px;font-size:12px;border:none;background:none;cursor:pointer;border-radius:6px;transition:0.2s">All</button>
          </div>
          <div class="books-search-wrap" style="max-width:240px;margin-bottom:0">
            <i class="fas fa-search"></i>
            <input type="text" class="books-search" id="inquiries-search" placeholder="Search inquiries..." oninput="renderInquiries()" style="height:32px;font-size:13px">
          </div>
        </div>
      </div>
      
      <div class="card">
        <div id="inquiries-list">
          <div style="text-align:center;padding:40px;color:var(--text-muted)">
            <i class="fas fa-envelope-open-text" style="font-size:48px;margin-bottom:16px;opacity:0.2"></i>
            <p>No inquiries found.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Inquiry Detail Modal -->
    <div id="inquiry-modal" class="modal">
      <div class="modal-content" style="max-width:700px">
        <div class="modal-header">
          <h3>Inquiry Details</h3>
          <i class="fas fa-times" onclick="hideModal('inquiry-modal')" style="cursor:pointer"></i>
        </div>
        <div class="modal-body">
          <div id="inquiry-detail-content"></div>
          
          <div id="inquiry-response-section" style="margin-top:24px;padding-top:24px;border-top:1px solid var(--border);display:none">
            <h4 style="margin-bottom:16px"><i class="fas fa-reply" style="margin-right:8px"></i> Send Response</h4>
            <div class="form-group">
                <label>Subject</label>
                <input type="text" id="inquiry-resp-subject" placeholder="Contact regarding your inquiry">
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea id="inquiry-resp-message" style="min-height:120px;padding:12px;font-family:inherit" placeholder="Your message back to the visitor..."></textarea>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
                <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;text-transform:none;letter-spacing:0">
                    <input type="checkbox" id="inquiry-resp-mark-done" checked style="width:auto;margin:0"> Mark as Resolved
                </label>
            </div>
            <div style="display:flex;gap:12px;justify-content:flex-end">
                <button class="btn-outline" onclick="toggleResponse(false)">Cancel</button>
                <button class="btn" id="btn-send-response" onclick="sendInquiryResponse()"><i class="fas fa-paper-plane" style="margin-right:6px"></i> Send Email</button>
            </div>
          </div>
        </div>
        <div class="modal-footer" id="inquiry-modal-footer">
          <div id="inquiry-actions-left" style="display:flex;gap:8px">
              <button class="btn" onclick="convertInquiryToMember()"><i class="fas fa-user-plus"></i> Add as Member</button>
          </div>
          <div style="flex:1"></div>
          <button class="btn-outline" onclick="toggleResponse(true)" id="btn-open-reply"><i class="fas fa-reply"></i> Reply</button>
          <button class="btn" id="btn-mark-status" onclick="updateInquiryStatus()"></button>
          <button class="btn-outline" style="color:var(--accent-magenta);border-color:var(--accent-magenta)" onclick="archiveInquiry()"><i class="fas fa-archive"></i> Archive</button>
        </div>
      </div>
    </div>
`;
