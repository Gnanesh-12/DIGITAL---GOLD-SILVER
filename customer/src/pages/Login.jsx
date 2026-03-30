import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const { login, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('credentials'); // credentials | otp
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (step === 'credentials') {
            const res = await login(formData.email, formData.password);
            if (res.success) {
                if (res.otpSent) {
                    setStep('otp');
                } else {
                    // Fallback if OTP disabled or auto-login
                    redirectUser(res.role);
                }
            } else {
                setError(res.message);
            }
        } else {
            // Verify OTP
            const res = await verifyOTP(formData.email, otp);
            if (res.success) {
                redirectUser(res.role);
            } else {
                setError(res.message);
            }
        }
    };

    const redirectUser = (role) => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'dealer') navigate('/dealer');
        else navigate('/');
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '400px', padding: '40px', border: '1px solid var(--primary)' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '30px', fontSize: '2em' }}>
                    {step === 'credentials' ? 'Customer Portal Login' : 'Verify Login'}
                </h2>
                {error && <div style={{ background: 'rgba(255, 77, 77, 0.2)', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {step === 'credentials' ? (
                        <>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Email Address</label>
                                <input type="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="Enter your email" />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label>Password</label>
                                <input type="password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Enter your password" />
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1em' }}>Login & Send OTP</button>
                        </>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <p style={{ textAlign: 'center', color: '#ccc', marginBottom: '20px' }}>
                                Enter the 6-digit code sent to <br /><strong style={{ color: 'white' }}>{formData.email}</strong>
                            </p>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ textAlign: 'center' }}>One-Time Password (OTP)</label>
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
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1em' }}>Verify Code</button>
                            <button type="button" onClick={() => setStep('credentials')} style={{ background: 'none', border: 'none', color: '#aaa', width: '100%', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</button>
                        </div>
                    )}
                </form>

                {step === 'credentials' && (
                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa' }}>
                        New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Create Account</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
