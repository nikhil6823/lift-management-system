# Lift Management System

A role-based MERN application for managing lift assets, field technicians, service work, attendance, expenses, payroll records, and technician location updates.

## Included modules

- Admin, technician, and customer authentication with JWTs
- Lift inventory with maintenance status and service dates
- Employee profiles linked to authenticated users
- Service request lifecycle and technician assignment
- Attendance clock in/out, expense submissions, and salary slips
- Location history and live Socket.IO technician updates
- Customer lift status reports and image uploads, shown on the admin lift registry and live map
- Customer service or new-lift enquiries, plus shared and private real-time chat
- Responsive React workspace for both roles

## Quick start

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Copy `client/.env.example` to `client/.env` if the API is not at `http://localhost:5000/api`.
3. Install and start the API:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

4. In another terminal, start the client:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

The initial public registration creates the sole bootstrap administrator. After that, an administrator provisions technician accounts from **Employees**. Customers can create their own accounts at **/customer/login** and must be assigned to a lift from the admin lift form before they can report or request service for it.

## Environment variables

| File | Variables |
| --- | --- |
| `server/.env` | `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, optional `CLOUDINARY_*` |
| `client/.env` | `VITE_API_URL`, `VITE_SOCKET_URL` |

## Production notes

- Use a managed MongoDB database and a strong, rotated `JWT_SECRET`.
- Serve the built client behind TLS and restrict `CLIENT_URL` to its deployed origin.
- Configure Cloudinary before accepting real receipts or documents.
- Add audit logging, rate limiting, email delivery, and a migration/seed strategy before a public launch.

## Deploying to Vercel and Railway

The repository includes `server/railway.json` for the API and `client/vercel.json` for React Router history fallback.

1. Create a MongoDB Atlas database and copy its connection string.
2. In Railway, create a new project and deploy from this GitHub repository. Set the service root directory to `/server`.
3. Railway will use `server/railway.json`, install dependencies, run `npm start`, and check `/health`.
4. Add these Railway variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and all `SMTP_*` values. Add Cloudinary values if uploads are required.
5. Generate a Railway public HTTPS domain for the API, for example `https://lift-management-api.up.railway.app`.
6. Import the repository into Vercel with `client` as the Root Directory. Set `VITE_API_URL` to `<RAILWAY_URL>/api` and `VITE_SOCKET_URL` to `<RAILWAY_URL>`.
7. After Vercel provides its HTTPS URL, set Railway `CLIENT_URL` to that exact origin and redeploy the API.
8. Configure SMTP before using email verification or two-step login. Do not use development secrets or commit `.env` files.

For a manual Vercel setup, use `client` as the project root, `npm run build` as the build command, and `dist` as the output directory.
