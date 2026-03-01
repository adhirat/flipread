/** @jsxImportSource hono/jsx */

export const ordersView = () => (
    <>
        {/* Orders View */}
        <div id="view-orders" class="view-section">
          <div class="view-header">
            <div>
              <h2>Orders</h2>
              <p class="text-secondary">Process and track customer orders.</p>
            </div>
          </div>

          <div class="card" style="margin-top:24px;padding:32px;">
            <div id="orders-list-container" style="display:flex; flex-direction:column; gap:16px;">
               <i class="fas fa-spinner fa-spin text-muted"></i> <span class="text-muted">Loading orders...</span>
            </div>
          </div>
        </div>

        {/* Edit Order Modal */}
        <div id="edit-order-modal" class="modal">
          <div class="modal-content" style="max-width:600px; max-height:80vh; overflow-y:auto;">
            <div class="close-btn" x-on:click="window.hideModal('edit-order-modal')">&times;</div>
            <h3 id="order-modal-title" style="margin-bottom:8px">Order Details</h3>
            <p class="text-muted" id="edit-order-id-display" style="font-family:monospace; margin-bottom: 24px;">ID: ...</p>
            <input type="hidden" id="edit-order-id" />
            
            <div style="display:flex; gap:16px;">
                <div class="form-group" style="flex:1;">
                  <label>Order Status</label>
                  <select id="edit-order-status" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);">
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div class="form-group" style="flex:1;">
                  <label>Payment Status</label>
                  <select id="edit-order-payment-status" style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);">
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
            </div>

            <div class="form-group">
              <label>Delivery Instructions / Tracking</label>
              <input type="text" id="edit-order-delivery-details" placeholder="e.g. FedEx Tracking #123456789" />
            </div>

            <div class="form-group">
              <label>Admin Comments (Optional)</label>
              <textarea id="edit-order-comments" rows={2} style="width:100%;padding:10px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:'Work Sans',sans-serif;resize:vertical;" placeholder="Internal notes for this order..."></textarea>
            </div>

            {/* Read only summaries */}
            <h4 style="margin-top:24px; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">Customer Information</h4>
            <div id="edit-order-customer-info" style="font-size:14px; color:var(--text-secondary); line-height:1.5;"></div>

            <h4 style="margin-top:24px; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:8px;">Order Items</h4>
            <div id="edit-order-items-info" style="font-size:14px; color:var(--text-secondary); line-height:1.5; background:var(--bg-secondary); padding:16px; border-radius:12px;"></div>

            <div id="edit-order-msg" class="msg" style="display:none;margin-bottom:12px; margin-top:16px;"></div>
            <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px">
              <button x-on:click="window.hideModal('edit-order-modal')" class="btn-outline" style="border:none">Cancel</button>
              <button id="submit-order-btn" x-on:click="window.saveOrder()" class="btn">Update Order</button>
            </div>
          </div>
        </div>
    </>
);
