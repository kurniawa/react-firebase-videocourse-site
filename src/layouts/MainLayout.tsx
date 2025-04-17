import { ReactNode, useState } from "react";
import Navbar from "../components/organisms/Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [loginUser] = useState(() => {
        return JSON.parse(localStorage.getItem("login_user") || "null");
    });
    return (
        <div className="relateive min-h-screen flex flex-col">
            <Navbar loginUser={loginUser} />
            {children}
        </div>
    );
}
