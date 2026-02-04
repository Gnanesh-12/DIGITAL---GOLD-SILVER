import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const { token, logout, user } = useContext(AuthContext);
    const [stats, setStats] = useState({});
    const [pendingDealers, setPendingDealers] = useState([]);
    const [activeView, setActiveView] = useState('dashboard'); // dashboard, customers, dealers, transactions
    const [listData, setListData] = useState([]);

    useEffect(() => {
        if (activeView === 'dashboard') {
            fetchStats();
            fetchPendingDealers();
        } else if (activeView === 'customers') {
            fetchList('customers');
        } else if (activeView === 'dealers') {
            fetchList('dealers');
        } else if (activeView === 'transactions') {
            fetchList('monitor-transactions');
        }
    }, [activeView]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/dashboard', { headers: { Authorization: token } });
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchPendingDealers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/pending-dealers', { headers: { Authorization: token } });
            setPendingDealers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchList = async (endpoint) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/${endpoint}`, { headers: { Authorization: token } });
            console.log(`Fetched ${endpoint}:`, res.data); // Debug
            setListData(res.data);
        } catch (err) { console.error(err); }
    };

    const handleApproveDealer = async (id) => {
        try {
            await axios.post('http://localhost:5000/api/admin/approve-dealer', { id }, { headers: { Authorization: token } });
            toast.success('Dealer Approved');
            fetchPendingDealers();
            fetchStats();
        } catch (err) { toast.error('Failed'); }
    };

    const handleApproveTransaction = async (txId) => {
        try {
            await axios.post('http://localhost:5000/api/transactions/approve', { transactionId: txId }, {
                headers: { Authorization: token }
            });
            toast.success('Transaction Approved by Admin!');
            fetchList('monitor-transactions'); // Refresh list
            fetchStats(); // Update stats
        } catch (err) {
            toast.error(err.response?.data?.message || 'Approval failed');
        }
    };

    const renderTable = () => {
        if (activeView === 'customers') {
            return (
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Gold Holdings</th>
                                <th>Silver Holdings</th>
                                <th>Wallet Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listData.length === 0 ? <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No Customers Found</td></tr> : null}
                            {listData.map(u => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 'bold', color: 'white' }}>{u.name || 'N/A'}</td>
                                    <td>{u.email || 'N/A'}</td>
                                    <td style={{ color: 'var(--primary)' }}>{u.portfolio?.gold || 0}g</td>
                                    <td style={{ color: 'var(--secondary)' }}>{u.portfolio?.silver || 0}g</td>
                                    <td>${u.wallet_balance || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeView === 'dealers') {
            return (
                <div className="grid-cards" style={{ gridTemplateColumns: '1fr' }}>
                    {listData.length === 0 ? <p style={{ padding: '20px', textAlign: 'center' }}>No Dealers Found</p> : null}
                    {listData.map(d => (
                        <div key={d._id} style={{
                            background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                                <h3 style={{ margin: 0 }}>
                                    {d.company_name || d.name}
                                    <span style={{
                                        marginLeft: '10px', fontSize: '0.6em', padding: '3px 8px', borderRadius: '5px',
                                        background: d.is_verified ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                                        color: d.is_verified ? 'var(--success)' : 'orange'
                                    }}>
                                        {d.is_verified ? 'VERIFIED' : 'PENDING'}
                                    </span>
                                </h3>
                                <p style={{ margin: 0, color: '#aaa', fontSize: '0.9em' }}>{d.email}</p>
                            </div>

                            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9em', textTransform: 'uppercase' }}>Current Inventory</h4>
                            {d.inventory && d.inventory.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                    {d.inventory.map(p => (
                                        <div key={p._id} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                            <strong style={{ color: p.metal_type === 'gold' ? 'var(--primary)' : 'var(--secondary)' }}>{p.metal_type.toUpperCase()}</strong>
                                            <div style={{ fontSize: '0.9em', color: '#ccc' }}>${p.price_per_gram}/g</div>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>Stock: {p.stock}g</div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p style={{ color: '#666', fontStyle: 'italic' }}>No products listed currently.</p>}
                        </div>
                    ))}
                </div>
            );
        }
        if (activeView === 'transactions') {
            return (
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Customer</th>
                                <th>Dealer</th>
                                <th>Metal</th>
                                <th>Qty</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listData.length === 0 ? <tr><td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No Transactions Found</td></tr> : null}
                            {listData.map(tx => (
                                <tr key={tx._id}>
                                    <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '15px',
                                            background: tx.type === 'sell' ? 'rgba(255,77,77,0.15)' : 'rgba(0,255,136,0.15)',
                                            color: tx.type === 'sell' ? 'var(--accent)' : 'var(--success)',
                                            fontWeight: '600', fontSize: '0.8em'
                                        }}>
                                            {tx.type ? tx.type.toUpperCase() : 'BUY'}
                                        </span>
                                    </td>
                                    <td>{tx.customer_id?.name || 'Unknown'}</td>
                                    <td>{tx.dealer_id?.company_name || 'Unknown'}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{tx.metal_type}</td>
                                    <td><strong>{tx.quantity}g</strong></td>
                                    <td>${tx.amount}</td>
                                    <td>
                                        <span style={{ color: tx.status === 'completed' ? 'var(--success)' : 'orange' }}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td>
                                        {tx.status === 'pending' && (
                                            <button
                                                className="btn"
                                                onClick={() => handleApproveTransaction(tx._id)}
                                                style={{
                                                    padding: '5px 10px', fontSize: '0.8em', background: 'var(--primary)', color: 'black'
                                                }}
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    return (
        <div className="container">
            <div className="navbar">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="nav-brand">DGS <span style={{ color: 'var(--text-muted)', fontSize: '0.6em', fontWeight: '400' }}>Admin</span></div>
                    <div style={{ fontSize: '1rem', color: '#aaa', marginTop: '-5px' }}>Hi, {user?.name}</div>
                </div>
                <button onClick={logout} className="btn btn-logout">Logout</button>
            </div>

            {/* Navigation / Breadcrumbs */}
            {activeView !== 'dashboard' && (
                <button className="btn" onClick={() => setActiveView('dashboard')} style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.1)', color: '#aaa' }}>
                    &larr; Back to Dashboard
                </button>
            )}

            {activeView === 'dashboard' ? (
                <>
                    {/* Stats */}
                    <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '40px' }}>
                        <div className="card" onClick={() => setActiveView('customers')} style={{ textAlign: 'center', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}>
                            <h3 style={{ color: '#aaa', fontSize: '1rem', marginTop: 0 }}>Total Customers</h3>
                            <h2 style={{ fontSize: '3rem', margin: '10px 0', color: 'white' }}>{stats.totalCustomers || 0}</h2>
                            <span style={{ fontSize: '0.8em', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '2px 8px', borderRadius: '10px' }}>View All</span>
                        </div>
                        <div className="card" onClick={() => setActiveView('dealers')} style={{ textAlign: 'center', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}>
                            <h3 style={{ color: '#aaa', fontSize: '1rem', marginTop: 0 }}>Total Dealers</h3>
                            <h2 style={{ fontSize: '3rem', margin: '10px 0', color: 'white' }}>{stats.totalDealers || 0}</h2>
                            <span style={{ fontSize: '0.8em', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '2px 8px', borderRadius: '10px' }}>View All</span>
                        </div>
                        <div className="card" onClick={() => setActiveView('transactions')} style={{ textAlign: 'center', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}>
                            <h3 style={{ color: '#aaa', fontSize: '1rem', marginTop: 0 }}>Total Transactions</h3>
                            <h2 style={{ fontSize: '3rem', margin: '10px 0', color: 'white' }}>{stats.totalTransactions || 0}</h2>
                            <span style={{ fontSize: '0.8em', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '2px 8px', borderRadius: '10px' }}>View Logs</span>
                        </div>
                        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.1) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(255, 77, 77, 0.3)' }}>
                            <h3 style={{ color: 'var(--accent)', fontSize: '1rem', marginTop: 0 }}>Pending Approvals</h3>
                            <h2 style={{ fontSize: '3rem', margin: '10px 0', color: 'white' }}>{stats.pendingDealers || 0}</h2>
                        </div>
                    </div>

                    {/* Pending Dealers */}
                    <div className="card">
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>Pending Dealer Approvals</h3>
                        {pendingDealers.length === 0 ? <p style={{ color: '#666', fontStyle: 'italic' }}>No pending approvals required.</p> : null}

                        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                            {pendingDealers.map(d => (
                                <div key={d._id} style={{
                                    background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px',
                                    display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div>
                                        <strong style={{ fontSize: '1.2em' }}>{d.name}</strong>
                                        <div style={{ color: '#aaa', fontSize: '0.9em' }}>{d.email}</div>
                                        <div style={{ color: 'var(--primary)', marginTop: '5px' }}>{d.company_name}</div>
                                    </div>
                                    <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => handleApproveDealer(d._id)}>
                                        Approve Dealer
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="card">
                    <h2 style={{ textTransform: 'capitalize', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>
                        {activeView === 'transactions' ? 'Transaction Logs' : `${activeView} List`}
                    </h2>
                    {renderTable()}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
