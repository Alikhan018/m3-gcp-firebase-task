import { useEffect, useState } from "react";
import socket from "../socket/socket";
import type { User } from "firebase/auth";
import { getUserByUid } from "../lib/firebase/users";

function Counter({ user }: { user: User }) {
    const [count, setCount] = useState(0);


    useEffect(() => {
        if (!user?.uid) return;

        const fetchUserCount = async () => {
            try {
                const allUserData = await getUserByUid(user.uid);
                if (allUserData) {
                    setCount(allUserData.count);
                } else {
                    console.warn("User data not found in Firestore:", user.uid);
                }
            } catch (err) {
                console.error("Error fetching user count:", err);
            }
        };

        fetchUserCount();
    }, [user?.uid]);

    useEffect(() => {
        // Only set up socket listener if user exists
        if (!user?.uid) return;

        // Join the user's room
        socket.emit('join', user.uid);
        const handleCountUpdate = (data: any) => {
            console.log('Received count update:', data);
            if (data.userId === user.uid) {
                setCount(data.count);
            }
        };
        socket.on("countUpdated", handleCountUpdate);
        return () => {
            socket.off("countUpdated", handleCountUpdate);
        };
    }, [user?.uid]); // Safe optional chaining

    const increment = async () => {
        if (!user?.uid) {
            console.error('User not authenticated');
            return;
        }

        try {
            const token = await user.getIdToken();
            setCount(prev => ++prev)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/increment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}) // Add empty JSON body to satisfy Fastify
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                setCount(prev => --prev)
            }

            const data = await response.json();
            // Update local state immediately for better UX
            setCount(data.count);
        } catch (error) {
            console.error('Error incrementing counter:', error);
            setCount(prev => --prev)
        }
    };
    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Your Count: {count}</h2>
            <button onClick={increment} disabled={!user?.uid}>
                Click Me!
            </button>
            <p>User: {user.email || user.uid}</p>
        </div>
    );
}

export default Counter;