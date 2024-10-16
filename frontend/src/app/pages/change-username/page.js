"use client";

import { useState, useContext } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { User, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserContext } from "../../../context/UserContext";
import { changeUsername, verifyPassword } from "../../../utils/api";

export default function ChangeUsername() {
  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { user } = useContext(UserContext);

  const handleChangeUsername = async (e) => {
    e.preventDefault();

    if (!newUsername || !password) {
      setError("Both username and password are required.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    /* Verify incoming password against db*/
    const isPasswordValid = await verifyPassword(user.user_id, password);
    if (!isPasswordValid) {
      setError("Incorrect Password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await changeUsername(user.user_id, newUsername);
      setSuccess(response.message);

      /*logout user*/
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      /*clears all necessary cookies*/

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
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 change-username-header container">
              Change Your Username
            </h2>
          </div>
          <form
            className="mt-8 space-y-6 change-username-form"
            onSubmit={handleChangeUsername}
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label
                  htmlFor="new-username"
                  className="sr-only new-username-label"
                >
                  New Username
                </label>
                <div className="relative new-username-input-container">
                  <input
                    id="new-username"
                    name="new-username"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm new-username-input"
                    placeholder="New Username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={isLoading}
                  />
                  <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 username-icon" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only password-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm password-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 error-message-container">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 error-message">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4 success-message-container">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 success-message">
                      {success}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 change-username-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5 mr-3 loading-icon" />
                ) : (
                  <User className="h-5 w-5 mr-2 button-icon" />
                )}
                {isLoading ? "Changing username..." : "Change username"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
