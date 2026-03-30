import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Invoice = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/transactions/invoice/${id}`);
                setInvoice(res.data);
                setLoading(false);
            } catch (err) {
                setError('Invoice not found or invalid');
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading Invoice...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="card" style={{ maxWidth: '700px', width: '100%', padding: '40px', border: '1px solid var(--primary)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ marginBottom: '10px', fontSize: '2.5rem' }}>OFFICIAL INVOICE</h1>
                    <p style={{ letterSpacing: '2px', color: 'var(--text-muted)' }}>SECURE GOLD & SILVER PLATFORM</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>Transaction ID</div>
                        <div style={{ fontFamily: 'monospace', color: '#fff' }}>{invoice._id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>Date</div>
                        <div style={{ color: '#fff' }}>{new Date(invoice.timestamp).toLocaleString()}</div>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '15px', marginBottom: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>Type</div>
                            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: invoice.type === 'sell' ? 'var(--accent)' : 'var(--success)' }}>
                                {invoice.type ? invoice.type.toUpperCase() : 'BUY'}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>Status</div>
                            <div style={{ color: invoice.status === 'completed' ? 'var(--success)' : 'orange', fontWeight: 'bold' }}>
                                {invoice.status.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: invoice.metal_type === 'gold' ? 'var(--primary)' : 'var(--secondary)' }}>
                                {invoice.metal_type.toUpperCase()}
                            </div>
                            <div>{invoice.quantity} grams</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>Total Amount</div>
                            <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--primary)' }}>
                                ${invoice.amount}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                    <div>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Dealer</h4>
                        <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{invoice.dealer_id.company_name}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{invoice.dealer_id.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Customer</h4>
                        <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{invoice.customer_id.name}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{invoice.customer_id.email}</div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <div style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginBottom: '5px' }}>Digital Signature (Verification)</div>
                    <div style={{
                        fontSize: '0.7em', color: '#666', fontFamily: 'monospace',
                        wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '5px'
                    }}>
                        {invoice.dealer_signature}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button onClick={() => window.print()} className="btn btn-primary">Print / Download PDF</button>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
