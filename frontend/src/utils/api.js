import axios from "axios";

/*Create an axios instance with a base api URL*/
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api",
});

/*Log for debugging purposes*/
console.log(
  "API base URL:",
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"
);

/*interceptor to include the token in headers*/
api.interceptors.request.use(
  (config) => {
    /*interceptor to include the token in headers*/
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken");
        const response = await axios.post("/users/refresh-token", {
          refreshToken,
        });
        const { token } = response.data;

        if (token) {
          localStorage.setItem("token", token);
          sessionStorage.setItem("token", token);
          api.defaults.headers.common["Authorization"] = Bearer ${token};
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh token error (e.g., redirect to login)
        console.error("Error refreshing token:", refreshError);
        window.location.href = "/pages/login";
      }
    }

    return Promise.reject(error);
  }
); */

/**
 * 
 * Login a user with the provided credentials.
 * @param {*} credentials 
 * @returns 
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    const { token, refreshToken, user } = response.data;

    /*Store tokens in localStorage or sessionStorage based on rememberMe*/
    if (credentials.rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("refreshToken", refreshToken);
    }

    return { user, token };
  } catch (err) {
    console.error("Error logging in:", err);
    if (err.response && err.response.data && err.response.data.error) {
      throw new Error(err.response.data.error);
    }
    throw err;
  }
};
/**
 * Logout the current user.
 */
export const refreshToken = async () => {
  try {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");
    const response = await api.post("/users/refresh-token", { refreshToken });
    const { token } = response.data;

    if (token) {
      if (localStorage.getItem("token")) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
    }

    return { token };
  } catch (err) {
    console.error("Error refreshing token:", err);
    throw err;
  }
};

/*Export all API functions to be used by the program*/

/**
 * Fetch all notes.
 * @returns {Promise<Object[]>} - List of notes.
 * @throws {Error} - Throws an error if fetching notes fails.
 */
export const fetchNotes = async () => {
  try {
    const response = await api.get("/notes");
    return response.data;
  } catch (err) {
    console.error("err fetching notes:", err); /*extra logging to console */
    if (err.response && err.response.status === 403) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/pages/login";
      throw new err("Session expired. Please log in again.");
    }
    throw err;
  }
};

/**
 * 
 * Fetches a single note by its ID.
 * @param {string} noteId - The ID of the note to fetch.
 * @returns {Promise<Object>} - The note data.
 * @throws {Error} - Throws an error if fetching the note fails.
 */
export const fetchNote = async (noteId) => {
  try {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  } catch (err) {
    console.error("err fetching note:", err);
    throw err;
  }
};

/**
 *  Add a new note.
 * @param {string} noteData - The data for the new note.
 * @returns {Promise<Object>} - The response data
 * @throws {Error} - Throws an error if fetching the note fails
 */
export const addNote = async (noteData) => {
  try {
    const response = await api.post("/notes", noteData);
    return response.data;
  } catch (err) {
    console.error("err adding note:", err);
    if (err.response && err.response.data && err.response.data.details) {
      throw new err(err.response.data.details);
    }
    throw err;
  }
};

/**
 * Add a user to a note.
 * @param {Object} userNoteData - The user-note relationship data.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if adding the user note fails.
 */
export const addUserNote = async (userNoteData) => {
  try {
    const response = await api.post("/user-notes", userNoteData);
    return response.data;
  } catch (err) {
    console.error("err adding user note:", err);
    throw err;
  }
};

/**
 * Update an existing note.
 * @param {string} noteId - The ID of the note to update.
 * @param {Object} data - The updated data for the note.
 * @returns {Promise<Object>} - The updated note data.
 * @throws {Error} - Throws an error if updating the note fails.
 */
export const updateNote = async (noteId, data) => {
  try {
    const response = await api.put(`/notes/${noteId}`, data);
    return response.data;
  } catch (err) {
    console.error("err updating note:", err);
    if (err.response && err.response.data && err.response.data.details) {
      throw new err(err.response.data.details);
    }
    throw err;
  }
};

/**
 * Delete a note by its ID.
 * @param {string} noteId - The ID of the note to delete.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if deleting the note fails.
 */
export const deleteNote = async (noteId) => {
  try {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  } catch (err) {
    console.error("err deleting note:", err);
    throw err;
  }
};

/**
 * Fetch all categories.
 * @returns {Promise<Object[]>} - List of categories.
 * @throws {Error} - Throws an error if fetching categories fails.
 */
export const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (err) {
    console.error("err fetching categories:", err);
    throw err;
  }
};

/**
 * Add a new category.
 * @param {Object} categoryData - The data for the new category (name, etc.).
 * @returns {Promise<Object>} - The newly created category.
 * @throws {Error} - Throws an error if adding the category fails.
 */
export const addCategory = async (categoryData) => {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data;
  } catch (err) {
    console.error("err adding category:", err);
    if (err.response && err.response.data && err.response.data.details) {
      throw new err(err.response.data.details);
    }
    throw err;
  }
};

/**
 * Update an existing category.
 * @param {string} categoryId - The ID of the category to update.
 * @param {Object} data - The updated data for the category.
 * @returns {Promise<Object>} - The updated category data.
 * @throws {Error} - Throws an error if updating the category fails.
 */
export const updateCategory = async (categoryId, data) => {
  try {
    const response = await api.put(`/categories/${categoryId}`, data);
    return response.data;
  } catch (err) {
    console.error("err updating category:", err);
    if (err.response && err.response.data && err.response.data.details) {
      throw new err(err.response.data.details);
    }
    throw err;
  }
};

