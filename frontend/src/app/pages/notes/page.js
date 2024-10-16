'use client'

import { useState, useEffect, useRef, useContext } from 'react'
import { fetchNotes, deleteNote, addNote, fetchCategories, addCategory, fetchUsers, shareNote, addUserNote, fetchUsersWithAccess, removeUserAccess } from '../../../utils/api'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { PlusCircle, Edit, Trash2, Share2, Search, Filter, X, Calendar, ArrowUpDown, Tag, MoreHorizontal, Eye, Clock, XCircle, Loader, UserCheck, UserMinus, Crown } from 'lucide-react'
import Link from 'next/link'
import { marked } from 'marked'
import { useRouter } from 'next/navigation'
import { format, isValid, parseISO, isWithinInterval } from 'date-fns'
import { UserContext } from '../../../context/UserContext'
import { motion, AnimatePresence } from 'framer-motion'
import Tooltip from '@/components/ToolTip'

export default function NotesPage() {
  // State declarations
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteCategory, setNewNoteCategory] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    dateCreatedFrom: '',
    dateCreatedTo: '',
    dateEditedFrom: '',
    dateEditedTo: '',
    sortBy: 'createdDesc'
  })
  const [newNoteError, setNewNoteError] = useState('')
  const [previewedNote, setPreviewedNote] = useState(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedNoteForSharing, setSelectedNoteForSharing] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [shareStatus, setShareStatus] = useState({ userId: null, status: '' })
  const router = useRouter()
  const filterRef = useRef(null)
  const [usersWithAccess, setUsersWithAccess] = useState([])
  const [removeAccessStatus, setRemoveAccessStatus] = useState({ userId: null, status: '' })
  const { user } = useContext(UserContext)
  const [allUsers, setAllUsers] = useState([])
  const [userRoles, setUserRoles] = useState({})


  useEffect(() => {
    if (user) {
      getNotes()
      getCategories()
      getUsers()
    }
  }, [user])

  const getNotes = async () => {
    if (!user) {
      console.error('User context is not available')
      setError('Unable to fetch notes. Please try logging in again.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const fetchedNotes = await fetchNotes()
      setNotes(fetchedNotes)

      // Fetch user roles for each note
      const roles = {}
      for (const note of fetchedNotes) {
        try {
          const users = await fetchUsersWithAccess(note.note_id)
          const currentUserRole = users.find(u => u.user_id === user.user_id)
          roles[note.note_id] = currentUserRole ? currentUserRole.is_creator : false
        } catch (error) {
          console.error(`Error fetching users for note ${note.note_id}:`, error)
          roles[note.note_id] = false
        }
      }
      setUserRoles(roles)

      setLoading(false)
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError('Failed to fetch notes. Please try again later.')
      setLoading(false)
    }
  }

  useEffect(() => {
    filterAndSortNotes()
  }, [notes, searchTerm, filters])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getCategories = async () => {
    try {
      const fetchedCategories = await fetchCategories()
      setCategories(fetchedCategories)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const getUsers = async () => {
    try {
      const fetchedUsers = await fetchUsers()
      setUsers(fetchedUsers)
      setFilteredUsers(fetchedUsers)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId)
      setNotes(notes.filter(note => note.note_id !== noteId))
    } catch (err) {
      setError('Failed to delete note')
      console.error('Error deleting note:', err)
    }
  }

  const handleAddNote = async () => {
    setNewNoteError('');
    if (!newNoteTitle.trim()) {
      setNewNoteError('Please enter a title for the note.');
      return;
    }
    if (!newNoteCategory) {
      setNewNoteError('Please select a category for the note.');
      return;
    }

    try {
      let categoryId = newNoteCategory;

      if (newNoteCategory === 'new') {
        if (!newCategoryName.trim()) {
          setNewNoteError('Please enter a name for the new category.');
          return;
        }
        const newCategory = await addCategory({ name: newCategoryName });
        categoryId = newCategory.category_id;
      }

      const newNote = await addNote({
        title: newNoteTitle,
        content: '',
        category_id: categoryId,
        tags: []
      });

      setNotes([newNote, ...notes]);
      setIsNewNoteModalOpen(false);
      setNewNoteTitle('');
      setNewNoteCategory('');
      setNewCategoryName('');

      if (newNoteCategory === 'new') {
        getCategories();
      }
    } catch (err) {
      setNewNoteError('Failed to add note: ' + err.message);
      console.error('Error adding note:', err);
    }
  }

  const renderMarkdown = (content) => {
    return { __html: marked(content) }
  }

  const filterAndSortNotes = () => {
    let result = [...notes]

    if (searchTerm) {
      result = result.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    if (filters.category) {
      result = result.filter(note => note.category_id === parseInt(filters.category))
    }

    if (filters.dateCreatedFrom && filters.dateCreatedTo) {
      result = result.filter(note => {
        const noteDate = parseISO(note.created_on)
        return isWithinInterval(noteDate, {
          start: parseISO(filters.dateCreatedFrom),
          end: parseISO(filters.dateCreatedTo)
        })
      })
    } else if (filters.dateCreatedFrom) {
      result = result.filter(note => {
        const noteDate = parseISO(note.created_on)
        return noteDate >= parseISO(filters.dateCreatedFrom)
      })
    } else if (filters.dateCreatedTo) {
      result = result.filter(note => {
        const noteDate = parseISO(note.created_on)
        return noteDate <= parseISO(filters.dateCreatedTo)
      })
    }

    if (filters.dateEditedFrom && filters.dateEditedTo) {
      result = result.filter(note => {
        const noteDate = parseISO(note.last_update)
        return isWithinInterval(noteDate, {
          start: parseISO(filters.dateEditedFrom),
          end: parseISO(filters.dateEditedTo)
        })
      })
    } else if (filters.dateEditedFrom) {
      result = result.filter(note => {
        const noteDate = parseISO(note.last_update)
        return noteDate >= parseISO(filters.dateEditedFrom)
      })
    } else if (filters.dateEditedTo) {
      result = result.filter(note => {
        const noteDate = parseISO(note.last_update)
        return noteDate <= parseISO(filters.dateEditedTo)
      })
    }

    result.sort((a, b) => {
      const dateA = new Date(filters.sortBy.includes('created') ? a.created_on : a.last_update)
      const dateB = new Date(filters.sortBy.includes('created') ? b.created_on : b.last_update)
      return filters.sortBy.includes('Asc') ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    })

    setFilteredNotes(result)
  }

  const handleFilterChange = (type, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [type]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      dateCreatedFrom: '',
      dateCreatedTo: '',
      dateEditedFrom: '',
      dateEditedTo: '',
      sortBy: 'createdDesc'
    })
  }

  const formatDate = (date) => {
    if (!date) return 'Not available'
    const parsedDate = parseISO(date)
    return isValid(parsedDate) ? format(parsedDate, 'yyyy/MM/dd - HH:mm:ss') : 'Invalid date'
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId)
    return category ? category.name : 'Uncategorized'
  }

  const handleShareNote = async (note) => {
    setSelectedNoteForSharing(note)
    setIsShareModalOpen(true)
    try {
      const [users, allUsersData] = await Promise.all([
        fetchUsersWithAccess(note.note_id),
        fetchUsers()
      ])
      setUsersWithAccess(users)
      setAllUsers(allUsersData)
      setFilteredUsers(allUsersData.filter(u => !users.some(ua => ua.user_id === u.user_id)))
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleShareWithUser = async (userId) => {
    try {
      setShareStatus({ userId, status: 'pending' })
      await shareNote(selectedNoteForSharing.note_id, userId)
      setShareStatus({ userId, status: 'success' })

      // Refresh the list of users with access
      const updatedUsers = await fetchUsersWithAccess(selectedNoteForSharing.note_id)
      setUsersWithAccess(updatedUsers)

      // Update filtered users
      setFilteredUsers(prevFilteredUsers => prevFilteredUsers.filter(u => u.user_id !== userId))

      setTimeout(() => setShareStatus({ userId: null, status: '' }), 3000)
    } catch (err) {
      console.error('Failed to share note:', err)
      setShareStatus({ userId, status: 'error' })
      setTimeout(() => setShareStatus({ userId: null, status: '' }), 3000)
    }
  }

  const handleRemoveAccess = async (userId) => {
    try {
      setRemoveAccessStatus({ userId, status: 'pending' })
      await removeUserAccess(selectedNoteForSharing.note_id, userId)
      setRemoveAccessStatus({ userId, status: 'success' })

      // Refresh the list of users with access
      const updatedUsers = await fetchUsersWithAccess(selectedNoteForSharing.note_id)
      setUsersWithAccess(updatedUsers)

      // Add the removed user back to the filtered users list
      const removedUser = allUsers.find(u => u.user_id === userId)
      if (removedUser) {
        setFilteredUsers(prevFilteredUsers => [...prevFilteredUsers, removedUser])
      }

      setTimeout(() => setRemoveAccessStatus({ userId: null, status: '' }), 3000)
    } catch (err) {
      console.error('Failed to remove user access:', err)
      setRemoveAccessStatus({ userId, status: 'error' })
      setTimeout(() => setRemoveAccessStatus({ userId: null, status: '' }), 3000)
    }
  }

  const handleUserSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    setUserSearchTerm(searchTerm)
    const filtered = allUsers.filter(user =>
      !usersWithAccess.some(ua => ua.user_id === user.user_id) &&
      (user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm))
    )
    setFilteredUsers(filtered)
  }

  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.2
      }
    })
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600 text-lg">Loading your notes...</p>
      </main>
      <Footer />
    </div>
  )

  if (error) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{user?.username || 'User'}</span></h1>
          <p className="text-xl text-gray-600">Manage your notes with ease</p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
            <Tooltip message = "Search for notes by title, content, or tags">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-md shadow-sm text-gray-900"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </Tooltip>
            </div>
            <div className="relative" ref={filterRef}>
            <Tooltip message = "Apply filters to refine your notes">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="mr-2 h-5 w-5" />
                  Filter
                </button>
            </Tooltip>
              {isFilterOpen && (
                <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Filter and Sort</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        id="category-filter"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md text-purple-600"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.category_id} value={category.category_id.toString()}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          value={filters.dateCreatedFrom}
                          onChange={(e) => handleFilterChange('dateCreatedFrom', e.target.value)}
                          className="block w-[calc(50%-1rem)] pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md text-purple-600"
                          placeholder="From"
                        />
                        <span className="text-black font-medium w-8 text-center">to</span>
                        <input
                          type="date"
                          value={filters.dateCreatedTo}
                          onChange={(e) => handleFilterChange('dateCreatedTo', e.target.value)}
                          className="block w-[calc(50%-1rem)] pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md text-purple-600"
                          placeholder="To"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Edited</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          value={filters.dateEditedFrom}
                          onChange={(e) => handleFilterChange('dateEditedFrom', e.target.value)}
                          className="block w-[calc(50%-1rem)] pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md text-purple-600"
                          placeholder="From"
                        />
                        <span className="text-black font-medium w-8 text-center">to</span>
                        <input
                          type="date"
                          value={filters.dateEditedTo}
                          onChange={(e) => handleFilterChange('dateEditedTo', e.target.value)}
                          className="block w-[calc(50%-1rem)] pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md text-purple-600"
                          placeholder="To"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                      <select
                        id="sort-by"
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md text-purple-600"
                      >
                        <option value="createdDesc">Date Created (Newest First)</option>
                        <option value="createdAsc">Date Created (Oldest First)</option>
                        <option value="editedDesc">Date Edited (Newest First)</option>
                        <option value="editedAsc">Date Edited (Oldest First)</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between">
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition duration-150 ease-in-out"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear Filters
                      </button>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition duration-150 ease-in-out"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsNewNoteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-sm transition duration-150 ease-in-out"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            New Note
          </button>
        </div>
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white shadow-md rounded-lg">
            <p className="text-xl text-gray-600">No notes found. Start by creating a new note!</p>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {[0, 1, 2].map((columnIndex) => (
                <motion.div
                  key={columnIndex}
                  custom={columnIndex}
                  variants={columnVariants}
                  className="space-y-8"
                >
                  {filteredNotes
                    .filter((_, index) => index % 3 === columnIndex)
                    .map((note) => (
                      <motion.div
                        key={note.note_id}
                        style={{overflow: 'visible'}}
                        className={`bg-white shadow-lg rounded-lg overflow-hidden flex flex-col transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl border border-gray-200 relative group`}
                        onClick={() => setSelectedNoteId(note.note_id)}
                      >
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform transition-transform duration-300 origin-left ${selectedNoteId === note.note_id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                          }`}></div>
                        <div className="p-6 flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{note.title}</h2>
                            <Tooltip message = "Quick look at note">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewedNote(note);
                                }}
                                className="text-gray-500 hover:text-purple-600 transition duration-150 ease-in-out"
                                aria-label="Preview note"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </Tooltip>
                          </div>
                          <div className="flex items-center mb-4">
                            <Tag className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              {getCategoryName(note.category_id)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                              <span>{formatDate(note.created_on)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-purple-400" />
                              <span>{formatDate(note.last_update)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 sm:px-6 flex justify-between items-center border-t border-gray-200">
                          <div className="flex space-x-2">
                          <Tooltip message = "Edit this current note">
                            <button
                              onClick={() => router.push(`/pages/edit?id=${note.note_id}`)}
                              className="inline-flex items-center px-3 py-1 border border-purple-200 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition duration-150 ease-in-out"
                            >
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </button>
                           </Tooltip> 
                            {userRoles[note.note_id] && (
                              <Tooltip message = "Delete this note">
                              <button
                                onClick={() => handleDeleteNote(note.note_id)}
                                className="inline-flex items-center px-3 py-1 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none transition duration-150 ease-in-out"
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Delete
                              </button>
                              </Tooltip>
                            )}
                          </div>
                          <Tooltip message = "Share note with other users">
                            <button
                              onClick={() => handleShareNote(note)}
                              className="inline-flex items-center px-3 py-1 border border-blue-200 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none transition duration-150 ease-in-out"
                            >
                              <Share2 className="mr-1 h-4 w-4" />
                              Share
                            </button>
                          </Tooltip>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <Footer />

      {/* Preview Modal */}
      <AnimatePresence>
        {previewedNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black"
              onClick={() => setPreviewedNote(null)}
              
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 15 }}
              className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
              
            >
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="relative flex-grow overflow-y-auto">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{previewedNote.title}</h2>
                      <button
                        onClick={() => setPreviewedNote(null)}
                        className="text-gray-400 hover:text-gray-500 transition duration-150 ease-in-out"
                      >
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="flex items-center mb-4">
                      <Tag className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                        {getCategoryName(previewedNote.category_id)}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-600 mb-6" dangerouslySetInnerHTML={renderMarkdown(previewedNote.content)} />
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-6">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                        <span>Created: {formatDate(previewedNote.created_on)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-purple-400" />
                        <span>Last updated: {formatDate(previewedNote.last_update)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        router.push(`/pages/edit?id=${previewedNote.note_id}`)
                        setPreviewedNote(null)
                      }}
                      className="inline-flex items-center px-3 py-1 border border-purple-200 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition duration-150 ease-in-out"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </button>
                    {userRoles[previewedNote.note_id] && (
                      <button
                        onClick={() => {
                          handleDeleteNote(previewedNote.note_id)
                          setPreviewedNote(null)
                        }}
                        className="inline-flex items-center px-3 py-1 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </button>
                    )}
                  </div>
                 
                  <button
                    onClick={() => {
                      handleShareNote(previewedNote)
                      setPreviewedNote(null)
                    }}
                    className="inline-flex items-center px-3 py-1 border border-blue-200 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                  >
                    <Share2 className="mr-1 h-4 w-4" />
                    Share
                  </button>
                  
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Note Modal */}
      <AnimatePresence>
        {isNewNoteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black"
              onClick={() => setIsNewNoteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 15 }}
              className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
            >
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                <div className="relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Note</h3>
                    {newNoteError && (
                      <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{newNoteError}</span>
                      </div>
                    )}
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Note Title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 mb-4"
                    />
                    <select
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 mb-4"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id.toString()}>
                          {category.name}
                        </option>
                      ))}
                      <option value="new">New category</option>
                    </select>
                    {newNoteCategory === 'new' && (
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New Category Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm  text-gray-900"
                      />
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-base font-medium text-white hover:from-purple-700 hover:to-pink-700 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewNoteModalOpen(false)
                      setNewNoteError('')
                      setNewNoteTitle('')
                      setNewNoteCategory('')
                      setNewCategoryName('')
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black"
              onClick={() => setIsShareModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 15 }}
              className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
            >
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                <div className="relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">Share Note</h3>

                    {/* Users with access */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-700 mb-3">Users with access:</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto shadow-inner">
                        {usersWithAccess.length > 0 ? (
                          usersWithAccess
                            .sort((a, b) => (b.is_creator ? 1 : -1))
                            .map((userAccess) => (
                              <div key={userAccess.user_id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div className="flex items-center">
                                  {userAccess.is_creator ? (
                                    <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                                  ) : (
                                    <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                                  )}
                                  <span className={`text-sm ${userAccess.is_creator ? 'font-semibold underline' : 'font-medium'} text-gray-800`}>
                                    {userAccess.users.username}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  {userAccess.is_creator ? (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Creator</span>
                                  ) : user && usersWithAccess.find(u => u.user_id === user.user_id)?.is_creator ? (
                                    <button
                                      onClick={() => handleRemoveAccess(userAccess.user_id)}
                                      className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-md ${removeAccessStatus.userId === userAccess.user_id
                                        ? removeAccessStatus.status === 'success'
                                          ? 'text-green-700 bg-green-50 border-green-200'
                                          : removeAccessStatus.status === 'error'
                                            ? 'text-red-700 bg-red-50 border-red-200'
                                            : 'text-gray-700 bg-gray-50 border-gray-200'
                                        : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out`}
                                      disabled={removeAccessStatus.userId === userAccess.user_id && removeAccessStatus.status === 'pending'}
                                    >
                                      {removeAccessStatus.userId === userAccess.user_id ? (
                                        removeAccessStatus.status === 'success' ? (
                                          'Removed'
                                        ) : removeAccessStatus.status === 'error' ? (
                                          'Error'
                                        ) : (
                                          <Loader className="animate-spin h-3 w-3" />
                                        )
                                      ) : (
                                        <>
                                          <UserMinus className="mr-1 h-3 w-3" />
                                          Remove
                                        </>
                                      )}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-gray-500">No other users have access to this note.</p>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search users to share with..."
                        value={userSearchTerm}
                        onChange={handleUserSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-4 max-h-60 overflow-y-auto">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <div key={user.user_id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div>
                              <p className="font-medium text-gray-900">{user.username}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <button
                              onClick={() => handleShareWithUser(user.user_id)}
                              className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md ${shareStatus.userId === user.user_id
                                ? shareStatus.status === 'success'
                                  ? 'text-green-700 bg-green-50 border-green-200'
                                  : shareStatus.status === 'error'
                                    ? 'text-red-700 bg-red-50 border-red-200'
                                    : 'text-gray-700 bg-gray-50 border-gray-200'
                                : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                                } transition duration-150 ease-in-out`}
                              disabled={shareStatus.userId === user.user_id && shareStatus.status === 'pending'}
                            >
                              {shareStatus.userId === user.user_id ? (
                                shareStatus.status === 'success' ? (
                                  'Shared'
                                ) : shareStatus.status === 'error' ? (
                                  'Error'
                                ) : (
                                  <Loader className="animate-spin h-4 w-4" />
                                )
                              ) : (
                                <>
                                  <Share2 className="mr-1 h-4 w-4" />
                                  Share
                                </>
                              )}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No users found to share with.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}