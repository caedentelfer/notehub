'use client'

import { useState, useContext, useRef, useEffect } from 'react'
import { Menu, X, Settings, ChevronDown, ChevronUp, LogOut, User, Mail, Key, Image, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserContext } from '../context/UserContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const settingsRef = useRef(null)
    const pathname = usePathname()
    const router = useRouter()

    const { user, logout } = useContext(UserContext)

    const navItems = [
        { name: 'Home', href: '/', requiresAuth: false, temporaryPage: false },
        { name: 'Notes', href: '/pages/notes', requiresAuth: true, temporaryPage: false },
        { name: 'Edit', href: '/pages/edit', requiresAuth: true, temporaryPage: true },
        { name: 'Login', href: '/pages/login', requiresAuth: false, temporaryPage: true },
        { name: 'Register', href: '/pages/register', requiresAuth: false, temporaryPage: true },
        { name: 'Change Email', href: '/pages/change-email', requiresAuth: true, temporaryPage: true },
        { name: 'Change Username', href: '/pages/change-username', requiresAuth: true, temporaryPage: true },
        { name: 'Change Image', href: '/pages/change-image', requiresAuth: true, temporaryPage: true },
        { name: 'Change Password', href: '/pages/reset-password', requiresAuth: true, temporaryPage: true },
        { name: 'Delete Account', href: '/pages/delete-account', requiresAuth: true, temporaryPage: true },
    ]

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [settingsRef])

    const filteredNavItems = navItems.filter(item => (!item.requiresAuth || user) && !item.temporaryPage)
    const currentTemporaryPage = navItems.find(item => item.temporaryPage && pathname === item.href)

    return (
        <header className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">

                <div className="w-full h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-10">
                        <Link href="/" className="flex items-center">
                            <span className="sr-only">NoteHub</span>
                            <svg className="h-8 w-auto text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z" />
                            </svg>
                            <span className="ml-2 text-xl font-bold text-white">
                                NoteHub
                            </span>
                        </Link>
                        <div className="hidden lg:flex space-x-8 h-full items-center">
                            {filteredNavItems.map((item, index) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`text-sm font-medium hover:text-white transition-colors duration-200 h-16 flex items-center relative ${pathname === item.href ? 'text-white' : 'text-purple-200'
                                        }`}
                                >
                                    {item.name}
                                    {pathname === item.href && (
                                        <motion.span
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-white"
                                            layoutId="underline"
                                        />
                                    )}
                                </Link>
                            ))}
                            {currentTemporaryPage && (
                                <>
                                    <span className="text-purple-200">|</span>
                                    <Link
                                        href={currentTemporaryPage.href}
                                        className="text-sm font-medium text-white h-16 flex items-center relative"
                                    >
                                        {currentTemporaryPage.name}
                                        <motion.span
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-white"
                                            layoutId="underline"
                                        />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="relative" ref={settingsRef}>
                                    <button
                                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                        className="flex items-center space-x-4 text-sm font-medium text-white focus:outline-none transition-colors duration-200"
                                    >
                                        <div className="flex items-center hover:text-purple-200 transition-colors duration-200">
                                            <span className="hidden md:inline-block mr-2">{user.username}</span>
                                            <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden transition-transform duration-200 hover:scale-105">
                                                <img
                                                    src={user.user_avatar}
                                                    alt={user.username}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            {isSettingsOpen ? (
                                                <ChevronUp className="h-4 w-4 ml-1" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {isSettingsOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                                            >
                                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                    <div className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 bg-gray-50">
                                                        <p className="font-semibold">{user.username}</p>
                                                        <p className="text-gray-600 truncate">{user.email}</p>
                                                    </div>
                                                    <Link href="/pages/change-email" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200" role="menuitem">
                                                        <Mail className="mr-3 h-4 w-4 text-gray-400" />
                                                        Change Email
                                                    </Link>
                                                    <Link href="/pages/change-username" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200" role="menuitem">
                                                        <User className="mr-3 h-4 w-4 text-gray-400" />
                                                        Change Username
                                                    </Link>
                                                    <Link href="/pages/change-image" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200" role="menuitem">
                                                        <Image className="mr-3 h-4 w-4 text-gray-400" />
                                                        Change Profile Image
                                                    </Link>
                                                    <Link href="/pages/reset-password" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200" role="menuitem">
                                                        <Key className="mr-3 h-4 w-4 text-gray-400" />
                                                        Change Password
                                                    </Link>
                                                    <div className="border-t border-gray-100"></div>
                                                    <Link href="/pages/delete-account" className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200" role="menuitem">
                                                        <Trash2 className="mr-3 h-4 w-4 text-red-400" />
                                                        Delete Account
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                                                        role="menuitem"
                                                    >
                                                        <LogOut className="mr-3 h-4 w-4 text-gray-400" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <>
                                {pathname !== '/pages/login' && (
                                    <Link
                                        href="/pages/login"
                                        className="inline-block bg-transparent py-2 px-6 border-2 border-white rounded-full text-sm font-medium text-white hover:bg-white hover:text-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
                                    >
                                        Sign in
                                    </Link>
                                )}
                                {pathname !== '/pages/register' && (
                                    <Link
                                        href="/pages/register"
                                        className="inline-block bg-white py-2 px-6 border-2 border-white rounded-full text-sm font-medium text-pink-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
                                    >
                                        Sign up
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                    <div className="lg:hidden">
                        <button
                            className="rounded-md p-2 inline-flex items-center justify-center text-white hover:text-purple-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open menu</span>
                            {isMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="lg:hidden"
                        >
                            <div className="pt-2 pb-3 space-y-1">
                                {filteredNavItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === item.href
                                            ? 'text-white bg-purple-500'
                                            : 'text-purple-200 hover:bg-purple-500 hover:text-white'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {currentTemporaryPage && (
                                    <>
                                        <div className="border-t border-purple-400 my-2"></div>
                                        <Link
                                            href={currentTemporaryPage.href}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-white bg-purple-500"
                                        >
                                            {currentTemporaryPage.name}
                                        </Link>
                                    </>
                                )}
                                {!user && !currentTemporaryPage && (
                                    <>
                                        <div className="border-t border-purple-400 my-2"></div>
                                        {pathname !== '/pages/login' && (
                                            <Link
                                                href="/pages/login"
                                                className="block px-3 py-2 rounded-full text-base font-medium text-white border-2 border-white hover:bg-white hover:text-purple-600 transition-all duration-300 ease-in-out"
                                            >
                                                Sign in
                                            </Link>
                                        )}
                                        {pathname !== '/pages/register' && (
                                            <Link
                                                href="/pages/register"
                                                className="block px-3 py-2 rounded-full text-base font-medium text-pink-600 bg-white border-2 border-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300 ease-in-out"
                                            >
                                                Sign up
                                            </Link>
                                        )}
                                    </>
                                )}
                                {user && (
                                    <>
                                        <div className="border-t border-purple-400 my-2"></div>
                                        <div className="px-3 py-2 text-base font-medium text-white">
                                            <p className="font-semibold">{user.username}</p>
                                            <p className="text-sm text-purple-200">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/pages/change-email"
                                            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-purple-200 hover:bg-purple-500 hover:text-white"
                                        >
                                            <Mail className="mr-3 h-4 w-4" />
                                            Change Email
                                        </Link>
                                        <Link
                                            href="/pages/change-username"
                                            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-purple-200 hover:bg-purple-500 hover:text-white"
                                        >
                                            <User className="mr-3 h-4 w-4" />
                                            Change Username
                                        </Link>
                                        <Link
                                            href="/pages/change-image"
                                            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-purple-200 hover:bg-purple-500 hover:text-white"
                                        >
                                            <Image className="mr-3 h-4 w-4" />
                                            Change Profile Image
                                        </Link>
                                        <Link
                                            href="/pages/reset-password"
                                            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-purple-200 hover:bg-purple-500 hover:text-white"
                                        >
                                            <Key className="mr-3 h-4 w-4" />
                                            Change Password
                                        </Link>
                                        <Link
                                            href="/pages/delete-account"
                                            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500 hover:text-white"
                                        >
                                            <Trash2 className="mr-3 h-4 w-4" />
                                            Delete Account
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-purple-200 hover:bg-purple-500 hover:text-white"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    )
}