import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../configs/firebase.config';
import { useAuth } from '../context/AuthContext';

export default function AuthForm() {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const handleLogin = async () => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (user) {
        return (
            <div>
                <p>Logged in as {user.email}</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        );
    }

    return (
        <div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button onClick={handleSignup}>Sign Up</button>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}