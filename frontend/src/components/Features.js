import { motion } from 'framer-motion'
import { Edit3, FolderTree, Cloud } from 'lucide-react'

export default function Features() {
    const features = [
        {
            title: "Easy Note Taking",
            description: "Create and edit notes with a user-friendly interface. Collaborate with others in real-time.",
            icon: Edit3
        },
        {
            title: "Organize Your Thoughts",
            description: "Categorize and tag your notes for easy retrieval. Keep your ideas structured and accessible.",
            icon: FolderTree
        },
        {
            title: "Sync Across Devices",
            description: "Access your notes from anywhere, on any device. Your thoughts are always at your fingertips.",
            icon: Cloud
        }
    ]

    return (
        <div className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                >
                    Our Features
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
                        >
                            <div className="text-center">
                                <feature.icon className="mx-auto h-12 w-12 text-purple-600 mb-4" />
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}