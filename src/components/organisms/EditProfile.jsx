import { useEffect, useRef, useState } from "react";
import ButtonDashboard from "../atoms/ButtonDashboard";
import InputForEditProfile from "../atoms/InputForEditProfile";
import InputPhoneNumberEP from "../atoms/InputPhoneNumberEP";
import LineHorizontal from "../atoms/LineHorizontal";
import SelectForEditProfile from "../atoms/SelectForEditProfile";
import ButtonLime500 from "../atoms/ButtonLime500";
import Footer from "./Footer";
import InputPasswordEP from "../atoms/InputPasswordEP";
import ValidationFeedback from "../atoms/ValidationFeedback";
import LoadingSpinner from "../molecules/LoadingSpinner";

import { updateProfile, updateEmail } from 'firebase/auth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../../config/firebaseConfig'; // Pastikan path ini benar

import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const EditProfile = ({type, loginUser}) => {
    let arrayButtonDashboard = [
        { active: type === "PROFILE", label: "Profil Saya" },
        { active: type === "MY-CLASS", label: "Kelas Saya" },
        { active: type === "MY-ORDER", label: "Pesanan Saya" }
    ];

    // State untuk mengelola nilai input
    const [fullName, setFullName] = useState(loginUser?.fullName || "");
    const [email, setEmail] = useState(loginUser?.email || "");
    const [gender, setGender] = useState(loginUser?.gender || "");
    const [countryCode, setCountryCode] = useState(loginUser?.countryCode || "");
    const [phoneNumber, setPhoneNumber] = useState(loginUser?.phoneNumber || "");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [profilePicturePath, setProfilePicture] = useState(loginUser?.profilePicturePath || "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Ref untuk elemen file input foto profil
    const profilePicturePathRef = useRef(null);
    // const phoneNumberRef = useRef({}); // Tambahkan ref untuk countryCode

    useEffect(() => {
        // Set nilai state berdasarkan data loginUser saat komponen mount atau loginUser berubah
        if (loginUser) {
            setFullName(loginUser.fullName || "");
            setEmail(loginUser.email || "");
            setGender(loginUser.gender || "");
            setCountryCode(loginUser.countryCode || "");
            setPhoneNumber(loginUser.phoneNumber || "");
            setProfilePicture(loginUser.profilePicturePath || "");
        }
    }, [loginUser]);

    const handleInputChange = (name, value) => {
        switch (name) {
            case 'fullName':
                setFullName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'gender':
                setGender(value);
                break;
            case 'countryCode':
                setCountryCode(value);
                break;
            case 'phoneNumber':
                setPhoneNumber(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'passwordConfirmation':
                setPasswordConfirmation(value);
                break;
            default:
                break;
        }
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const fullName = fullName; // Menggunakan state
        const email = email; // Menggunakan state
        const gender = gender; // Menggunakan state
        const countryCode = countryCode; // Menggunakan state
        const phoneNumber = phoneNumber; // Menggunakan state
        const password = password; // Menggunakan state
        const passwordConfirmation = passwordConfirmation; // Menggunakan state
        const phoneNumberFull = `${countryCode}${phoneNumber.replace(/^0+/, "")}`;

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
            // TODO: Implement update password using Firebase Auth
            console.log("Update password functionality needs to be implemented.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Format email tidak valid");
            setLoading(false);
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                // Update display name dan email di Firebase Authentication
                const updates = {};
                if (fullName !== user.displayName) {
                    updates.displayName = fullName;
                }
                if (email !== user.email) {
                    await updateEmail(user, email);
                    updates.email = email; // Optional: Update local state if needed
                }
                if (Object.keys(updates).length > 0) {
                    await updateProfile(user, updates);
                    console.log("Firebase Auth profile updated.");
                }

                // Update data profil lainnya di Firestore
                const userDocRef = doc(db, 'users', user.uid); // Asumsi koleksi 'users'
                await updateDoc(userDocRef, {
                    fullName: fullName,
                    gender: gender,
                    phoneNumber: phoneNumber.replace(/^0+/, ""),
                    phoneNumberFull: phoneNumberFull,
                    // Jangan update email dan displayName di sini karena sudah diupdate di Auth
                });
                console.log("Firestore profile updated.");

                // Update localStorage (sesuaikan dengan data yang Anda simpan)
                const updatedUserForLocal = { ...loginUser, fullName, email, gender, countryCode, phoneNumber };
                localStorage.setItem("login_user", JSON.stringify(updatedUserForLocal));

                setSuccess("Profil berhasil diperbarui!");
                setError(null);
            } else {
                setError("Pengguna tidak ditemukan. Silakan login kembali.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setError(error.message || "Terjadi kesalahan saat menyimpan profil.");
            // Handle specific Firebase errors (e.g., email already in use)
            if (error.code === 'auth/email-already-in-use') {
                setError("Email sudah digunakan oleh akun lain.");
            }
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    };

    const storage = getStorage();
    const db = getFirestore();

    const handleEditProfilePicture = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        if (!profilePicturePathRef.current?.files?.[0]) {
            alert("Pilih gambar terlebih dahulu!");
            setLoading(false);
            return;
        }

        const file = profilePicturePathRef.current.files[0];
        const user = auth.currentUser;

        if (!user) {
            setError("Pengguna tidak ditemukan. Silakan login kembali.");
            setLoading(false);
            return;
        }

        // Buat nama file unik
        const uniqueFilename = `profile_pictures/${user.uid}_${Date.now()}_${uuidv4()}`;
        const storageRef = ref(storage, uniqueFilename);

        try {
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Observe state change events such as progress, pause, and resume:
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    // You can add progress updates to your UI here if needed
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.error("Error uploading image:", error);
                    setError("Gagal mengunggah gambar!");
                    setLoading(false);
                },
                async () => {
                    // Handle successful uploads on complete
                    // Get download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log('File available at', downloadURL);
                    setProfilePicture(downloadURL);

                    // Update Firestore
                    const userDocRef = doc(db, 'users', user.uid);
                    await updateDoc(userDocRef, {
                        profilePicturePath: downloadURL,
                        profilePicturePublicId: uniqueFilename // You might want to store the path/filename
                    });
                    console.log("Profile picture URL updated in Firestore.");

                    // Update localStorage
                    const updatedUserForLocal = { ...loginUser, profilePicturePath: downloadURL };
                    localStorage.setItem("login_user", JSON.stringify(updatedUserForLocal));

                    setSuccess("Foto profil berhasil diperbarui!");
                    setError(null);
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error("Error during upload or update:", error);
            setError("Gagal mengunggah dan memperbarui foto profil.");
            setLoading(false);
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
                            <InputForEditProfile label="Nama Lengkap" value={fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
                            <InputForEditProfile label="E-Mail" value={email} onChange={(e) => handleInputChange('email', e.target.value)} />
                            <InputPhoneNumberEP
                                label="No. Hp"
                                countryCodeValue={countryCode}
                                onCountryCodeChange={(e) => handleInputChange('countryCode', e.target.value)}
                                phoneNumberValue={phoneNumber}
                                onPhoneNumberChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            />
                        </div>
                        <div className="flex gap-[16px] flex-col justify-stretch xl:flex-row">
                            <SelectForEditProfile label="Jenis Kelamin" value={gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={[{ value: "Female", label: "Wanita" }, { value: "Male", label: "Pria" }]} />
                            <InputPasswordEP label="Password" value={password} onChange={(e) => handleInputChange('password', e.target.value)} />
                            <InputPasswordEP label="Konfirmasi Password" value={passwordConfirmation} onChange={(e) => handleInputChange('passwordConfirmation', e.target.value)} />
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