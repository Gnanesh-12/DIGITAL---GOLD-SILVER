import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DealerDashboard = () => {
    const { token, logout, user } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newProduct, setNewProduct] = useState({ metal_type: 'gold', price_per_gram: 0, stock: 0 });

    useEffect(() => {
        fetchInventory();
        fetchOrders();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products/my-inventory', {
                headers: { Authorization: token }
            });
            setInventory(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/transactions/my-transactions', {
                headers: { Authorization: token }
            });
            setOrders(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/products', newProduct, {
                headers: { Authorization: token }
            });
            fetchInventory();
            toast.success('Product Added');
        } catch (err) { toast.error('Failed to add product'); }
    };

    const handleApprove = async (txId) => {
        try {
            await axios.post('http://localhost:5000/api/transactions/approve', { transactionId: txId }, {
                headers: { Authorization: token }
            });
            toast.success('Transaction Approved & Signed!');
            fetchOrders();
        } catch (err) { toast.error(err.response?.data?.message || 'Approval failed'); }
    };

    return (
        <div className="container">
            <div className="navbar">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="nav-brand">DGS <span style={{ color: 'var(--text-muted)', fontSize: '0.6em', fontWeight: '400' }}>Dealer</span></div>
                    <div style={{ fontSize: '1rem', color: '#aaa', marginTop: '-5px' }}>Hi, {user?.name}</div>
                </div>
                <button onClick={logout} className="btn btn-logout">Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '30px' }}>
                {/* Inventory Management */}
                <div className="card">
                    <h3>Manage Inventory</h3>
                    <p style={{ fontSize: '0.9em', color: '#888' }}>Select an item below to edit, or enter new details to add.</p>

                    <form onSubmit={handleAddProduct}>
                        <label>Metal Type</label>
                        <select
                            value={newProduct.metal_type}
                            onChange={(e) => setNewProduct({ ...newProduct, metal_type: e.target.value })}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#333', color: 'white', border: 'none' }}
                        >
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                        </select>
                        <label>Price / gram ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newProduct.price_per_gram}
                            onChange={(e) => setNewProduct({ ...newProduct, price_per_gram: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#333', color: 'white', border: 'none' }}
                        />
                        <label>Stock (grams)</label>
                        <input
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#333', color: 'white', border: 'none' }}
                        />
                        <button className="btn btn-primary" style={{ width: '100%' }}>Update / Add Product</button>
                    </form>

                    <h4 style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '10px' }}>Current Inventory</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {inventory.map(p => (
                            <li
                                key={p._id}
                                style={{
                                    background: '#222', padding: '10px', marginBottom: '8px', borderRadius: '5px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #333'
                                }}
                                onClick={() => {
                                    setNewProduct({ metal_type: p.metal_type, price_per_gram: p.price_per_gram, stock: p.stock });
                                    toast.info(`Editing ${p.metal_type.toUpperCase()}`);
                                }}
                                title="Click to Edit"
                            >
                                <div>
                                    <strong style={{ color: 'var(--primary)', display: 'block' }}>{p.metal_type.toUpperCase()}</strong>
                                    <span style={{ fontSize: '0.9em', color: '#ccc' }}>${p.price_per_gram}/g</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '1.1em', fontWeight: 'bold' }}>{p.stock}g</span>
                                    <span style={{ fontSize: '0.8em', color: '#666' }}>stock</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Orders */}
                <div className="card">
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>Incoming Orders</h3>

                    {orders.filter(o => o.status === 'pending').length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                            No pending orders
                        </div>
                    ) : null}

                    {orders.filter(o => o.status === 'pending').map(order => (
                        <div key={order._id} style={{
                            background: 'rgba(255,255,255,0.03)', padding: '20px', marginBottom: '15px', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: order.type === 'sell' ? 'var(--accent)' : 'var(--success)' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '0.85em', color: '#888', marginBottom: '5px' }}>{new Date(order.timestamp).toLocaleString()}</div>
                                    <div style={{ fontSize: '1.1em' }}>
                                        <strong>{order.customer_id.name}</strong> wants to
                                        <strong style={{ color: order.type === 'sell' ? 'var(--accent)' : 'var(--success)', marginLeft: '5px' }}>{order.type === 'sell' ? 'SELL' : 'BUY'}</strong>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: 'white' }}>{order.quantity}g</div>
                                    <div style={{ fontSize: '0.9em', color: order.metal_type === 'gold' ? 'var(--primary)' : 'var(--secondary)', fontWeight: 'bold' }}>{order.metal_type.toUpperCase()}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px' }}>
                                <span style={{ color: '#aaa' }}>Total Amount:</span>
                                <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--primary)' }}>${order.amount}</span>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleApprove(order._id)}>
                                {order.type === 'sell' ? 'Approve Purchase & Pay' : 'Approve Sale & Ship'}
                            </button>
                        </div>
                    ))}

                    <h4 style={{ marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent History</h4>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                        {orders.filter(o => o.status !== 'pending').map(order => (
                            <div key={order._id} style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '15px 5px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <strong style={{ color: order.metal_type === 'gold' ? 'var(--primary)' : 'var(--secondary)' }}>{order.metal_type.toUpperCase()}</strong>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.7em',
                                            background: order.type === 'sell' ? 'rgba(255,77,77,0.1)' : 'rgba(0,255,136,0.1)',
                                            color: order.type === 'sell' ? 'var(--accent)' : 'var(--success)'
                                        }}>{order.type.toUpperCase()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                                        {new Date(order.timestamp).toLocaleDateString()} • {order.customer_id.name}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: '#fff' }}>${order.amount}</div>
                                    <div style={{ fontSize: '0.8em', color: order.status === 'completed' ? 'var(--success)' : 'orange' }}>{order.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealerDashboard;
