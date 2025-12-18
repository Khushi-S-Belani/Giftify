import React, { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { Link as LinkIcon, Shield, ArrowLeft, RefreshCw } from 'lucide-react'
import { useToast } from '../components/ToastContext'
import '../index.css'
import '../refined_theme.css'

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { collection, getDocs } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setUsers(usersList);
            setLoading(false);
        } catch (err) {
            addToast("Failed to fetch users", 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { role: newRole });
            
            fetchUsers(); // Refresh list
            addToast(`Role updated to ${newRole}`, 'success');
        } catch (error) {
            addToast('Error updating role', 'error');
        }
    };

    const fans = users.filter(u => u.role === 'fan');
    const creators = users.filter(u => u.role === 'creator');

    return (
        <div className="modern-app" style={{ minHeight: '100vh', background: '#0F172A', padding: '2rem', color: '#F1F5F9' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/">
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', fontWeight: 600 }}>
                            <ArrowLeft size={18} /> Back Home
                        </button>
                    </Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Shield size={32} color="#60A5FA" /> Admin Dashboard
                    </h1>
                    <div style={{ background: '#1E293B', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #334155', fontWeight: 600, color: '#94A3B8' }}>
                        Total Users: {users.length}
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    {/* Creators Section */}
                    <Section 
                        title="Creators" 
                        users={creators} 
                        icon="🦁" 
                        color="#059669" 
                        borderColor="#10B981" 
                        textColor="#D1FAE5"
                        bg="#132a24"
                        onRoleChange={handleRoleChange}
                        targetRole="fan"
                    />

                    {/* Fans Section */}
                    <Section 
                        title="Fans" 
                        users={fans} 
                        icon="🦄" 
                        color="#2563EB" 
                        borderColor="#3B82F6" 
                        textColor="#DBEAFE"
                        bg="#172554"
                        onRoleChange={handleRoleChange}
                        targetRole="creator"
                    />
                </div>
            </div>
        </div>
    )
}

const Section = ({ title, users, icon, color, borderColor, textColor, bg, onRoleChange, targetRole }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: '#1E293B', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', border: '1px solid #334155' }}
    >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <span>{icon}</span> {title}
            <span style={{ fontSize: '0.9rem', background: '#334155', padding: '2px 8px', borderRadius: '99px', color: '#CBD5E1', marginLeft: 'auto' }}>
                {users.length}
            </span>
        </h2>

        {users.length === 0 ? (
            <p style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No {title.toLowerCase()} yet.</p>
        ) : (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: '0.9rem', borderBottom: '1px solid #334155' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Role</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '1rem', color: '#64748B' }}>#{user.id}</td>
                                <td style={{ padding: '1rem', fontWeight: 600, color: '#E2E8F0' }}>{user.firstName} {user.lastName}</td>
                                <td style={{ padding: '1rem', color: '#94A3B8' }}>{user.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        background: bg, 
                                        border: `1px solid ${color}`, // subtle border
                                        color: textColor, // bright text
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button 
                                        onClick={() => onRoleChange(user.id, targetRole)}
                                        style={{ 
                                            background: 'transparent',
                                            border: '1px solid #475569',
                                            color: '#94A3B8',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#94A3B8';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#475569';
                                            e.currentTarget.style.color = '#94A3B8';
                                        }}
                                    >
                                        <RefreshCw size={14} />
                                        Switch to {targetRole === 'fan' ? 'Fan' : 'Creator'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </motion.div>
)

export default AdminDashboard
