import { useNavigate } from "react-router-dom";
import EditProfile from "../components/organisms/EditProfile";
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import ValidationFeedbackWithSpinner from "../components/molecules/ValidationFeedbackWithSpinner";
import { auth, db } from "../config/firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';

function Dashboard({type}) {
    const [loginUser, setLoginUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            setLoginUser(user);
            setLoading(false);

            if (user) {
                // Pengguna login, ambil data profil dari Firestore
                setProfileLoading(true);
                setError(null);
                try {
                    const userDocRef = doc(db, 'users', user.uid); // Asumsi koleksi 'users' dan dokumen ID adalah UID pengguna
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        setProfileData(docSnap.data());
                        console.log('Data profil pengguna dari Firestore:', docSnap.data());
                    } else {
                        console.log('Dokumen pengguna tidak ditemukan di Firestore.');
                        setError('Data profil pengguna tidak ditemukan.');
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setError('Gagal mengambil data profil.');
                } finally {
                    setProfileLoading(false);
                }
            } else {
                // Pengguna logout, redirect
                navigate('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    if (loading) {
        return <div>Loading authentication status...</div>;
    }

    return (
        <MainLayout>
            <main>
                {error && <ValidationFeedbackWithSpinner type="error" message={error} />}
                {loginUser && <EditProfile type={type} loginUser={loginUser} />}
            </main>
        </MainLayout>
    );
}

export default Dashboard;
