"use client";

import { useState, useContext } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Image as ImageIcon, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserContext } from "../../../context/UserContext";
import { changeProfileImage, verifyPassword } from "../../../utils/api";

export default function ChangeImage() {
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { user } = useContext(UserContext);

  const handleChangeAvatar = async (e) => {
    e.preventDefault();

    if (!newAvatarUrl || !password) {
      setError("Both avatar URL and password are required.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const isPasswordValid = await verifyPassword(user.user_id, password);
    if (!isPasswordValid) {
      setError("Incorrect Password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await changeProfileImage(user.user_id, newAvatarUrl);
      setSuccess(response.message);

      /*logout user*/
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      setTimeout(() => {
        window.location.href = "/pages/login";
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Change Your User Avatar
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleChangeAvatar}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="avatar-url-container">
                <label htmlFor="new-avatar-url" className="sr-only">
                  New Avatar URL
                </label>
                <div className="relative">
                  <input
                    id="new-avatar-url"
                    name="new-avatar-url"
                    type="url"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="New Avatar URL"
                    value={newAvatarUrl}
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <ImageIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="password-container-box">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="error-message-box rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="success-message-box rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {success}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="submit-button-container">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                ) : (
                  <ImageIcon className="h-5 w-5 mr-2" />
                )}
                {isLoading ? "Changing avatar..." : "Change avatar"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
