import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'wouter'
import '../index.css'
import '../refined_theme.css'

import { useToast } from '../components/ToastContext'

const Login = () => {
    const [, setLocation] = useLocation();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            const { doc, getDoc } = await import('firebase/firestore');
            const { auth, db } = await import('../firebase');

            // 1. Sign In
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // 2. Fetch User Role from Firestore with Timeout
            const docRef = doc(db, "users", user.uid);
            
            // Create a race between fetch and timeout
            const fetchPromise = getDoc(docRef);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Request timed out - Please check your network or adblocker")), 10000)
            );

            try {
                const docSnap = await Promise.race([fetchPromise, timeoutPromise]);
                
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    localStorage.setItem('user', JSON.stringify({ uid: user.uid, ...userData }));
                    addToast(`Welcome back, ${userData.firstName}!`, 'success');
                    
                    if (userData.role === 'creator') setLocation('/dashboard/creator');
                    else setLocation('/dashboard/fan');
                    return;
                }
            } catch (timeoutErr) {
                // If auth worked but DB timed out, fallback to limited mode
                console.warn("Firestore timed out, falling back to limited mode");
                
                const limitedUser = {
                    uid: user.uid,
                    email: user.email,
                    firstName: 'User',
                    lastName: '',
                    role: 'fan', // Default fallback
                    isLimitedMode: true
                };
                
                localStorage.setItem('user', JSON.stringify(limitedUser));
                addToast("Network restrictions detected. Entering Limited Mode.", 'info');
                setLocation('/dashboard/fan');
                return;
            }

            throw new Error("Profile not found in database.");

        } catch (err) {
            console.error("Login Error Details:", err);
            
            let message = `Login failed: ${err.message}`;
            
            if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("timed out"))) {
                message = "Network Error: Please disable McAfee WebAdvisor or other Antivirus extensions for this site.";
            } else if (err.code === 'auth/invalid-credential') {
                message = "Invalid email or password.";
            } else if (err.code === 'unavailable') {
                message = "Service unavailable. Check your internet connection.";
            }

            addToast(message, 'error');
            setLoading(false);
        }
    }

    return (
        <div className="modern-app" style={{ overflow: 'hidden', minHeight: '100vh', position: 'relative' }}>
            {/* Background Elements */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            {/* Navigation */}
            <nav className="glass-nav" style={{ background: 'rgba(255,255,255,0.85)', justifyContent: 'space-between', padding: '1rem 2rem', display: 'flex', alignItems: 'center' }}>
                <Link href="/">
                    <div className="logo interactive" style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.5rem' }}>Giftify.</div>
                </Link>
                <Link href="/">
                    <button className="nav-item interactive" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Back to Home</button>
                </Link>
            </nav>

            {/* Login Container */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
                <motion.div
                    className="glass-dashboard"
                    style={{
                        maxWidth: '400px',
                        padding: '2rem',
                        borderRadius: '24px',
                        transform: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        margin: '1rem'
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--c-text-muted)' }}>Enter your credentials to access your account</p>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleLogin}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Email</label>
                            <input type="email" name="email" placeholder="you@example.com" className="newsletter-input" required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
                            <input type="password" name="password" placeholder="••••••••" className="newsletter-input" required />
                        </div>

                        <button
                            disabled={loading}
                            className="btn-primary interactive"
                            style={{
                                background: loading ? '#94A3B8' : 'var(--grad-primary)',
                                border: 'none',
                                padding: '12px',
                                marginTop: '0.5rem',
                                width: '100%',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div> Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--c-text-muted)' }}>
                        Don't have an account? <Link href="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Login
