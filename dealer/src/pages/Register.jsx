import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
    const { register, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'customer', company_name: ''
    });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('details'); // details | otp
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (step === 'details') {
            const res = await register(formData);
            if (res.success) {
                if (res.otpSent) {
                    toast.success('Generated OTP sent to email!');
                    setStep('otp');
                } else {
                    toast.success('Registration successful! Please login.');
                    navigate('/login');
                }
            } else {
                setError(res.message);
            }
        } else {
            // Verify
            const res = await verifyOTP(formData.email, otp);

            if (res.success) {
                // Check if it's a new dealer waiting for approval
                if (res.pendingApproval) {
                    toast.info('Email Verified! Account pending Admin Approval. Please check back later.');
                    navigate('/login');
                } else {
                    toast.success('Account Verified & Logged In!');
                    if (res.role === 'admin') navigate('/admin');
                    else if (res.role === 'dealer') navigate('/dealer');
                    else navigate('/');
                }
            } else {
                setError(res.message);
            }
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '400px', padding: '40px', border: '1px solid var(--primary)' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '30px', fontSize: '2em' }}>
                    {step === 'details' ? 'Join DGS' : 'Verify Email'}
                </h2>
                {error && <div style={{ background: 'rgba(255, 77, 77, 0.2)', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {step === 'details' ? (
                        <>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Full Name</label>
                                <input type="text" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label>Email Address</label>
                                <input type="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="john@example.com" />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label>Password</label>
                                <input type="password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="••••••••" />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label>Account Type</label>
                                <select onChange={(e) => setFormData({ ...formData, role: e.target.value })} value={formData.role} style={{ cursor: 'pointer' }}>
                                    <option value="customer">Customer</option>
                                    <option value="dealer">Dealer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {formData.role === 'dealer' && (
                                <div style={{ marginBottom: '15px', animation: 'fadeIn 0.3s' }}>
                                    <label>Company Name</label>
                                    <input type="text" onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required placeholder="Gold Traders Inc." />
                                </div>
                            )}

                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', fontSize: '1.1em' }}>Create & Send OTP</button>
                        </>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <p style={{ textAlign: 'center', color: '#ccc', marginBottom: '20px' }}>
                                Enter the 6-digit code sent to <br /><strong style={{ color: 'white' }}>{formData.email}</strong>
                            </p>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ textAlign: 'center' }}>Verification Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    placeholder="e.g. 123456"
                                    maxLength="6"
                                    style={{ textAlign: 'center', fontSize: '1.5em', letterSpacing: '5px' }}
                                />
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1em' }}>Verify & Create Account</button>
                            <button type="button" onClick={() => setStep('details')} style={{ background: 'none', border: 'none', color: '#aaa', width: '100%', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' }}>Back</button>
                        </div>
                    )}
                </form>

                {step === 'details' && (
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Register;
