import { useNavigate } from "react-router-dom";
import LoginForm from "../components/organisms/LoginForm"
import MainLayout from "../layouts/MainLayout"
import { useEffect, useState } from "react";
import ValidationFeedback from "../components/atoms/ValidationFeedback";
import LoadingSpinner from "../components/molecules/LoadingSpinner";

function Login() {
    const navigate = useNavigate();

    const [loginUser] = useState(() => {
            return JSON.parse(localStorage.getItem("login_user") || "null");
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loginUser) {
            setError("Anda sudah login. Redirecting ke halaman dashboard...");
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        }
    }, [loginUser, navigate]); // Tambahkan dependency

    

    return (
        <MainLayout>
            <div>
                {error && <>
                    <div className="flex justify-center">
                        <ValidationFeedback type="error" message={error} />
                    </div>
                    <LoadingSpinner />
                </>}
            </div>
            <main className="px-[20px] py-[28px] flex justify-center xl:py-[64px] xl:px-[120px]">
                <LoginForm />
            </main>
        </MainLayout>
    )
}

export default Login