"use client";

import { useState, useContext } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Mail, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserContext } from "../../../context/UserContext";
import { changeEmail, verifyPassword } from "../../../utils/api";

export default function ChangeEmail() {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { user } = useContext(UserContext);

  /*function to deal with changing user email*/
  const handleChangeEmail = async (e) => {
    e.preventDefault();

    if (!newEmail || !password) {
      setError("Both email and password are required.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");

    /*verifies inputted user password with password in db*/
    const isPasswordValid = await verifyPassword(user.user_id, password);
    if (!isPasswordValid) {
      setError("Incorrect Password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await changeEmail(user.user_id, newEmail);
      setSuccess(response.message);

      /*logout user*/
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      /*clears document cookies */

      setTimeout(() => {
        window.location.href = "/pages/login"; /*redirect back to login page*/
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-email-page flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="content-wrapper flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="form-container max-w-md w-full space-y-8">
          <div>
            <h2 className="title mt-6 text-center text-3xl font-extrabold text-gray-900">
              Change Your Email
            </h2>
          </div>
          <form className="form mt-8 space-y-6" onSubmit={handleChangeEmail}>
            <div className="input-group rounded-md shadow-sm -space-y-px">
              {/*new email input*/}
              <div className="email-input-box">
                <label htmlFor="new-email" className="sr-only">
                  New Email address
                </label>
                <div className="relative">
                  <input
                    id="new-email"
                    name="new-email"
                    type="email"
                    autoComplete="email"
                    required
                    className="email-input appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                    placeholder="New Email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  {/*email icon*/}
                  <Mail className="mail-icon absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              {/*password input*/}
              <div className="password-input-box">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="password-input appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/*error message response*/}
            {error && (
              <div className="error-message rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/*sucess message response*/}
            {success && (
              <div className="success-message rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {success}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/*submit button to change email*/}
            <div className="submit-button-box">
              <button
                type="submit"
                className="submit-button group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="loader-icon animate-spin h-5 w-5 mr-3" />
                ) : (
                  <Mail className="mail-icon h-5 w-5 mr-2" />
                )}
                {isLoading ? "Changing email..." : "Change email"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
