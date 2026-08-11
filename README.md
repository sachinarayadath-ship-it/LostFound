# Lost & Found Hub

Build the frontend for LostFound+, a centralized digital platform for reporting, tracking, and recovering lost and found items within a community or organization. This is the React frontend for a MERN stack app — design it to consume a REST API from an Express/MongoDB backend (I'll wire up Axios calls to http://localhost:5000/api/... endpoints separately, so structure components with clear data-fetching boundaries).

Tech stack: React.js, React Router, Redux Toolkit for auth/global state, Axios for API calls, Bootstrap or Material UI for styling — clean, modern, trustworthy look (blues/greens, since this is a civic/community utility app, not flashy).

User roles: Regular User and Admin/Moderator.

Core screens to build:

Home / Landing Page — hero explaining the platform, quick stats (items reported, items recovered), search bar to browse lost/found items without logging in, CTA buttons for "Report Lost Item" / "Report Found Item."

Login / Register — email+password forms, JWT-based auth (store token in Redux + localStorage), form validation, error states.

Browse/Search Listings Page — grid/list of lost and found items, filters (category, location, date range, status: lost/found/claimed/resolved), search bar, pagination, toggle between "Lost Items" and "Found Items" tabs.

Item Details Page — full item info (photo, description, category, location, date, reporter contact via in-app messaging not raw contact info), "Claim This Item" button, status badge (Open/Under Review/Resolved).

Report Item Form (Lost or Found) — multi-field form: title, category dropdown, description, location, date, image upload (drag-and-drop with preview), submit triggers status "Pending Review."

User Dashboard — tabs for "My Reports" (items I've posted) and "My Claims" (items I've claimed), status tracking per item, edit/delete own pending reports.

Notifications Panel — bell icon with dropdown/page listing status updates (e.g., "Your item was matched," "Claim approved"), mark as read.

Admin Dashboard — table view of all reports with filters, moderation actions (approve/reject/mark resolved), user management table, analytics cards (total items, resolution rate, pending reviews), charts for trends over time.

Profile Page — user info, edit profile, change password.

Key UX requirements:

Protected routes (redirect to login if unauthenticated; redirect non-admins away from /admin)

Loading skeletons and empty states for all list views

Toast notifications for actions (submit success, errors)

Fully responsive (mobile-first, since people often report items on their phones)

Image upload preview before submit

Status badges with consistent color coding (Pending=yellow, Matched=blue, Resolved=green, Rejected=red)

Build with reusable components (ItemCard, StatusBadge, FilterBar, ProtectedRoute wrapper) and centralize API calls in a services/api.js file using Axios interceptors for attaching the JWT token. 
this is for frontend only

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/09b25e08-c6c5-4498-9c2f-5b8189c9e457).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
