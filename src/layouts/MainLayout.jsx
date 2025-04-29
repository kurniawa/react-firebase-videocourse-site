import { useState } from "react";
import Navbar from "../components/organisms/Navbar";
import { auth } from "../config/firebaseConfig";

export default function MainLayout({ children }) {
    const loginUser = auth.currentUser;
    return (
        <div className="relateive min-h-screen flex flex-col">
            <Navbar loginUser={loginUser} />
            {children}
        </div>
    );
}
