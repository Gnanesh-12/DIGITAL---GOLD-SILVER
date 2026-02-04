import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CustomerDashboard = () => {
    const { token, logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [buyData, setBuyData] = useState({ quantity: 0, dealer_id: '', metal_type: '' });

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [buyQty, setBuyQty] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchTransactions();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTransactions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/transactions/my-transactions', {
                headers: { Authorization: token }
            });
            setTransactions(res.data);
        } catch (err) { console.error(err); }
    };

    const openBuyModal = (product) => {
        setSelectedProduct(product);
        setBuyQty('');
        setShowModal(true);
    };

    const handleConfirmBuy = async (e) => {
        e.preventDefault();
        if (!buyQty || parseFloat(buyQty) <= 0) {
            toast.error('Invalid Quantity');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/transactions/buy', {
                dealer_id: selectedProduct.dealer_id._id,
                metal_type: selectedProduct.metal_type,
                quantity: parseFloat(buyQty)
            }, { headers: { Authorization: token } });

            toast.success('Order Placed! Waiting for Dealer Approval.');
            setShowModal(false);
            fetchTransactions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Buy failed');
        }
    };

    return (
        <div className="container">
            <div className="navbar">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="nav-brand">DGS <span style={{ color: 'var(--text-muted)', fontSize: '0.6em', fontWeight: '400' }}>Customer</span></div>
                    <div style={{ fontSize: '1rem', color: '#aaa', marginTop: '-5px' }}>
                        {user && user.name ? `Hi, ${user.name}` : ''}
                    </div>
                </div>
                <div>
                    <button onClick={() => navigate('/profile')} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', marginRight: '15px' }}>
                        My Portfolio
                    </button>
                    <button onClick={logout} className="btn btn-logout">
                        Logout
                    </button>
                </div>
            </div>

            {/* Live Prices */}
            <div className="card">
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>Live Market Prices</h3>
                <div className="grid-cards">
                    {products.map(p => (
                        <div key={p._id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '20px',
                            borderRadius: '15px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: p.metal_type === 'gold' ? 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(192,192,192,0.2) 0%, transparent 70%)', borderRadius: '50%' }}></div>

                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.4em', letterSpacing: '1px' }}>{p.metal_type.toUpperCase()}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9em', marginBottom: '20px' }}>
                                Sold by <strong style={{ color: '#fff' }}>{p.dealer_id?.company_name || 'Unknown Dealer'}</strong>
                            </p>

                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ fontSize: '2em', fontWeight: 'bold', color: p.metal_type === 'gold' ? 'var(--primary)' : 'var(--secondary)' }}>
                                    ${p.price_per_gram}
                                </span>
                                <span style={{ color: '#888', fontSize: '0.9em' }}> / gram</span>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openBuyModal(p)}>
                                Buy Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transactions */}
            <div className="card">
                <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Dealer</th>
                                <th>Metal</th>
                                <th>Qty</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Invoice</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No transactions found</td></tr> : null}
                            {transactions.map(tx => (
                                <tr key={tx._id}>
                                    <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '5px 10px',
                                            borderRadius: '20px',
                                            background: tx.type === 'sell' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                                            color: tx.type === 'sell' ? '#ff6b6b' : '#00ff88',
                                            fontSize: '0.8em',
                                            fontWeight: '600'
                                        }}>
                                            {tx.type ? tx.type.toUpperCase() : 'BUY'}
                                        </span>
                                    </td>
                                    <td>{tx.dealer_id?.company_name || 'N/A'}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{tx.metal_type}</td>
                                    <td><strong>{tx.quantity}g</strong></td>
                                    <td>${tx.amount}</td>
                                    <td>
                                        <span style={{ color: tx.status === 'completed' ? 'var(--success)' : 'orange' }}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td>
                                        {tx.invoice_qr && (
                                            <a href={tx.invoice_qr} download={`invoice_${tx._id}.png`} style={{ color: 'var(--primary)', textDecoration: 'none', borderBottom: '1px dotted var(--primary)' }}>
                                                Download QR
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Buy Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        background: '#1a1a1a',
                        padding: '40px',
                        borderRadius: '20px',
                        width: '400px',
                        border: '1px solid var(--primary)',
                        boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)',
                        transform: 'scale(1)',
                        animation: 'fadeIn 0.2s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: 'var(--primary)', marginTop: 0, textAlign: 'center' }}>Confirm Purchase</h2>

                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <p style={{ color: '#aaa', margin: '5px 0' }}>Buying {selectedProduct?.metal_type?.toUpperCase()} from</p>
                            <h3 style={{ margin: '5px 0', color: 'white' }}>{selectedProduct?.dealer_id?.company_name}</h3>
                            <div style={{ margin: '15px 0', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                Current Price: <strong style={{ color: 'var(--primary)' }}>${selectedProduct?.price_per_gram}/g</strong>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmBuy}>
                            <div className="form-group">
                                <label>Quantity to Buy (grams)</label>
                                <input
                                    type="number"
                                    value={buyQty}
                                    onChange={(e) => setBuyQty(e.target.value)}
                                    required
                                    min="0.1"
                                    step="0.1"
                                    autoFocus
                                    placeholder="e.g. 10"
                                    style={{ fontSize: '1.2em', textAlign: 'center', fontWeight: 'bold' }}
                                />
                            </div>

                            {buyQty && (
                                <div style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
                                    Total Cost: <strong style={{ fontSize: '1.2em', color: 'var(--primary)' }}>${(parseFloat(buyQty) * selectedProduct?.price_per_gram).toFixed(2)}</strong>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                                <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.1)', justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Confirm Pay</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
