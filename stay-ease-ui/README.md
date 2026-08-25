# StayEase - Hotel Booking & Management System

A modern hotel booking and management platform built with React, TypeScript, and Vite. StayEase provides users with an intuitive interface to search for hotels, make bookings, and manage their reservations. Hotel managers and administrators have dedicated dashboards for property and system management.

## Features

### User Features
- 🔍 **Hotel Search & Discovery** - Search hotels by city with advanced filtering options
- 🛏️ **Room Browsing** - View available rooms with detailed information and pricing
- 📅 **Booking Management** - Book rooms and manage active reservations
- 👤 **User Authentication** - Secure login and registration system
- 💾 **Stay History** - View past and current bookings in "My Stays"

### Manager Features
- 📊 **Property Dashboard** - Monitor hotel operations and bookings
- 🏢 **Hotel Management** - Manage property details and room inventory

### Admin Features
- ⚙️ **System Administration** - Central dashboard for system-wide management

## Tech Stack

- **Frontend Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (fast build and HMR)
- **Styling:** CSS
- **Testing:** Vitest
- **Linting:** ESLint
- **State Management:** React Context API (Auth & Toast)
- **HTTP Client:** Fetch API with custom client wrapper

## Project Structure

```
src/
├── api/                  # API client and mock data
│   ├── client.ts        # HTTP client wrapper
│   └── mockApi.ts       # Mock API responses
├── assets/              # Static assets
├── components/          # Reusable React components
│   ├── HotelCard.tsx    # Hotel display card
│   ├── RoomCard.tsx     # Room display card
│   └── SearchForm.tsx   # Search form component
├── constants/           # Application constants
│   ├── cities.ts        # Available cities
│   └── strings.ts       # UI strings/labels
├── contexts/            # React Context for state
│   ├── AuthContext.tsx  # Authentication state
│   └── ToastContext.tsx # Toast notifications
├── pages/               # Page components (routes)
│   ├── AdminDashboard.tsx
│   ├── BookingPage.tsx
│   ├── Home.tsx
│   ├── HotelDetail.tsx
│   ├── HotelsList.tsx
│   ├── LoginRegister.tsx
│   ├── ManagerDashboard.tsx
│   └── MyStays.tsx
├── tests/               # Test files
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/stay-ease-ui.git
   cd stay-ease-ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or if you encounter peer dependency conflicts:
   npm install --legacy-peer-deps
   # or
   yarn install
   ```

3. **Environment Setup (if needed):**
   Create a `.env` file in the root directory and configure API endpoints:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

### Development

**Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Features enabled in dev mode:**
- Hot Module Replacement (HMR) - instant updates on file changes
- ESLint validation
- TypeScript strict mode checking

### Building

**Create a production build:**
```bash
npm run build
```

The optimized build will be generated in the `dist/` directory.

**Preview production build locally:**
```bash
npm run preview
```

## Testing

**Run tests:**
```bash
npm run test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Generate coverage report:**
```bash
npm run test:coverage
```

## Code Quality

**Run ESLint:**
```bash
npm run lint
```

**Fix linting issues:**
```bash
npm run lint:fix
```

## API Integration

The application uses a mock API layer for development. API calls are centralized in [src/api/client.ts](src/api/client.ts).

### Switching to Real API
Update the API client configuration in `src/api/client.ts` to point to your backend server:
```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080/api';
```

## Authentication Flow

1. Users can register or login via the [LoginRegister.tsx](src/pages/LoginRegister.tsx) page
2. Authentication state is managed globally via [AuthContext.tsx](src/contexts/AuthContext.tsx)
3. Protected routes should check authentication status before rendering

## Error Handling & Notifications

Toast notifications for user feedback are provided through [ToastContext.tsx](src/contexts/ToastContext.tsx). Use this context to show success, error, warning, and info messages throughout the application.

## Development Guidelines

- **Components:** Keep components focused and reusable
- **Types:** Always define proper TypeScript types (see [types.ts](src/types.ts))
- **API Calls:** Use the centralized API client
- **State Management:** Use React Context for global state, hooks for local state
- **Testing:** Write tests for components and utilities
- **Styling:** Keep CSS modular and organized

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Vite provides lightning-fast development experience with ESM-based dev server
- Production builds are optimized for minimal bundle size
- Code splitting is automatically configured

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Troubleshooting

### Port already in use
If port 5173 is already in use, Vite will automatically use the next available port.

### Build failures
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: Remove `.vite` folder

### TypeScript errors
Ensure all dependencies are installed and your IDE is properly configured with TypeScript support.

## License

This project is part of Capstone FSEJAVA Team 40 - StayEase

## Support & Documentation

For more information, see:
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup details
- [package.json](package.json) - Project dependencies and scripts
