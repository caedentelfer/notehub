"use client";

import { useState, useContext } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Trash2, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserContext } from "../../../context/UserContext";
import { deleteUser, verifyPassword } from "../../../utils/api";

export default function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { user } = useContext(UserContext);

  /*delete user account by deleting all associated notes then the user from 'user' table*/
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (!confirmDelete) {
      setError(
        "Please confirm you want to delete your account, noting it's irreversible."
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const isPasswordValid = await verifyPassword(user.user_id, password);
      if (!isPasswordValid) {
        setError("Incorrect password.");
        setIsLoading(false);
        return;
      }

      /*delete user account*/
      const response = await deleteUser(user.user_id);
      setSuccess(response.message);

      /*logout user*/
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      window.location.href = "/pages/login"; /*redirect back to login page*/
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
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 delete-account-header">
              Delete Your Account
            </h2>
          </div>
          <form
            className="mt-8 space-y-6 delete-account-form"
            onSubmit={handleDeleteAccount}
          >
            <div className="rounded-md shadow-sm -space-y-px">
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
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm password-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center confirm-delete-container">
              <input
                id="confirm-delete"
                name="confirm-delete"
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded confirm-delete-checkbox"
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
                disabled={isLoading}
              />
              <label
                htmlFor="confirm-delete"
                className="ml-2 block text-sm text-gray-900 confirm-delete-label"
              >
                I understand that this action is irreversible and I want to
                delete my account.
              </label>
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

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 delete-account-button"
                disabled={isLoading || !confirmDelete}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5 mr-3 loading-icon" />
                ) : (
                  <Trash2 className="h-5 w-5 mr-2 button-icon" />
                )}
                {isLoading ? "Deleting account..." : "Delete account"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
