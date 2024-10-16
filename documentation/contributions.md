# Contributions.md

This document outlines all external sources and AI assistance used during the development of our collaborative note-taking web app, as required by the project specification. We have listed the AI prompts used, along with a description of where and how the AI-assisted code was implemented or altered, as well as external code sources used without AI.

## AI Prompts and Assistance

### Prompt:
"Generate a simple React.js component that uses Tailwind CSS to create a responsive note-taking interface."
Usage:
This prompt provided the initial layout structure for our note-taking component. We adapted the generated code to include dynamic content rendering using our backend API.
Modifications:
The AI-generated component used static data for notes, which we replaced with API calls to fetch notes from the PostgreSQL database. We also implemented real-time collaboration by integrating WebSockets for live editing.

### Prompt:
"How do I integrate Yjs with CodeMirror for real-time collaborative editing?"
Usage:
This prompt helped us integrate Yjs with CodeMirror to enable real-time collaborative editing in our note-taking app. Yjs handles the synchronization of edits, while CodeMirror provides the text editor interface.
Modifications:
We added logic to track user cursors and implemented conflict resolution to ensure smooth collaboration when multiple users edit the same note. This required additional customization of the CodeMirror integration to support markdown formatting.

### Prompt:
"How can I implement password reset functionality with email in a Next.js app?"
Usage:
AI provided a step-by-step guide on building a password reset flow, including setting up an email service to send reset links.
Code:

javascript
Copy code
const handleResetPassword = async (e) => {
   e.preventDefault();
   setError("");
   setIsLoading(true);

   try {
     const data = await resetPassword(email);
     setConfirmation(true);
   } catch (err) {
     setError("Please input your correct email address");
   } finally {
     setIsLoading(false);
   }
 };
### Modifications:
The AI-generated code was used as a base for our password reset form, but we integrated additional form validation and error handling to improve user experience. We also customized the email template and integrated the form into our existing authentication system.

### Prompt:
"Generate WebSocket code for real-time note sharing in a collaborative note-taking app."
Usage:
AI assisted in generating boilerplate WebSocket code to handle multiple users editing a note simultaneously.
Modifications:
We tailored the code to track active users in real time, and added logic to prevent conflicts when users edit the same portion of a note simultaneously.

### Prompt:
"Explain the difference between authn and authz."
Usage:
This was used to clarify the distinction between authentication (authn) and authorization (authz) for the report section.
Modifications:
The generated explanation was used almost verbatim in our report, but we added examples specific to our app.

### Our chatGPT chats:

- [yjs issue debugging](https://chatgpt.com/share/670e2413-8d88-8013-a3e2-e6b9953e57b1)
- [json webtoken error debugging](https://chatgpt.com/share/670e2471-1e54-8013-995d-f2cb1d550caf)
- [permission errors](https://chatgpt.com/share/670e249b-bbec-8013-8501-d253aee338c6)
- [authN and authZ](https://chatgpt.com/share/670e24e2-d9dc-8013-89d4-b348452528c1)
- [preview notes bug fix](https://chatgpt.com/share/670e2530-4b24-8013-8566-9bbeba1f1163)


## Generative UI with V0

### Prompt:
"How can I use V0 to generate a consistent, responsive UI for my Next.js app?"
Usage:
We used V0 to generate several UI components, including buttons, forms, and modals, ensuring a cohesive design throughout the app. V0 helped us maintain consistent styling with Tailwind CSS and implement responsive design features.
Modifications:
We customized the generated components to match our color scheme and added accessibility features, such as keyboard navigation support.
External Code Sources
shadcn/ui Component Library
Source: shadcn/ui components
Usage: We used components from this library, specifically the button and modal components.
Modifications: The components were customized with our app's theme and responsive design needs. Notably, we modified the modal component to allow real-time collaboration notification.

Marked.js
Source: Marked.js Documentation
Usage: We used Marked.js to handle the conversion of markdown text into HTML.
Modifications: None. The library was used as-is to implement markdown rendering in our note-taking editor.

### Some v0 chats:

- [header redesign](https://v0.dev/chat/5alhx9MCalr)
- [Notes side menu animation and icon](https://v0.dev/chat/gLtnWJ45I9k)
- [Notes blocks TailwindCSS](https://v0.dev/chat/Bq7iJgSMZmL)


## Group-Written Code Without AI Assistance

### Server.js for Yjs Logic and Middleware
We built the server.js file to handle Yjs logic in the backend. This included setting up the WebSocket server to manage real-time collaboration on notes. We also integrated middleware to protect API routes, ensuring that only authenticated users could interact with the Yjs instance.
Relevant resource: Protecting API Routes in Express.js

### Designing Page Layouts and Flow
Before using AI (V0) to generate components, our group designed the layout and flow of all pages manually. We focused on creating intuitive navigation and a smooth user experience across login, notes, and collaboration pages. Later, AI helped us refine these components with Tailwind CSS to ensure a more responsive and styled interface that followed a consistent theme.

### Update Password, Change Email, Change Name, Change Avatar
We implemented user profile functionality where users can update their password, change their email, update their display name, and modify their avatar. This was done using custom-built forms and routes to securely handle each operation via our API.
Relevant resource: How to create user settings in Node.js

### Search Bar and Filters
We created a search bar and implemented filtering functionality for the notes page. This allowed users to search notes by title, filter by category, and sort by time last edited. The code was written by us, relying on PostgreSQL queries and dynamic front-end updates using React.
Relevant resource: Implementing search and filter with PostgreSQL