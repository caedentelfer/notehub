"use client";

import { useState, useContext } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { User, Mail, Lock, Image, Eye, EyeOff, Loader } from "lucide-react";
import { registerUser } from "../../../utils/api";
import { useRouter } from "next/navigation";
import { UserContext } from "../../../context/UserContext";
import LeftTooltip from "../../../components/LeftToolTip";
import Tooltip from "../../../components/ToolTip";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarLink, setAvatarLink] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useContext(UserContext);

  /*handles registration logic when the user clicks the register button */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      /*userData object with different input*/
      const userData = {
        username,
        email,
        password,
        user_avatar:
          avatarLink ||
          `https://avatar.iran.liara.run/username?username=${username}`,
      }; /*generate user avatar if not given one upon input based on username*/

      const response = await registerUser(userData)
      setSuccess(response.message)

      router.push('/pages/login')
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const changePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 register-header">
              Create Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                NoteHub
              </span>{" "}
              Account
            </h2>
          </div>
          <form
            className="mt-8 space-y-6 register-form"
            onSubmit={handleRegister}
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only username-label">
                  Username
                </label>
                <LeftTooltip message = "Family friendly username"> 
                <div className="relative username-input">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm username-input"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                  <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 username-icon" />
                </div>
                </LeftTooltip>
              </div>
              <div>
                <label htmlFor="email" className="sr-only email-label">
                  Email address
                </label>
                <LeftTooltip message = "Supply a valid email address">
                <div className="relative email-input">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm email-input"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 email-icon" />
                </div>
                </LeftTooltip>
              </div>
              <div>
                <label htmlFor="password" className="sr-only password-label">
                  Password
                </label>
                <LeftTooltip message = "Minimum 8 characters">
                  <div className="relative password-input-container">
                    <input
                      id="password"
                      name="password"
                      type={isPasswordVisible ? "text" : "password"}
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm password-input"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={changePasswordVisibility}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none password-visibility-toggle"
                      disabled={isLoading}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </LeftTooltip>
              </div>
              <div>
                <label
                  htmlFor="avatar-link"
                  className="sr-only avatar-link-label"
                >
                  Avatar Link
                </label>
                <div className="relative avatar-link-input-container">
                  <input
                    id="avatar-link"
                    name="avatar-link"
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm avatar-link-input"
                    placeholder="Avatar Link (optional)"
                    value={avatarLink}
                    onChange={(e) => setAvatarLink(e.target.value)}
                    disabled={isLoading}
                  />
                  <Image className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 avatar-link-icon" />
                </div>
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
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 register-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5 mr-3 loading-icon" />
                ) : (
                  <Lock className="h-5 w-5 mr-2 button-icon" />
                )}
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600 sign-in-prompt">
            Already have an account?{" "}
            <Link
              href="/pages/login"
              className="font-medium text-purple-600 hover:text-purple-500 sign-in-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
