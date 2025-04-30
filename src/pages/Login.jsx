import { useNavigate } from "react-router-dom";
import LoginForm from "../components/organisms/LoginForm";
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import ValidationFeedback from "../components/atoms/ValidationFeedback";
import LoadingSpinner from "../components/molecules/LoadingSpinner";
import { auth } from "../config/firebaseConfig";

function Login() {
    const navigate = useNavigate();
    const [loginUser, setLoginUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setLoginUser(user);
            setLoading(false);
        });

        // Unsubscribe listener saat komponen unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!loading) {
            if (loginUser) {
                setError("Anda sudah login. Mengarahkan ke halaman dashboard...");
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1500);
            }
        }
    }, [loginUser, loading, navigate]);

    return (
        <MainLayout>
            <div>
                {error && (
                    <>
                        <div className="flex justify-center">
                            <ValidationFeedback type="error" message={error} />
                        </div>
                        <LoadingSpinner />
                    </>
                )}
            </div>
            <main className="px-[20px] py-[28px] flex justify-center xl:py-[64px] xl:px-[120px]">
                {!loginUser && <LoginForm />} {/* Tampilkan LoginForm hanya jika belum login */}
            </main>
        </MainLayout>
    );
}

export default Login;