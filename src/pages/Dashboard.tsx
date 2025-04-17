import { useNavigate } from "react-router-dom";
import EditProfile from "../components/organisms/EditProfile";
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import ValidationFeedbackWithSpinner from "../components/molecules/ValidationFeedbackWithSpinner";

interface DashboardProps {
    type: string;
}

function Dashboard({ type }: DashboardProps) {
    const navigate = useNavigate();
    const [loginUser] = useState(() => {
        return JSON.parse(localStorage.getItem("login_user") || "null");
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loginUser) {
            setError("Anda belum login. Redirecting ke halaman login...");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        }
    }, [loginUser, navigate]); // Tambahkan dependency

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
