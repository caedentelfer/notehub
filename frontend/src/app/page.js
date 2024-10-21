import Header from '../components/Header'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import { Edit3, FolderTree, Cloud, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const Features = () => {
  const features = [
    {
      title: "Easy Note Taking",
      description: "Create and edit notes with a user-friendly interface. Organize your thoughts effortlessly.",
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
    },
    {
      title: "Realtime Collaboration",
      description: "Work together with your team in real-time. See changes instantly as they happen.",
      icon: Users
    }
  ]

  return (
    <div className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div className="text-center">
                <feature.icon className="mx-auto h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}