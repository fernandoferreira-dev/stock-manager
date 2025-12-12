# Stock Management Frontend

React + Vite frontend for the Laboratory Stock Management System. Provides a modern UI for inventory management, request handling, and RFID operations.

## Features

-   **Responsive Design**: Mobile-friendly interface with Tailwind CSS
-   **User Authentication**: JWT-based login system
-   **Dashboard**: Overview of inventory and pending requests
-   **Inventory Management**: View and manage laboratory articles
-   **Request System**: Create and track article requests
-   **Admin Panel**: Manage users, categories, and system settings
-   **Reports**: View detailed inventory reports
-   **Real-time Updates**: React components with dynamic state management

## Tech Stack

-   **Framework**: React 19
-   **Build Tool**: Vite
-   **Styling**: CSS3 with responsive design
-   **Routing**: React Router v7
-   **HTTP Client**: Fetch API
-   **Authentication**: JWT tokens
-   **UI Components**: Custom React components

## Prerequisites

-   Node.js 18 or higher
-   npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure API URL in `src/utils/apiUrl.js`:

```javascript
const API_URL = "http://localhost:8000/api";
export default API_URL;
```

## Development

Start the development server with HMR (Hot Module Replacement):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building

Create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Linting

Check code quality with ESLint:

```bash
npm run lint
```

## Preview

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── tableges.jsx     # Admin inventory table
│   ├── tableuser.jsx    # User inventory view
│   ├── pedidos.jsx      # Request management
│   ├── meusPedidos.jsx  # User's requests
│   ├── reportsges.jsx   # Reports view
│   ├── cart.jsx         # Shopping cart component
│   ├── Sidebar.jsx      # Navigation sidebar
│   ├── Navbar.jsx       # Top navigation
│   ├── login-form.jsx   # Login page
│   └── ...more components
├── styles/              # CSS stylesheets
│   ├── App.css          # Main styles
│   └── globals.css      # Global styles
├── utils/               # Utility functions
│   └── apiUrl.js        # API configuration
├── App.jsx              # Main app component
└── main.jsx             # React DOM entry point
```

## Key Components

### App.jsx

Main application component that handles:

-   Authentication state
-   Page routing and navigation
-   Sidebar/Navbar visibility
-   Role-based access control

### Login Form

-   Email and password authentication
-   JWT token storage
-   Error handling

### Inventory Tables

-   **Admin View**: Full inventory with CRUD operations
-   **User View**: Filtered inventory for article requests

### Request Management

-   Create new article requests
-   Track request status
-   View request history

### Reports

-   Generate inventory reports
-   View usage statistics
-   Export data

## Authentication

The application uses JWT tokens for authentication:

1. User logs in with email/password
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is sent with each API request in Authorization header

Expired tokens will redirect users to the login page.

## API Integration

All API calls are made through `/src/utils/apiUrl.js`. The base URL should point to your backend API:

```javascript
const API_URL = "http://your-api-server:8000/api";
```

## Styling

The project uses custom CSS with a focus on:

-   Clean, modern design
-   Responsive layouts
-   Consistent color scheme
-   Accessible components

## Performance

-   Lazy loading of components with React.lazy
-   Code splitting via Vite
-   Suspense boundaries for loading states
-   Optimized bundle size

## Browser Support

-   Chrome (latest)
-   Firefox (latest)
-   Safari (latest)
-   Edge (latest)

## Troubleshooting

### API Connection Issues

-   Check that backend server is running on the correct port
-   Verify CORS headers in backend
-   Check apiUrl.js configuration

### Authentication Errors

-   Clear browser localStorage and retry login
-   Check JWT_SECRET in backend .env
-   Verify token expiration settings

### Build Issues

-   Delete node_modules and package-lock.json
-   Run `npm install` again
-   Clear Vite cache with `npm run build -- --force`

## Development Tips

-   Use React DevTools extension for debugging
-   Check browser console for API errors
-   Use Network tab to inspect API requests
-   Hot Module Replacement works automatically during `npm run dev`

## Contributing

When contributing to the frontend:

1. Follow existing code style
2. Test components in different screen sizes
3. Ensure proper error handling
4. Add appropriate loading states
5. Update documentation as needed

## License

This project is open source and available under the MIT License.
