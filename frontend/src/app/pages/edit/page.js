'use client'

import React, { useState, useEffect, useRef, useContext, useCallback, Suspense } from 'react'
import { debounce } from 'lodash'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Save, Eye, ArrowLeft, Clock, Tag, X, Users, Share2, Search, UserCheck,
  UserMinus, Crown, Loader, ChevronDown, ChevronUp, Bold, Heading, Underline,
  Image as ImageIcon, Minus, List, Link, Code, Menu, LogOut, Settings, User,
  Mail, Key, Trash2, FolderOpen, ChevronLeft, ChevronRight, Download,
  Heading1, Heading2, Heading3, Quote
} from 'lucide-react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { CodemirrorBinding } from 'y-codemirror'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/display/placeholder'
import { UserContext } from '../../../context/UserContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  fetchNote, updateNote, fetchCategories, addCategory,
  fetchUsersWithAccess, shareNote, removeUserAccess, fetchUsers
} from '../../../utils/api'
import ReactMarkdown from 'react-markdown'
import Header from '@/components/Header'

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-[90vh] overflow-auto">
        <div className="flex justify-end">
          <button
            className="text-gray-500 hover:text-purple-600 transition-colors duration-150"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function MarkdownPreview({ content }) {
  return (
    <div className="prose prose-purple max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

function UserLegend({ userPositions }) {
  const [expandedUser, setExpandedUser] = useState(null)

  return (
    <div className="flex flex-col space-y-2">
      {Object.entries(userPositions).map(([clientId, { name, color, email, avatar }]) => (
        <div key={clientId} className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <button
            className="flex items-center w-full p-2 hover:bg-gray-50 transition-colors duration-150"
            onClick={() => setExpandedUser(expandedUser === clientId ? null : clientId)}
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold mr-2" style={{ backgroundColor: color }}>
              {name[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 flex-grow text-left truncate">{name}</span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expandedUser === clientId ? 'transform rotate-180' : ''}`} />
          </button>
          {expandedUser === clientId && (
            <div className="p-4 border-t border-gray-200 flex flex-col items-center">
              <div className="mb-4 text-center">
                <p className="font-medium text-gray-900">{name}</p>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
              <img src={avatar || '/placeholder-avatar.png'} alt={name} className="h-24 w-24 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}



export default function EditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const noteId = searchParams.get('id')
  const { user, logout } = useContext(UserContext)

  const [noteName, setNoteName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSaved, setLastSaved] = useState(null)
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [userPositions, setUserPositions] = useState({})
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [usersWithAccess, setUsersWithAccess] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [shareStatus, setShareStatus] = useState({ userId: null, status: '' })
  const [removeAccessStatus, setRemoveAccessStatus] = useState({ userId: null, status: '' })
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const editorRef = useRef(null)
  const ydocRef = useRef(null)
  const ytextRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
  const cmEditorRef = useRef(null)
  const settingsRef = useRef(null)

  const [initialContentLoaded, setInitialContentLoaded] = useState(false)

  const [autoSaveStatus, setAutoSaveStatus] = useState(null)
  const autoSaveTimeoutRef = useRef(null)

  const resetEditor = useCallback(() => {
    if (cmEditorRef.current) {
      cmEditorRef.current.setValue('')
    }
    if (ytextRef.current) {
      ytextRef.current.delete(0, ytextRef.current.length)
    }
    setInitialContentLoaded(false)
  }, [])

  const cleanupYjs = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect()
      providerRef.current = null
    }
    if (ydocRef.current) {
      ydocRef.current.destroy()
      ydocRef.current = null
    }
    if (bindingRef.current) {
      try {
        bindingRef.current.destroy()
      } catch (error) {
        console.error('Error destroying binding:', error)
      }
      bindingRef.current = null
    }
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
      autoSaveTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!noteId) {
      setError('No note ID provided.')
      setLoading(false)
      return
    }

    resetEditor()
    setLoading(true)

    const initializeYjs = async () => {
      try {
        const ydoc = new Y.Doc()
        ydocRef.current = ydoc
        ytextRef.current = ydoc.getText('content')

        const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://your-render-app.onrender.com'
        if (providerRef.current) {
          providerRef.current.disconnect()
        }
        const provider = new WebsocketProvider(websocketUrl, noteId, ydoc)
        providerRef.current = provider

        // Handle connection status
        provider.on('status', (event) => {
          console.log(`WebSocket status: ${event.status}`)
          if (event.status === 'connected') {
            console.log('WebSocket connected, setting awareness state')
            provider.awareness.setLocalStateField('user', {
              name: user ? user.username : 'Anonymous',
              color: getRandomColor(),
              email: user ? user.email : '',
              avatar: user ? user.user_avatar : '',
            })
          }
        })

        // Handle awareness changes
        provider.awareness.on('change', () => {
          console.log('Awareness state changed:', provider.awareness.getStates())
          const states = provider.awareness.getStates()
          const newUserPositions = {}
          states.forEach((state, clientID) => {
            if (state.user) {
              newUserPositions[clientID] = {
                name: state.user.name,
                color: state.user.color,
                email: state.user.email,
                avatar: state.user.avatar,
              }
            }
          })
          setUserPositions(newUserPositions)
        })

        const fetchData = async () => {
          try {
            const [noteData, categoriesData] = await Promise.all([
              noteId ? fetchNote(noteId) : null,
              fetchCategories()
            ])

            if (noteData) {
              setNoteName(noteData.title)
              setTags(noteData.tags || [])
              setSelectedCategory(noteData.category_id.toString())
            }


            setCategories(categoriesData)
          } catch (err) {
            console.error('Failed to fetch note data:', err)
            setError('Failed to fetch note data')
          }
        }

        await fetchData()

        // Initialize CodeMirror
        // Initialize CodeMirror
        if (!cmEditorRef.current && editorRef.current) {
          cmEditorRef.current = CodeMirror(editorRef.current, {
            mode: 'markdown',
            theme: 'default',
            lineNumbers: true,
            lineWrapping: true,
            placeholder: 'Start typing your note here...',
          })

          cmEditorRef.current.getWrapperElement().style.fontSize = '16px'
          cmEditorRef.current.getWrapperElement().style.fontFamily = 'Inter, system-ui, sans-serif'
          cmEditorRef.current.getWrapperElement().style.height = '100%'
        }


        // Set up CodemirrorBinding
        if (cmEditorRef.current) {
          if (bindingRef.current) {
            bindingRef.current.destroy()
          }
          bindingRef.current = new CodemirrorBinding(ytextRef.current, cmEditorRef.current, provider.awareness)

          setInitialContentLoaded(true)
        }
      } catch (err) {
        console.error('Error initializing Yjs:', err)
        setError('Failed to initialize collaboration.')
      } finally {
        setLoading(false)
      }
    }

    initializeYjs()

    const handlePopState = (event) => {
      event.preventDefault()
      cleanupYjs()
      router.push('/pages/notes')
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      cleanupYjs()
      window.removeEventListener('popstate', handlePopState)
    }
  }, [noteId, user, resetEditor, cleanupYjs, router])

  const autoSave = useCallback(async () => {
    if (!cmEditorRef.current || !selectedCategory) return

    try {
      setAutoSaveStatus('Saving...')
      const noteData = {
        title: noteName,
        content: cmEditorRef.current.getValue(),
        tags: tags,
        category_id: parseInt(selectedCategory)
      }

      await updateNote(noteId, noteData)
      setLastSaved(new Date())
      setAutoSaveStatus('Saved')
      setTimeout(() => setAutoSaveStatus(null), 2000)
    } catch (err) {
      console.error('Error auto-saving note:', err)
      setAutoSaveStatus('Error saving')
      setTimeout(() => setAutoSaveStatus(null), 2000)
    }
  }, [noteId, noteName, tags, selectedCategory])

  useEffect(() => {
    if (cmEditorRef.current) {
      const onChange = () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
        autoSaveTimeoutRef.current = setTimeout(autoSave, 2000)
      }

      cmEditorRef.current.on('change', onChange)

      return () => {
        if (cmEditorRef.current) {
          cmEditorRef.current.off('change', onChange)
        }
      }
    }
  }, [autoSave])

  useEffect(() => {
    if (initialContentLoaded && cmEditorRef.current) {
      // cmEditorRef.current.setValue(ytextRef.current.toString())
    }
  }, [initialContentLoaded])

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

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  const handleDownload = () => {
    if (cmEditorRef.current) {
      const content = cmEditorRef.current.getValue()
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${noteName || 'Untitled'}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (newTag && !tags.includes(newTag)) {

      setTags([...tags, newTag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleUpdateNote = async () => {
    setValidationError('')
    if (!selectedCategory) {
      setValidationError('Please select a category for the note.')
      return
    }

    try {
      const noteData = {
        title: noteName,
        content: cmEditorRef.current.getValue(),
        tags: tags,
        category_id: parseInt(selectedCategory)
      }

      await updateNote(noteId, noteData)
      setLastSaved(new Date())
    } catch (err) {
      setError('Failed to save note')
      console.error('Error saving note:', err)
    }
  }

  const handleBack = () => {
    cleanupYjs()
    router.push('/pages/notes')
  }

  const handleShareNote = async () => {
    setIsShareModalOpen(true)
    try {
      const [usersWithAccessData, allUsersData] = await Promise.all([
        fetchUsersWithAccess(noteId),
        fetchUsers()
      ])
      setUsersWithAccess(usersWithAccessData)
      setAllUsers(allUsersData)

      // Filter out users who already have access
      const usersWithoutAccess = allUsersData.filter(user =>
        !usersWithAccessData.some(accessUser => accessUser.user_id === user.user_id)
      )
      setFilteredUsers(usersWithoutAccess)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleShareWithUser = async (userId) => {
    try {
      setShareStatus({ userId, status: 'pending' })
      await shareNote(noteId, userId)
      setShareStatus({ userId, status: 'success' })

      // Refresh the list of users with access
      const updatedUsers = await fetchUsersWithAccess(noteId)
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
      await removeUserAccess(noteId, userId)
      setRemoveAccessStatus({ userId, status: 'success' })

      // Refresh the list of users with access
      const updatedUsers = await fetchUsersWithAccess(noteId)
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

  const applyMarkdown = (type) => {
    const editor = cmEditorRef.current
    if (!editor) return

    const selection = editor.getSelection()
    let replacement = ''

    switch (type) {
      case 'bold':
        replacement = `**${selection}**`
        break
      case 'h1':
        replacement = `# ${selection}`
        break
      case 'h2':
        replacement = `## ${selection}`
        break
      case 'h3':
        replacement = `### ${selection}`
        break
      case 'divider':
        replacement = `\n\n---\n\n`
        break
      case 'image':
        replacement = `![${selection || 'Alt text'}](image_url)`
        break
      case 'list':
        const selectedLines = selection.split('\n')
        replacement = selectedLines.map(line => `- ${line}`).join('\n')
        break
      case 'link':
        replacement = `[${selection || 'Link text'}](url)`
        break
      case 'code':
        replacement = `\`\`\`\n${selection}\n\`\`\``
        break
      case 'quote':
        replacement = `> ${selection}`
        break
      default:
        return
    }

    editor.replaceSelection(replacement)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleProfileAction = (action) => {
    switch (action) {
      case 'change-email':
      case 'change-username':
      case 'change-image':
      case 'reset-password':
      case 'delete-account':
        router.push(`/pages/${action}`)
        break
      default:
        console.error('Unknown profile action:', action)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your note...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="text-red-600 text-xl">Error: {error}</div>
          <button
            onClick={() => router.push('/pages/notes')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            Back to Notes
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-white hover:text-purple-200 transition duration-150 ease-in-out"
              aria-label="Back to notes"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <input
              type="text"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              placeholder="Untitled Note"
              className="text-2xl font-bold focus:outline-none bg-transparent text-white placeholder-purple-200"
              aria-label="Note title"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="p-2 text-white hover:bg-purple-500 rounded-full transition duration-150 ease-in-out"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={handleShareNote}
              className="p-2 text-white hover:bg-purple-500 rounded-full transition duration-150 ease-in-out"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-purple-500 rounded-full transition duration-150 ease-in-out"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleUpdateNote}
              className="px-4 py-2 bg-white text-purple-600 rounded-full hover:bg-purple-100 transition duration-150 ease-in-out"
            >
              <Save className="inline-block mr-2 h-4 w-4" />
              Save
            </button>
            {user && (
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
                        <button onClick={() => handleProfileAction('change-email')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200" role="menuitem">
                          <Mail className="mr-3 h-4 w-4 text-gray-400" />
                          Change Email
                        </button>
                        <button onClick={() => handleProfileAction('change-username')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200" role="menuitem">
                          <User className="mr-3 h-4 w-4 text-gray-400" />
                          Change Username
                        </button>
                        <button onClick={() => handleProfileAction('change-image')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200" role="menuitem">
                          <ImageIcon className="mr-3 h-4 w-4 text-gray-400" />
                          Change Profile Image
                        </button>
                        <button onClick={() => handleProfileAction('reset-password')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200" role="menuitem">
                          <Key className="mr-3 h-4 w-4 text-gray-400" />
                          Change Password
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button onClick={() => handleProfileAction('delete-account')} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200" role="menuitem">
                          <Trash2 className="mr-3 h-4 w-4 text-red-400" />
                          Delete Account
                        </button>
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
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex">
        <button
          onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-r-md p-2 shadow-md z-10 hover:bg-gray-50 transition-all duration-300 ease-in-out"
          aria-label={isLeftMenuOpen ? "Close side menu" : "Open side menu"}
        >
          {isLeftMenuOpen ? (
            <ChevronLeft className="h-5 w-5 text-purple-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-purple-600" />
          )}
        </button>

        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${isLeftMenuOpen ? 'w-64' : 'w-0'}`}>
          {isLeftMenuOpen && (
            <div className="p-4 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2 text-purple-600" />
                  Category
                </h2>
                <div className="relative">
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none text-black"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-purple-600" />
                  Tags
                </h2>
                <div className="space-y-2">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-purple-100 text-purple-800 text-sm font-medium px-2 py-1 rounded-full">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 focus:outline-none"
                      >
                        <X className="h-4 w-4 text-purple-600 hover:text-purple-800" />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddTag} className="mt-2 flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-grow mr-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Add
                  </button>
                </form>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Collaborators
                </h2>
                <UserLegend userPositions={userPositions} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-grow flex flex-col">
          <div className="bg-white border-b border-gray-200 p-2 flex justify-center space-x-2 sticky top-0 z-10">
            <button onClick={() => applyMarkdown('bold')} className="p-2 hover:bg-gray-100 rounded" aria-label="Bold">
              <Bold className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex space-x-1">
              <button onClick={() => applyMarkdown('h1')} className="p-2 hover:bg-gray-100 rounded" aria-label="Heading 1">
                <Heading1 className="h-5 w-5 text-gray-600" />
              </button>
              <button onClick={() => applyMarkdown('h2')} className="p-2 hover:bg-gray-100 rounded" aria-label="Heading 2">
                <Heading2 className="h-5 w-5 text-gray-600" />
              </button>
              <button onClick={() => applyMarkdown('h3')} className="p-2 hover:bg-gray-100 rounded" aria-label="Heading 3">
                <Heading3 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <button onClick={() => applyMarkdown('divider')} className="p-2 hover:bg-gray-100 rounded" aria-label="Divider">
              <Minus className="h-5 w-5 text-gray-600" />
            </button>
            <button onClick={() => applyMarkdown('image')} className="p-2 hover:bg-gray-100 rounded" aria-label="Image">
              <ImageIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button onClick={() => applyMarkdown('list')} className="p-2 hover:bg-gray-100 rounded" aria-label="List">
              <List className="h-5 w-5 text-gray-600" />
            </button>
            <button onClick={() => applyMarkdown('link')} className="p-2 hover:bg-gray-100 rounded" aria-label="Link">
              <Link className="h-5 w-5 text-gray-600" />
            </button>
            <button onClick={() => applyMarkdown('code')} className="p-2 hover:bg-gray-100 rounded" aria-label="Code">
              <Code className="h-5 w-5 text-gray-600" />
            </button>
            <button onClick={() => applyMarkdown('quote')} className="p-2 hover:bg-gray-100 rounded" aria-label="Quote">
              <Quote className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div ref={editorRef} className="flex-grow overflow-auto"></div>
        </div>
      </main>

      <div className="bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="mr-2 h-4 w-4" />
          {lastSaved ? `Last saved: ${lastSaved.toLocaleString()}` : 'Not saved yet'}
        </div>
        {autoSaveStatus && (
          <div className="text-sm text-gray-500">
            {autoSaveStatus}
          </div>
        )}
      </div>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Preview</h2>
        <MarkdownPreview content={cmEditorRef.current ? cmEditorRef.current.getValue() : ''} />
      </Modal>

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
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Share Note</h3>

                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-700 mb-3">Users with access:</h4>
                    <div className="bg-purple-50 rounded-lg p-4 max-h-48 overflow-y-auto shadow-inner">
                      {usersWithAccess.length > 0 ? (
                        usersWithAccess.map((userAccess) => (
                          <div key={userAccess.user_id} className="flex items-center justify-between py-2 border-b border-purple-200 last:border-b-0">
                            <div className="flex items-center">
                              {userAccess.is_creator ? (
                                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                              ) : (
                                <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                              )}
                              <span className={`text-sm ${userAccess.is_creator ? 'font-semibold' : 'font-medium'} text-gray-800`}>
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
                                  {removeAccessStatus.userId === userAccess.user_id
                                    ? removeAccessStatus.status === 'success'
                                      ? 'Removed'
                                      : removeAccessStatus.status === 'error'
                                        ? 'Error'
                                        : <Loader className="animate-spin h-3 w-3" />
                                    : (
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mt-4 max-h-60 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <div key={user.user_id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
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
                              : 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100'
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