import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .rct-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #faf8f4;
    min-height: 100vh;
    color: #1c3530;
    padding-bottom: 4rem;
  }

  .rct-page-header {
    padding: 2.5rem 2rem 0;
    max-width: 800px;
    margin: 0 auto;
  }

  .rct-page-header h1 {
    font-family: 'Fraunces', serif;
    font-size: 2rem;
    font-weight: 900;
    color: #1c3530;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .rct-page-header p { font-size: 0.9rem; color: #7a8e89; margin: 0 0 2rem; }

  .rct-content { max-width: 800px; margin: 0 auto; padding: 0 2rem; }

  /* ── Empty state ── */
  .rct-empty {
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(61,122,111,0.12);
    padding: 3.5rem 2rem;
    text-align: center;
    color: #a0b5b0;
  }

  .rct-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; display: block; opacity: 0.5; }
  .rct-empty-text { font-size: 0.875rem; max-width: 300px; margin: 0 auto; line-height: 1.6; }

  /* ── Receipt card ── */
  .rct-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(61,122,111,0.12);
    box-shadow: 0 2px 12px rgba(28,53,48,0.05);
    margin-bottom: 1rem;
    overflow: hidden;
    transition: box-shadow 0.2s;
    cursor: pointer;
  }

  .rct-card:hover { box-shadow: 0 6px 24px rgba(28,53,48,0.1); }

  /* ── Receipt header row ── */
  .rct-row {
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .rct-row-left {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    flex: 1;
    min-width: 0;
  }

  .rct-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    background: rgba(232,184,122,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
    border: 1px solid rgba(232,184,122,0.25);
  }

  .rct-provider {
    font-weight: 700;
    font-size: 0.9rem;
    color: #1c3530;
    margin: 0 0 0.15rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .rct-meta { font-size: 0.78rem; color: #a0b5b0; font-weight: 500; margin: 0; }

  .rct-row-right {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    flex-shrink: 0;
  }

  .rct-total {
    font-family: 'Fraunces', serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1c3530;
  }

  .rct-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.65rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .rct-badge-paid    { background: #dcfce7; color: #15803d; }
  .rct-badge-pending { background: #fef3c7; color: #92400e; }

  .rct-chevron { font-size: 0.75rem; color: #a0b5b0; transition: transform 0.2s; }
  .rct-chevron.open { transform: rotate(180deg); }

  /* ── Expanded detail ── */
  .rct-detail {
    border-top: 1px solid #f2f5f4;
    animation: rctSlide 0.22s ease both;
  }

  @keyframes rctSlide {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Band header */
  .rct-detail-band {
    background: linear-gradient(135deg, #2d5a4f, #3d7a6f);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rct-detail-brand { font-size: 0.72rem; color: rgba(255,255,255,0.55); margin: 0 0 0.1rem; }
  .rct-detail-title { font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 700; color: #fff; margin: 0; }

  .rct-status-pill {
    padding: 0.3rem 0.85rem;
    border-radius: 20px;
    background: rgba(255,255,255,0.15);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
  }

  /* Info grid */
  .rct-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f2f5f4;
  }

  .rct-detail-label { font-size: 0.7rem; color: #a0b5b0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.2rem; }
  .rct-detail-value { font-size: 0.875rem; font-weight: 600; color: #1c3530; }

  /* Line items */
  .rct-breakdown { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f2f5f4; }

  .rct-breakdown-label {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a0b5b0;
    margin-bottom: 0.75rem;
  }

  .rct-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }

  .rct-table th {
    text-align: left;
    color: #a0b5b0;
    font-weight: 600;
    padding: 0 0 0.5rem;
    font-size: 0.75rem;
  }

  .rct-table th:not(:first-child) { text-align: right; }

  .rct-table td {
    padding: 0.55rem 0;
    color: #1c3530;
    border-top: 1px solid #f2f5f4;
  }

  .rct-table td:not(:first-child) { text-align: right; color: #5a7a74; }

  /* Total row */
  .rct-total-row {
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f2f5f4;
  }

  .rct-total-label { font-weight: 700; color: #1c3530; font-size: 0.9rem; }
  .rct-total-value { font-family: 'Fraunces', serif; font-size: 1.35rem; font-weight: 700; color: #2d5a4f; }

  /* Paid footer */
  .rct-paid-footer {
    padding: 0.9rem 1.5rem;
    background: #f0fdf8;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .rct-paid-check {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #059669;
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem;
    font-weight: 900;
    flex-shrink: 0;
  }

  .rct-paid-text { font-size: 0.82rem; color: #059669; font-weight: 600; }
`;

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const currentUser = { id: 'STU-2024-1847', name: 'Raju Rastogi' };

  useEffect(() => {
    const q = query(collection(db, 'receipts'), where('patientId', '==', currentUser.id), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#7a8e89' }}>Loading receipts…</div>;

  return (
    <div className="rct-root">
      <style>{styles}</style>

      <div className="rct-page-header">
        <h1>Receipts</h1>
        <p>View and track your billing history and payment status</p>
      </div>

      <div className="rct-content">
        {receipts.length === 0 ? (
          <div className="rct-empty">
            <span className="rct-empty-icon">🧾</span>
            <p className="rct-empty-text">No receipts yet. Receipts appear here once your visit is completed and billed.</p>
          </div>
        ) : (
          receipts.map((receipt) => {
            const isExpanded = expandedId === receipt.id;
            const isPaid = receipt.paymentStatus === 'paid';
            const total = receipt.items?.reduce((sum, item) => sum + (item.amount * (item.qty || 1)), 0) || 0;

            return (
              <div
                key={receipt.id}
                className="rct-card"
                onClick={() => setExpandedId(isExpanded ? null : receipt.id)}
              >
                {/* Summary row */}
                <div className="rct-row">
                  <div className="rct-row-left">
                    <div className="rct-icon"></div>
                    <div>
                      <div className="rct-provider">{receipt.department} — {receipt.provider}</div>
                      <div className="rct-meta">{receipt.visitDate} · {receipt.receiptNumber}</div>
                    </div>
                  </div>
                  <div className="rct-row-right">
                    <span className="rct-total">₹{total.toLocaleString()}</span>
                    <span className={`rct-badge ${isPaid ? 'rct-badge-paid' : 'rct-badge-pending'}`}>
                      {isPaid ? '✓ Paid' : 'Pending'}
                    </span>
                    <span className={`rct-chevron ${isExpanded ? 'open' : ''}`}>▼</span>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="rct-detail">
                    <div className="rct-detail-band">
                      <div>
                        <div className="rct-detail-brand">Health Portal</div>
                        <div className="rct-detail-title">Payment Receipt</div>
                      </div>
                      <span className="rct-status-pill">{isPaid ? 'Paid' : 'Unpaid'}</span>
                    </div>

                    <div className="rct-detail-grid">
                      {[
                        ['Patient', receipt.patientName],
                        ['Patient ID', receipt.patientId],
                        ['Receipt No.', receipt.receiptNumber],
                        ['Date', receipt.visitDate],
                        ['Department', receipt.department],
                        ['Provider', receipt.provider],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="rct-detail-label">{label}</div>
                          <div className="rct-detail-value">{value || '—'}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rct-breakdown">
                      <div className="rct-breakdown-label">Bill Breakdown</div>
                      <table className="rct-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receipt.items?.map((item, i) => (
                            <tr key={i}>
                              <td>{item.name}</td>
                              <td>{item.qty || 1}</td>
                              <td>₹{(item.amount * (item.qty || 1)).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="rct-total-row">
                      <span className="rct-total-label">Total</span>
                      <span className="rct-total-value">₹{total.toLocaleString()}</span>
                    </div>

                    {isPaid && (
                      <div className="rct-paid-footer">
                        <div className="rct-paid-check">✓</div>
                        <span className="rct-paid-text">Payment confirmed — marked paid by billing staff</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Receipts;