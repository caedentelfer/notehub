import Link from 'next/link'

const Footer = () => {
    const currentYear = new Date().getFullYear()
    const developers = ['Caeden', 'Ben', 'Regalo', 'Adam', 'Jordan']

    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-sm">
                    <p className="text-gray-500 mb-2">
                        &copy; {currentYear} NoteHub: Collaborative Note-Taking App
                    </p>
                    <div className="text-center">
                        <span className="text-gray-500">Developers:</span>
                        <p className="text-gray-600 mt-1">
                            {developers.join(' • ')}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer