# Taskbro

A React-based project management application built for a frontend developer assessment. Taskbro supports full project and task management with a drag-and-drop Kanban board, activity history, and member management all integrated with a live REST API.

---

## Features

- **Authentication** — Sign up and sign in with form validation and duplicate-submission prevention

- **Project Management** — Create, edit, search, filter, and sort projects

- **Task Management** — Create and edit tasks with a structured detail panel

- **Kanban Board** — Three-column board (To-do, In Progress, Done) with board and list view toggle

- **Drag & Drop** — Optimistic drag-and-drop with automatic rollback on API failure

- **Activity History** — Chronological feed grouped by date with search and time-range filtering

- **Change Log** — Structured event history per task (status changes, comments)

- **Search & Filtering** — Search, status filter, date filter, and sort on board and projects pages

- **Member Management** — View all members with a slide-in detail panel

- **Change Password** — Authenticated user can update their password

---

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS**
- **Axios**
- **React Router v6**
- **Context API**
- **@hello-pangea/dnd**

---

## Project Structure

```
taskbro/
├── public/                           # Static assets served as-is
├── src/
│   ├── api/                          # One module per API resource (auth, projects, tasks, changelog, members)
│   ├── components/
│   │   ├── auth/                     # Sign in / sign up forms, overlay, layout, auth card
│   │   ├── board/                    # Kanban board, columns, task cards, drag-and-drop, list view toggle
│   │   ├── cards/                    # Project card component
│   │   ├── forms/                    # Reusable form primitives shared across features
│   │   ├── layout/                   # AppLayout, Topbar, MembersPanel, sidebar shell
│   │   ├── modals/                   # Add/edit project, add task, change password modals
│   │   ├── task/                     # Task detail panel, changelog feed, status badge
│   │   └── ui/                       # Shared primitives — Button, Input, Toast, FilterDropdown
│   ├── pages/                        # Route-level components mapped to React Router v6 routes
│   ├── store/                        # Context providers for global state (auth, members, projects)
│   ├── utils/                        # Date formatting, status color helpers, changelog parser
│   ├── App.css                       # Global app-level styles
│   ├── App.jsx                       # Root component, router setup, context wiring
│   ├── index.css                     # Tailwind base directives and CSS resets
│   └── main.jsx                      # React DOM entry point
├── .gitignore
├── eslint.config.js                  # ESLint rules and config
├── index.html                        # Vite HTML entry point
├── package.json                      # Dependencies and scripts
├── package-lock.json
├── README.md
├── tailwind.config.js                # Tailwind theme and content paths
└── vite.config.js                    # Vite bundler config
```

---

## Installation

```bash
git clone https://github.com/SisahmeSed/ProjectManagement-Taskbro
cd ProjectManagement-Taskbro
npm install
```

---

## Running Locally

```bash
npm run dev       # Development server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
```

---

## Challenges Encountered During Development

- **Stateless login response** — The authentication endpoint returns only `"ok"` on success without a user profile or token payload. So I derived session state from the submitted credentials and stored them locally, treating a successful `201` response as the source of truth for the authenticated user.

- **Change password lookup dependency** — The change password endpoint requires both `user_id` and `email`, but neither is reliably available post-login given the stateless auth response. So I perform a member lookup when the modal opens to fill the required fields before the update request is issued.

- **Project creation ID mismatch** — The project creation endpoint returns a different user identifier than the one submitted in the request body. So I re-fetch the full project list after creation rather than appending the response directly, ensuring displayed data always reflects actual server state.

- **Backend timestamp offset** — Activity timestamps appeared eight hours ahead because the backend stores Manila local time but labels it as UTC, causing a double conversion in the browser. So I applied a consistent −8 hour correction at the display layer across the Activity page and Task Detail panel, with inline comments documenting the root cause and the correct backend fix.

- **Unstructured changelog data** — The changelog API exposes only a free-text `remark` field instead of typed event metadata. So I adopted a lightweight encoding scheme (`moved::`, `comment::`) to embed structured data in the remark string, then wrote a frontend parser to transform raw entries into human-readable activity events.

- **Limited task API fields** — The task endpoint returns a minimal field set with no assignee, priority, or label data. So I focused on layout and information hierarchy structured field rows, status badges, and a parsed activity timeline to ensure the task detail panel feels complete rather than exposing the API's constraints.

- **Drag-and-drop synchronization** — Status changes via drag-and-drop require three sequential side effects: a task `PATCH`, a changelog `POST`, and a UI state update. So I implemented an optimistic update strategy that reflects the change immediately, with a full rollback to the previous state and an error toast if any step in the chain fails.

- **Activity feed transformation** — Raw changelog entries required cross-referencing tasks and projects to produce readable feed items. So I fetch all three datasets in parallel on page load and join them client-side using ID maps, avoiding sequential requests and keeping the feed load time flat.

- **Member data aggregation** — Member management required correlating data across the member list, the authenticated session, and the change password flow, each sourced from separate endpoints. So I used `MemberContext` to share member data across the panel and settings flows without redundant fetches.

- **Intentional component locality** — Several sub-components (`MemberSkeleton`, `MemberRow`, `MemberDetail`) appeared to be extraction candidates but were tightly coupled to a single feature with no reuse surface elsewhere. So I kept them co-located within `MembersPanel.jsx` to avoid premature abstraction that would create the appearance of reusability without the substance of it.

---

## Known Limitations

- No project deletion — the backend does not expose a DELETE endpoint for projects
- No task deletion — the backend does not expose a DELETE endpoint for tasks
- Sessions do not persist across page refresh — dependent on the assessment backend's auth implementation
- All changelog entries are global; project-scoped filtering is handled client-side
- Member roles are read-only; the API does not support role assignment or project-level membership

---

## Future Enhancements

**Collaboration**
- Task comments with file and image attachments
- User @mentions with notification delivery
- Deep-link navigation from activity feed to the source task or comment

**Team Management**
- Role assignment by administrators
- Project-level member scoping and invitations
- Task assignee field with multi-assignee support

**Task Management**
- Due dates with overdue indicators
- Priority levels and labels
- Rich text descriptions

**User Experience**
- Mobile-responsive layout for on-the-go task and project management

---

## Assessment Notes

- All required assessment features were implemented and integrated with the live API
- Additional UI/UX improvements added: board/list toggle, skeleton loaders, toast notifications, optimistic      drag-and-drop with rollback, and custom filter controls
- Architecture refactored to prioritize component reusability, separation of concerns, and maintainability
- Delivered within the assessment time frame with attention to both functionality and code quality
