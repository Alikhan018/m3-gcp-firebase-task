import { getDoc, DocumentReference, Timestamp, doc } from "firebase/firestore";
import { db } from "../../configs/firebase.config";

interface UserProfile {
    id: string;
    count: number;
    updatedAt: Date;
}

// Assuming you have a helper that returns a typed reference:
function userDocRef(uid: string): DocumentReference {
    // Example: adjust based on your Firestore structure
    return doc(db, "users", uid);
}

export async function getUserByUid(uid: string): Promise<UserProfile | null> {
    if (!uid) return null;

    const ref = userDocRef(uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data();

    return {
        id: snap.id,
        count: data.count ?? 0,
        updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
    };
}
