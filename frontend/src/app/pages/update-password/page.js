"use client";

import { useContext } from "react";
import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import { updatePassword, verifyPassword } from "../../../utils/api";
import { UserContext } from "../../../context/UserContext";

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const { user } =
    useContext(UserContext); /*access all user information from context*/
  const router = useRouter();

  useEffect(() => {
    /*extract password resetToken*/
    const resetToken = new URLSearchParams(window.location.search).get("token");

    if (resetToken) {
      try {
        /*verify reset token */
        const decoded = jwt.verify(
          resetToken,
          process.env.NEXT_PUBLIC_JWT_SECRET
        );
        if (typeof decoded !== "string" && "email" in decoded) {
          setEmail(decoded.email); /*set email for password reset purposes*/
        } else {
          setError("Invalid token payload");
        }
      } catch (err) {
        setError("Invalid or expired reset token");
      }
    } else {
      setError("No token provided");
    }

    /*retrieve the auth token (for the logged-in user)*/
    const authToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!authToken) {
      setError("User is not authenticated");
    }
  }, [router]);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const isPasswordValid = await verifyPassword(user.user_id, currentPassword);
    if (!isPasswordValid) {
      setError("Incorrect current password.");
      return;
    }

    try {
      await updatePassword(email, newPassword);

      setUpdateSuccess(true);
      setError("");

      /*redirect to notes page*/
      setTimeout(() => {
        router.push("/pages/notes");
      }, 1000); /*authentication error here sometimes*/
    } catch (err) {
      setError(err.message);
    }
  };

  const changePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex flex-col min-h-screen update-password-container">
      <Header />
      <div className="flex-grow bg-gray-50">
        <main className="container mx-auto px-6 py-10 max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 update-password-header">
            Update Your Password
          </h1>

          <div className="bg-white shadow-md rounded-lg p-6 space-y-4 update-password-form">
            {/*curr password*/}
            <div className="current-password">
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 mb-1 current-password-label"
              >
                Current Password
              </label>
              <div className="relative current-password-input">
                <input
                  id="current-password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-black"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 current-password-icon" />
              </div>
            </div>

            {/*new password*/}
            <div className="new-password">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 mb-1 new-password-label"
              >
                New Password
              </label>
              <div className="relative new-password-input">
                <input
                  id="new-password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-black"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 new-password-icon" />
              </div>
            </div>

            {/*confirm new password*/}
            <div className="confirm-password">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1 confirm-password-label"
              >
                Confirm Password
              </label>
              <div className="relative confirm-password-input">
                <input
                  id="confirm-password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-black"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 confirm-password-icon" />
                <button
                  type="button"
                  onClick={changePasswordVisibility}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none change-password-visibility"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/*update password button*/}
            <button
              onClick={handleUpdatePassword}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 update-password-button"
            >
              Update Password
            </button>

            {/*error message*/}
            {error && (
              <div className="text-red-500 mt-4 text-center error-message">
                {error}
              </div>
            )}

            {/*success message*/}
            {updateSuccess && (
              <div className="text-center text-green-600 mt-4 update-password-success-message">
                <CheckCircle className="inline h-5 w-5 mr-2 -mt-1 update-password-success-icon" />
                Your password has been successfully updated.
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
