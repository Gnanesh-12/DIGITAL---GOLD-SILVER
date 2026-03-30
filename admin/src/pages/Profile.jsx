import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [sellData, setSellData] = useState({ dealerId: '', metal_type: '', maxQty: 0, dealerName: '' });
    const [sellQty, setSellQty] = useState('');

    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchHoldings();
        fetchProducts(); // Fetch live prices to calculate value
    }, []);

    const fetchHoldings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/customer/holdings', {
                headers: { Authorization: token }
            });
            setHoldings(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };

    // Helper to calculate estimated value
    const calculateValue = (metal) => {
        let totalValue = 0;
        holdings.forEach(h => {
            const qty = h[metal];
            if (qty > 0) {
                // Find dealer's price for this metal
                const product = products.find(p =>
                    (p.dealer_id._id === h.dealerId || p.dealer_id === h.dealerId) &&
                    p.metal_type === metal
                );
                if (product) {
                    totalValue += qty * product.price_per_gram;
                }
            }
        });
        return totalValue.toFixed(2);
    };

    const openSellModal = (dealerId, dealerName, metal_type, maxQty) => {
        setSellData({ dealerId, dealerName, metal_type, maxQty });
        setSellQty('');
        setShowModal(true);
    };

    const handleConfirmSell = async (e) => {
        e.preventDefault();
        const qty = parseFloat(sellQty);

        if (isNaN(qty) || qty <= 0 || qty > sellData.maxQty) {
            toast.error('Invalid Quantity');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/customer/sell', {
                dealerId: sellData.dealerId,
                metal_type: sellData.metal_type,
                quantity: qty
            }, { headers: { Authorization: token } });

            toast.success('Sell Order Placed! Waiting for Dealer Approval.');
            setShowModal(false);
            // Ideally refresh, but changes won't show until approved
        } catch (err) {
            toast.error(err.response?.data?.message || 'Sell failed');
        }
    };

    return (
        <div className="container">
            <div className="navbar">
                <div className="nav-brand">DGS <span style={{ color: 'var(--text-muted)', fontSize: '0.6em', fontWeight: '400' }}>Portfolio</span></div>
                <div>
                    <button onClick={() => navigate('/')} className="btn" style={{ marginRight: '15px', background: 'transparent', border: '1px solid #fff', color: '#fff' }}>Dashboard</button>
                    <button onClick={logout} className="btn btn-logout">Logout</button>
                </div>
            </div>

            <div className="grid-cards" style={{ marginBottom: '30px' }}>
                <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(0,0,0,0))' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>GOLD HOLDINGS</h4>
                    <div className="stat-value gold-text">
                        {holdings.reduce((sum, h) => sum + h.gold, 0)}<span style={{ fontSize: '0.5em' }}>g</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                        ≈ ${calculateValue('gold')}
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(192,192,192,0.1), rgba(0,0,0,0))' }}>
                    <h4 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>SILVER HOLDINGS</h4>
                    <div className="stat-value silver-text">
                        {holdings.reduce((sum, h) => sum + h.silver, 0)}<span style={{ fontSize: '0.5em' }}>g</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                        ≈ ${calculateValue('silver')}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>Holdings Breakdown</h3>

                {loading ? <p style={{ color: '#aaa' }}>Loading...</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Dealer Name</th>
                                    <th>Gold (g)</th>
                                    <th>Silver (g)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No holdings found.</td></tr> : null}
                                {holdings.map(h => (
                                    <tr key={h.dealerId}>
                                        <td style={{ fontWeight: '600' }}>{h.dealerName}</td>
                                        <td style={{ color: 'var(--primary)' }}>{h.gold}g</td>
                                        <td style={{ color: 'var(--secondary)' }}>{h.silver}g</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {h.gold > 0 && (
                                                    <button
                                                        className="btn"
                                                        style={{
                                                            padding: '8px 16px',
                                                            fontSize: '0.85em',
                                                            background: 'rgba(255, 215, 0, 0.1)',
                                                            color: 'var(--primary)',
                                                            border: '1px solid var(--primary)'
                                                        }}
                                                        onClick={() => openSellModal(h.dealerId, h.dealerName, 'gold', h.gold)}
                                                    >
                                                        Sell Gold
                                                    </button>
                                                )}
                                                {h.silver > 0 && (
                                                    <button
                                                        className="btn"
                                                        style={{
                                                            padding: '8px 16px',
                                                            fontSize: '0.85em',
                                                            background: 'rgba(192, 192, 192, 0.1)',
                                                            color: 'var(--secondary)',
                                                            border: '1px solid var(--secondary)'
                                                        }}
                                                        onClick={() => openSellModal(h.dealerId, h.dealerName, 'silver', h.silver)}
                                                    >
                                                        Sell Silver
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Sell Modal */}
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
                        border: '1px solid var(--accent)',
                        boxShadow: '0 0 50px rgba(255, 77, 77, 0.2)',
                        transform: 'scale(1)',
                        animation: 'fadeIn 0.2s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: 'var(--accent)', marginTop: 0, textAlign: 'center' }}>Confirm Sale</h2>

                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <p style={{ color: '#aaa', margin: '5px 0' }}>Selling <strong style={{ color: '#fff' }}>{sellData.metal_type.toUpperCase()}</strong> to</p>
                            <h3 style={{ margin: '5px 0', color: 'white' }}>{sellData.dealerName}</h3>
                            <div style={{ margin: '15px 0', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                Available to Sell: <strong>{sellData.maxQty}g</strong>
                            </div>
                        </div>

                        <form onSubmit={handleConfirmSell}>
                            <div className="form-group">
                                <label>Quantity to Sell (grams)</label>
                                <input
                                    type="number"
                                    value={sellQty}
                                    onChange={(e) => setSellQty(e.target.value)}
                                    required
                                    min="0.1"
                                    max={sellData.maxQty}
                                    step="0.1"
                                    autoFocus
                                    placeholder="e.g. 5"
                                    style={{ fontSize: '1.2em', textAlign: 'center', fontWeight: 'bold' }}
                                />
                            </div>

                            {/* Note: We could show estimated earn here if we passed price, but redundant for now */}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                                <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.1)', justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-danger" style={{ justifyContent: 'center' }}>Confirm Sell</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
