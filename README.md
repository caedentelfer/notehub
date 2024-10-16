# Group 41 - NoteHub: Note sharing webapp

## Getting Started

To run locally, the packages need to be installed in /front end and /backend. The server needs to be run in /backend and the react app needs to run from /frontend.

** This is all done automatically in the makefile: **

In the project root run:

```bash
make
```

this should sort everything out automatically so its better to ALWAYS run the makefile to run if in doubt

Open [http://localhost:3000

The web pages auto-updates as you edit the file. If you make changes to backend files, you will need to run make again

## A note on testing/continuous integration

```bash
make Frontend-Test
```

Alternatively 

cd frontend/
npm run build

This will compile and if successful (Frontend Build: PASS)  proceed to commit
and push
Reason for performing compilation test locally is there is a resource limitation
on the gitlab runners
