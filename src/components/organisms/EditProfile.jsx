import { useEffect, useRef, useState } from "react";
import ButtonDashboard from "../atoms/ButtonDashboard";
import InputForEditProfile from "../atoms/InputForEditProfile";
import InputPhoneNumberEP from "../atoms/InputPhoneNumberEP";
import LineHorizontal from "../atoms/LineHorizontal";
import SelectForEditProfile from "../atoms/SelectForEditProfile";
import ButtonLime500 from "../atoms/ButtonLime500";
import Footer from "./Footer";
import InputPasswordEP from "../atoms/InputPasswordEP";
import { v4 as uuidv4 } from "uuid"; // Install dulu: npm install uuid
import axios from "axios";
import ValidationFeedback from "../atoms/ValidationFeedback";
import LoadingSpinner from "../molecules/LoadingSpinner";
// import { v2 as cloudinary } from 'cloudinary';

const EditProfile = ({type, loginUser}) => {
    let arrayButtonDashboard = [
        {
            active: type === "PROFILE" ? true : false,
            label: "Profil Saya"
        },
        {
            active: type === "MY-CLASS" ? true : false,
            label: "Kelas Saya"
        },
        {
            active: type === "MY-ORDER" ? true : false,
            label: "Pesanan Saya"
        }
    ]

    const fullNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const genderRef = useRef<HTMLSelectElement>(null);
    const countryCodeRef = useRef<HTMLSelectElement>(null);
    const phoneNumberRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const passwordConfirmationRef = useRef<HTMLInputElement>(null);
    
    const profilePicturePathRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        // Set nilai input berdasarkan data user yang sudah login
        if (fullNameRef.current) {
          fullNameRef.current.value = loginUser.fullName;
        }
        if (emailRef.current) {
          emailRef.current.value = loginUser.email;
        }
        if (genderRef.current) {
            genderRef.current.value = loginUser.gender;
        }
        if (countryCodeRef.current) {
            countryCodeRef.current.value = loginUser.countryCode;
        }
        if (phoneNumberRef.current) {
            phoneNumberRef.current.value = loginUser.phoneNumber;
        }
    }, [loginUser]); // Jalankan setiap kali loginUser berubah

    const [profilePicturePath, setProfilePicture] = useState(loginUser.profilePicturePath || "");

    useEffect(() => {
        // Load data dari localStorage jika ada
        const storedUser = localStorage.getItem("login_user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setProfilePicture(parsedUser.profilePicturePath || "");
        }
    }, []);

    const handleEditProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null); // Reset error sebelum upload
        setSuccess(null);
        const fullName = fullNameRef.current?.value?.trim() || "";
        const email = emailRef.current?.value?.trim() || "";
        const gender = genderRef.current?.value?.trim() || "";
        const countryCode = countryCodeRef.current?.value?.trim() || "";
        const phoneNumber = phoneNumberRef.current?.value?.trim() || "";
        const password = passwordRef.current?.value; // Jangan trim password
        const passwordConfirmation = passwordConfirmationRef.current?.value; // Jangan trim password
        let phoneNumberFull = "";

        if (!fullName || !email || !gender || !countryCode || !phoneNumber) {
            setError("Semua kolom wajib diisi!");
            setLoading(false);
            return;
        }
        
        if (password) {
            if (password.length < 8) {
                setError("Password minimal 8 karakter");
                setLoading(false);
                return;
            }
            if (password !== passwordConfirmation) {
                setError("Password dan Konfirmasi Password tidak sama");
                setLoading(false);
                return;
            }
        }

        // Validasi email dan nomor telepon
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Format email tidak valid");
            setLoading(false);
            return;
        }

        let phoneNumberTrimmedFrontZero = "";
        // Hilangkan angka 0 di depan nomor telepon
        phoneNumberTrimmedFrontZero = phoneNumber.replace(/^0+/, "");

        phoneNumberFull = `${countryCode}${phoneNumberTrimmedFrontZero}`;
        // console.log("Phone Number Full:", phoneNumberFull);

        try {
            const {data: allUsers} = await axios.get(
                `https://67c565bec4649b9551b67dc8.mockapi.io/api/v1/users`
            );
        
            if (allUsers.length !== 0) {
                // Lakukan pencocokan eksak di frontend
                const exactMatchEmail = allUsers.find((user) => (user.email === email && user.id !== loginUser.id));
                if (exactMatchEmail) {
                    setError("Email sudah terdaftar");
                    setLoading(false);
                    return;
                }

                const exactMatchPhoneNumberFull = allUsers.find((user) => (user.phoneNumberFull === phoneNumberFull && user.id !== loginUser.id));
                if (exactMatchPhoneNumberFull) {
                    setError("Nomor telepon sudah terdaftar");
                    setLoading(false);
                    return;
                }
            }

        } catch (err) {
            if (err.response?.status !== 404) { // Abaikan error 404 karena berarti email belum ada
                setError("Terjadi kesalahan saat memeriksa email dan nomor telepon");
                setLoading(false);
                return;
            }
        }

        let editedUser = {fullName, email, gender, countryCode, phoneNumber: phoneNumberTrimmedFrontZero, phoneNumberFull}
        if (password) {
            editedUser = {...editedUser, password}
        }
        try {
            await fetch(`https://67c565bec4649b9551b67dc8.mockapi.io/api/v1/users/${loginUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedUser),
            }).then(res => res.json())
            .then(updatedUser => {
                // Update localStorage
                const login_user = (({password, ...obj}) => obj)(updatedUser);
                localStorage.setItem("login_user", JSON.stringify(login_user));
            
                // (Opsional) Jika kamu punya state loginUser di React, update juga di situ
                // setLoginUser(updatedUser);
                
                // Tambahkan notifikasi atau redirect jika perlu
                console.log("Profile updated and localStorage synced.");
            })
            .catch(error => {
                console.error("Failed to update profile:", error);
            });
            setSuccess("Profil berhasil diperbarui!");
            setError(null); // Reset error jika berhasil
            setProfilePicture(loginUser.profilePicturePath || ""); // Reset foto profil ke yang lama jika tidak diubah
        } catch (error) {
            setError(error.message);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    }

    const handleEditProfilePicture = async () => {
        setLoading(true);
        setError(null); // Reset error sebelum upload
        setSuccess(null); // Reset success sebelum upload
        if (!profilePicturePathRef.current?.files?.[0]) {
            alert("Pilih gambar terlebih dahulu!");
            return;
        }

        const file = profilePicturePathRef.current.files[0];
        const formData = new FormData();

        // Buat nama unik dengan timestamp + UUID
        const uniqueFilename = `profile_${Date.now()}_${uuidv4()}`;

        formData.append("file", file);
        formData.append("upload_preset", "ml_default"); // Ganti dengan upload preset yang sesuai
        formData.append("folder", "profile_pictures"); // Ganti dengan folder yang sesuai
        formData.append("public_id", uniqueFilename); // Set nama unik

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/devktt8mf/image/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            // console.log("URL Gambar Baru:", data.secure_url);

            // Update profile picture di state
            setProfilePicture(data.secure_url);

            // Update localStorage
            const updatedUser = { ...loginUser, profilePicturePath: data.secure_url, profilePicturePublicId: data.public_id };
            localStorage.setItem("login_user", JSON.stringify(updatedUser));

            // Update MockAPI
            await fetch(`https://67c565bec4649b9551b67dc8.mockapi.io/api/v1/users/${loginUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profilePicturePath: data.secure_url, profilePicturePublicId: data.public_id }),
            });

            setSuccess("Foto profil berhasil diperbarui!");
            setError(null); // Reset error jika berhasil
        } catch (error) {
            console.error("Upload gagal:", error);
            setError("Gagal mengunggah gambar!");
        } finally {
            // Simulasi loading selama 1.5 detik
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    };

    return (
        <div className="">
            <form onSubmit={handleEditProfile} className="relative flex flex-col gap-[24px] px-[20px] py-[28px] xl:py-[64px] xl:px-[120px] xl:flex-row xl:gap-[36px]">
                {loading && <LoadingSpinner />}
                <div className="w-full xl:w-auto">
                    <div>
                        <h1 className="font-poppins font-[600] text-[20px]">Ubah Profil</h1>
                        <h2 className="font-dm-sans font-[400] text-[16px] mt-[10px]">Ubah data diri Anda</h2>
                    </div>
                    <div className="mt-[24px] border border-[#3A35411F] rounded-[10px] p-[20px] bg-white xl:p-[24px]">
                        <div className="flex flex-col gap-[8px]">
                            {arrayButtonDashboard.map((item, index) => (
                                <ButtonDashboard key={index} active={item.active} label={item.label} />
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="border border-[#3A35411F] rounded-[10px] bg-white p-[24px] flex flex-col gap-[24px] xl:grow xl:gap-[16px]">
                    <div className="flex gap-[14px]">
                        {/* Foto Profil */}
                        <div className="w-20">
                            {profilePicturePath ? <img src={profilePicturePath} alt="Profile" className="w-full h-20 rounded-[4px]" /> : 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-full">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            }
                        </div>

                        <div>
                            <div className="font-poppins font-[600] text-[16px] text-[#222325]">{loginUser.fullName}</div>
                            <div className="font-dm-sans font-[400] text-[16px] text-[#222325]">{loginUser.email}</div>
                            <label htmlFor="change-profile-picture" className="font-poppins font-[700] text-[14px] text-[#F64920] hover:cursor-pointer">
                                Ganti Foto Profil
                            </label>
                            <input type="file" name="" id="change-profile-picture" className="hidden" ref={profilePicturePathRef} onChange={handleEditProfilePicture} accept="image/png, image/gif, image/jpeg" />
                        </div>
                    </div>

                    <LineHorizontal />

                    <div className="flex flex-col gap-[16px] mt-2">
                        <div className="flex gap-[16px] flex-col xl:flex-row xl:justify-stretch">
                            <InputForEditProfile label="Nama Lengkap" ref={fullNameRef} />
                            <InputForEditProfile label="E-Mail" ref={emailRef} />
                            <InputPhoneNumberEP label="No. Hp" countryCodeRef={countryCodeRef} phoneNumberRef={phoneNumberRef} />
                        </div>
                        <div className="flex gap-[16px] flex-col justify-stretch xl:flex-row">
                            <SelectForEditProfile label="Jenis Kelamin" ref={genderRef} options={[{value: "Female", label: "Wanita"}, {value: "Male", label: "Pria"}]} />
                            <InputPasswordEP label="Password" ref={passwordRef} />
                            <InputPasswordEP label="Konfirmasi Password" ref={passwordConfirmationRef} />
                        </div>
                    </div>

                    {error && <ValidationFeedback type="error" message={error} />}
                    {success && <ValidationFeedback type="success" message={success} />}

                    <div className="flex justify-end">
                        <div className="w-full xl:w-[13%]">
                            <ButtonLime500 label="Simpan" type="submit" to={null} className=" w-full h-[34px] xl:h-[36px]" />
                        </div>
                    </div>
                </div>

            </form>

            <Footer />
        </div>
    );
}

export default EditProfile;