'use client'

import { useContext } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { UserContext } from '../context/UserContext'
import { Notebook, PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Tooltip from './ToolTip'

export default function Hero() {
    const { user } = useContext(UserContext)

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto">
                <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
                    <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                        <div className="flex flex-col lg:flex-row items-center justify-between">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="sm:text-center lg:text-left lg:max-w-xl"
                            >
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Collaborative</span>{' '}
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 xl:inline">Note-Taking</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Create, edit, and share notes in real-time. Boost your productivity with our powerful markdown support and real-time collaboration features.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    {user ? (
                                        <>  
                                            <Tooltip message = "View created and shared notes">
                                                <div className="rounded-md shadow">
                                                    
                                                    <Link
                                                        href="/pages/notes"
                                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out"
                                                    >
                                                        <Notebook className="mr-2 h-5 w-5" />
                                                        My Notes
                                                    </Link> 
                                                </div>
                                            </Tooltip>
                                            <div className="mt-3 sm:mt-0 sm:ml-3">
                                                <button
                                                    onClick={() => {
                                                        console.log('Open new note dialog')
                                                    }}
                                                    className="w-full flex items-center justify-center px-8 py-3 border border-purple-600 text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out"
                                                >
                                                    <PlusCircle className="mr-2 h-5 w-5" />
                                                    New Note
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="rounded-md shadow">
                                                <Link
                                                    href="/pages/login"
                                                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out"
                                                >
                                                    Sign In
                                                </Link>
                                            </div>
                                            <div className="mt-3 sm:mt-0 sm:ml-3">
                                                <Link
                                                    href="/pages/register"
                                                    className="w-full flex items-center justify-center px-8 py-3 border border-purple-600 text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out"
                                                >
                                                    Sign Up
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mt-10 lg:mt-0 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center"
                            >
                                <div className="relative w-full h-full max-w-[85%] max-h-[85%]">
                                    <Image
                                        className="object-contain"
                                        src="/images/note-image-3.png"
                                        alt="Collaborative note-taking interface"
                                        layout="fill"
                                        priority
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}