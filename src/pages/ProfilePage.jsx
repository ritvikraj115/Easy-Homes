import React, { useEffect, useState } from 'react';
import apiClient from '../api'
import '../assets/ProfilePage.css';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '' });
    const [message, setMessage] = useState('');
useEffect(() => {
  async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;       // bail early if no JWT

    try {
      // NOTE: '/profile' here becomes GET /api/profile
      const { data } = await apiClient.get('/api/profile');
      console.log(data)
      setUser(data.user);
      setForm({ name: data.user.name, email: data.user.email });
    } catch (err) {
      console.error('Profile fetch error', err.response || err);
    }
  }
  fetchProfile();
}, []);

    const handleUpdate = async e => {
        e.preventDefault();
        const { data } = await apiClient.put('/api/profile', form);
        setUser(data.user);
        setMessage('Profile updated');
    };

    const handlePassword = async e => {
        e.preventDefault();
        try {
            await apiClient.post('/api/profile/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setMessage('Password changed');
            setPasswords({ current: '', new: '' });
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error');
        }
    };

    if (!user) return <p>Loading…</p>;

    return (
        <>
        <Navbar />
        <div className="profile-page">
            <h1>Profile</h1>
            {message && <div className="alert">{message}</div>}

            {/* Personal Info */}
            <section className="panel">
                <h2>Personal Info</h2>
                <form onSubmit={handleUpdate}>
                    <label>Name</label>
                    <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />

                    <label>Email</label>
                    <input
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />

                    <button type="submit">Save</button>
                </form>
            </section>

            {/* Sign in & Security */}
            <section className="panel">
                <h2>Sign in & Security</h2>
                <form onSubmit={handlePassword}>
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={passwords.current}
                        onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                    />

                    <label>New Password</label>
                    <input
                        type="password"
                        value={passwords.new}
                        onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                    />

                    <button type="submit">Change Password</button>
                </form>
            </section>
        </div>
        </>
    );
}
