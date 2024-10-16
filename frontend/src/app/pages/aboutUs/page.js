'use client'

import Header from '../../../components/Header'; 
import Footer from '../../../components/Footer'; 
import { motion } from 'framer-motion';
import Tooltip from '@/components/ToolTip';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-white text-gray-800">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold mb-6 text-purple-600">About Our Company</h1>
                    <p className="text-lg mb-4 max-w-2xl mx-auto">
                        At NoteHub, we are passionate about building tools that help you boost productivity. 
                        Our mission is to develop intuitive solutions that empower teams and individuals to achieve more.
                    </p>
                    
                    
                    <div className="w-full h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg mb-8"></div>
                    
                    <h2 className="text-3xl font-semibold mb-4 text-pink-600">Our Mission</h2>
                    <p className="text-lg mb-4 max-w-2xl mx-auto">
                        Our goal is simple: create products that streamline your workflow and free up your time for what matters most. 
                        With our powerful tools, you’ll work smarter, not harder.
                    </p>

                    <div className="w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mb-8"></div>

                    <h2 className="text-3xl font-semibold mb-4 text-purple-600">Contact Us</h2>
                    <p className="text-lg">
                        You can reach us at:
                    </p>
                    <ul className="list-disc list-inside mb-8">
                        <li>Email: Clyde@notehub@gmail.com</li>
                        <li>Phone: +082 578 923</li>
                        <li>Address: 8 Mandela Road, Innovation City</li>
                    </ul>

                    <Tooltip message = "Send us an email">
                        
                    <motion.a 
                        href="mailto:@notehub@gmail.com" 
                        className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium py-2 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300"
                    >
                        Get In Touch
                    </motion.a>
                    </Tooltip>
                </motion.section>
            </main>
            <Footer />
        </div>
    );
}
