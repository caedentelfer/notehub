"use client";

import { useState, useContext, useEffect } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import LeftTooltip from "../../../components/LeftToolTip";
import Link from "next/link";
import Tooltip from "../../../components/ToolTip";
import { User, Lock, Eye, EyeOff, Loader } from "lucide-react";
import { loginUser } from "../../../utils/api";
import { useRouter } from "next/navigation";
import { UserContext } from "../../../context/UserContext";
import ToolTip from "../../../components/ToolTip";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const router = useRouter();
  const { login } = useContext(UserContext);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      const credentials = { username, password, rememberMe };
      const response = await loginUser(credentials);
      if (rememberMe) {
        localStorage.setItem("token", response.token);
      } else {
        sessionStorage.setItem("token", response.token);
      }

      login(response.user, response.token, rememberMe);
      router.push("/pages/notes");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
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
        <div
          className={`max-w-md w-full space-y-8 transition-opacity duration-500 ease-in-out ${
            isPageLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 sign-in-header">
              Sign in to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                NoteHub
              </span>
            </h2>
          </div>
          <form
            className="mt-8 space-y-6 sign-in-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only username-label">
                  Username
                </label>
                <div className="relative username-input-container">
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
              </div>
              <div>
                <label htmlFor="password" className="sr-only password-label">
                  Password
                </label>
                <div className="relative password-input-container">
                  <input
                    id="password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm password-input"
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
              </div>
            </div>

            <div className="flex items-center justify-between remember-me-container">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded remember-me-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 remember-me-label"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/pages/reset-password"
                  className="font-medium text-purple-600 hover:text-purple-500 forgot-password-link"
                >
                  Forgot your password?
                </Link>
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

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sign-in-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="animate-spin h-5 w-5 mr-3 loading-icon" />
                ) : (
                  <Lock className="h-5 w-5 mr-2 button-icon" />
                )}
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600 sign-up">
            Or{" "}
            <Link
              href="/pages/register"
              className="font-medium text-purple-600 hover:text-purple-500 create-account-link"
            >
              create a new account
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