/**
 * Delete a category by its ID.
 * @param {string} categoryId - The ID of the category to delete.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if deleting the category fails.
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (err) {
    console.error("err deleting category:", err);
    throw err;
  }
};

/**
 * Fetch all users.
 * @returns {Promise<Object[]>} - List of users.
 * @throws {Error} - Throws an error if fetching users fails.
 */
export const fetchUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (err) {
    console.error("err fetching users:", err);
    throw err;
  }
};

/**
 * Share a note with a user by ID.
 * @param {string} noteId - The ID of the note to share.
 * @param {string} userId - The ID of the user to share the note with.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if sharing the note fails.
 */
export const shareNote = async (noteId, userId) => {
  try {
    const response = await api.post(`/notes/${noteId}/share`, { userId });
    return response.data;
  } catch (err) {
    console.error("err sharing note:", err);
    throw err;
  }
};

/**
 * Register a new user.
 * @param {Object} userData - The data for the new user (username, email, etc.).
 * @returns {Promise<Object>} - The newly created user.
 * @throws {Error} - Throws an error if registering the user fails.
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

/**
 * Send a password reset email.
 * @param {string} email - The email address to send the reset link to.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if sending the email fails.
 */
export const resetPassword = async (email) => {
  try {
    const response = await api.post("/users/reset-password", { email });
    return response.data;
  } catch (err) {
    console.error("err sending password reset email:", err);
    if (err.response && err.response.data && err.response.data.err) {
      throw new err(err.response.data.err);
    }
    throw err;
  }
};

/**
 * Update the user's password.
 * @param {string} email - The email address of the user.
 * @param {string} newPassword - The new password to set.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if updating the password fails.
 */
export const updatePassword = async (email, newPassword) => {
  try {
    const response = await api.post("/users/update-password", {
      email,
      newPassword,
    });
    return response.data;
  } catch (err) {
    console.error("err updating password:", err);
    if (err.response && err.response.data && err.response.data.err) {
      throw new err(err.response.data.err);
    }
    throw err;
  }
};

/**
 * Change the user's email address.
 * @param {string} userId - The ID of the user.
 * @param {string} newEmail - The new email address.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if changing the email fails.
 */
export const changeEmail = async (userId, newEmail) => {
  try {
    const response = await api.post("/users/change-email", {
      userId,
      newEmail,
    });
    return response.data;
  } catch (err) {
    console.error("err changing email:", err);
    if (err.response && err.response.data && err.response.data.err) {
      throw new err(err.response.data.err);
    }
    throw err;
  }
};

/**
 * Change the user's username.
 * @param {string} userId - The ID of the user.
 * @param {string} newUsername - The new desired username.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if changing the username fails.
 */
export const changeUsername = async (userId, newUsername) => {
  try {
    const response = await api.post("/users/change-username", {
      userId,
      newUsername,
    });
    return response.data;
  } catch (err) {
    console.error("err changing username:", err);
    if (err.response && err.response.data && err.response.data.err) {
      throw new err(err.response.data.err);
    }
    throw err;
  }
};

/**
 * Verify the user's password.
 * @param {string} userId - The ID of the user.
 * @param {string} password - The password to verify.
 * @returns {Promise<boolean>} - Returns true if the password is valid, otherwise false.
 * @throws {Error} - Throws an error if verification fails.
 */
export const verifyPassword = async (userId, password) => {
  try {
    const response = await api.post("/users/verify-password", {
      userId,
      password,
    });
    return response.data.isValid;
  } catch (err) {
    return false;
  }
};

/**
 * Change the user's profile image.
 * @param {string} userId - The ID of the user.
 * @param {string} newProfileImageUrl - The new profile image URL.
 * @returns {Promise<Object>} - The response data.
 * @throws {Error} - Throws an error if changing the profile image fails.
 */
export const changeProfileImage = async (userId, newProfileImageUrl) => {
  try {
    const response = await api.post("/users/change-image", {
      userId,
      newProfileImageUrl,
    });
    return response.data;
  } catch (err) {
    console.error("err changing profile image:", err);
    if (err.response && err.response.data && err.response.data.err) {
      throw new err(err.response.data.err);
    }
    throw err;
  }
};

/**
 * Delete user from the database
 * @param {string} userId - The ID of the user to be deleted
 * @returns {Promise<Object>} - Response data
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.post("/users/delete", {
      userId,
    });
    return response.data;
  } catch (err) {
    console.error("err deleting user:", err);
    if (err.response && err.response.data && err.response.data.err) {
      throw new err(err.response.data.err);
    }
    throw err;
  }
};

/**
 * Fetch all users who have access to a specific note.
 * @param {string} noteId - The ID of the note for which users' access is being fetched.
 * @returns {Promise<Array>} - List of users with access to the note.
 * @throws error if the request fails.
 */
export const fetchUsersWithAccess = async (noteId) => {
  try {
    const response = await api.get(`/notes/${noteId}/users`);
    return response.data;
  } catch (err) {
    console.error("err fetching users with access:", err);
    if (err.response && err.response.data && err.response.data.details) {
      throw new err(err.response.data.details);
    }
    throw err;
  }
};

/**
 * Remove a user's access to a specific note.
 * @param {string} noteId - The ID of the note.
 * @param {string} userId - The ID of the user whose access will be removed.
 * @returns {Promise<Object>} - Response after successful deletion.
 * @throws error if the request fails.
 */
export const removeUserAccess = async (noteId, userId) => {
  try {
    const response = await api.delete(`/notes/${noteId}/users/${userId}`);
    return response.data;
  } catch (err) {
    console.error("err removing user access:", err);
    if (err.response && err.response.data && err.response.data.details) {
      throw new err(err.response.data.details);
    }
    throw err;
  }
};

/*export our axios instance*/
export default api;
