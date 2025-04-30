import { useEffect, useState } from "react";
import Navbar from "../components/organisms/Navbar";
import { auth } from "../config/firebaseConfig";

export default function MainLayout({ children }) {
    const [loginUser, setLoginUser] = useState(null); // Inisialisasi dengan null
    const [loading, setLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setLoginUser(user);
            setLoading(false); // Set loading ke false setelah status diketahui
        });

        // Unsubscribe listener saat komponen unmount
        return () => unsubscribe();
    }, []);

    if (loading) {
        // Tampilkan indikator loading jika status belum diketahui
        return <div>Loading...</div>;
    }

    return (
        <div className="relateive min-h-screen flex flex-col">
            <Navbar loginUser={loginUser} />
            {children}
        </div>
    );
}