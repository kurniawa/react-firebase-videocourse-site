import { useEffect, useState } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";

export default function TestGetAllUser() {
    const [users, setUsers] = useState<{ id: number; fullName: string; email: string }[]>([]);
    
    useEffect(() => {
        axios.get("https://videobelajar-react-lsbnmnxbb-adi-kurniawans-projects.vercel.app/api/users")
            .then((response: AxiosResponse) => {
                console.log("Response:", response.data);
                setUsers(response.data);
            })
            .catch((err: AxiosError) => {
                console.error("Error fetching users:", err);
            });
    }, []);

    return (
        <div>
            <h1>List of Users</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.fullName} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
}
