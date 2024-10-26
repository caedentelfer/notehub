NoteHub: Note sharing webapp

## Getting Started

To run locally, the packages need to be installed in /front end and /backend. The server needs to be run in /backend and the react app needs to run from /frontend.

**This is all done automatically in the makefile:**

In the project root run:

```bash
make
```

Open [http://localhost:3000]

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
