import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const currentUser = {
    id: 'STU-2024-1847',
    name: 'Raju Rastogi',
  };

  useEffect(() => {
    const receiptsRef = collection(db, 'receipts');
    const q = query(
      receiptsRef,
      where('patientId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setReceipts(list);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching receipts:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loading">Loading receipts...</div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <h1>Receipts</h1>
        <p>View and track your billing history and payment status</p>
      </div>

      {receipts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧾</div>
          <p>No receipts yet. Receipts appear here once your visit is completed and billed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {receipts.map((receipt) => {
            const isExpanded = expandedId === receipt.id;
            const isPaid = receipt.paymentStatus === 'paid';
            const total = receipt.items?.reduce((sum, item) => sum + (item.amount * (item.qty || 1)), 0) || 0;

            return (
              <div
                key={receipt.id}
                className="card"
                style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onClick={() => setExpandedId(isExpanded ? null : receipt.id)}
              >
                {/* Receipt header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: 'var(--color-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}>🧾</div>
                    <div>
                      <p style={{ fontWeight: '600', margin: 0, color: 'var(--color-primary)' }}>
                        {receipt.department} — {receipt.provider}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '2px 0 0' }}>
                        {receipt.visitDate} &nbsp;·&nbsp; {receipt.receiptNumber}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                      ₹{total.toLocaleString()}
                    </span>
                    <span className={`badge badge-${isPaid ? 'success' : 'pending'}`}>
                      {isPaid ? '✓ Paid' : 'Pending'}
                    </span>
                    <span style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>

                    {/* Header band */}
                    <div style={{
                      background: 'var(--color-primary)',
                      borderRadius: '10px 10px 0 0',
                      padding: '1rem 1.25rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '0 0 2px' }}>Health Portal</p>
                        <p style={{ color: 'white', fontSize: '1rem', fontWeight: '600', margin: 0 }}>Payment Receipt</p>
                      </div>
                      <span style={{
                        background: isPaid ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                        color: 'white', fontSize: '0.8rem', fontWeight: '600',
                        padding: '4px 12px', borderRadius: '20px'
                      }}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>

                    {/* Info grid */}
                    <div style={{
                      border: '1px solid var(--color-border)',
                      borderTop: 'none',
                      padding: '1rem 1.25rem',
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                      borderBottom: '1px solid var(--color-border)'
                    }}>
                      {[
                        ['Patient', receipt.patientName],
                        ['Patient ID', receipt.patientId],
                        ['Receipt No.', receipt.receiptNumber],
                        ['Date', receipt.visitDate],
                        ['Department', receipt.department],
                        ['Provider', receipt.provider],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: '0 0 2px' }}>{label}</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: '500', margin: 0, color: 'var(--color-text)' }}>{value || '—'}</p>
                        </div>
                      ))}
                    </div>

                    {/* Line items */}
                    <div style={{ border: '1px solid var(--color-border)', borderTop: 'none', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>Bill breakdown</p>
                      <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', color: 'var(--color-text-light)', fontWeight: '500', padding: '4px 0 8px' }}>Item</th>
                            <th style={{ textAlign: 'right', color: 'var(--color-text-light)', fontWeight: '500', padding: '4px 0 8px' }}>Qty</th>
                            <th style={{ textAlign: 'right', color: 'var(--color-text-light)', fontWeight: '500', padding: '4px 0 8px' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receipt.items?.map((item, i) => (
                            <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '8px 0', color: 'var(--color-text)' }}>{item.name}</td>
                              <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--color-text-light)' }}>{item.qty || 1}</td>
                              <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--color-text)' }}>₹{(item.amount * (item.qty || 1)).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total */}
                    <div style={{
                      border: '1px solid var(--color-border)', borderTop: 'none',
                      padding: '0.875rem 1.25rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>Total</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>₹{total.toLocaleString()}</span>
                    </div>

                    {/* Paid confirmation */}
                    {isPaid && (
                      <div style={{
                        border: '1px solid var(--color-border)', borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        padding: '0.75rem 1.25rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        display: 'flex', alignItems: 'center', gap: '10px'
                      }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: '#059669',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: '0.65rem', color: 'white', fontWeight: '700'
                        }}>✓</div>
                        <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '500' }}>
                          Payment confirmed — marked paid by billing staff
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Receipts;