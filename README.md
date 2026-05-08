# Zexy Admin Dashboard

A modern, production-ready admin dashboard for the Zexy content/media platform built with Next.js 14, TypeScript, and shadcn/ui.

## Features

- 🔐 **OTP-based Authentication** - Secure login with email OTP verification
- 📢 **Notification Campaigns** - Complete CRUD operations for managing notification campaigns
- 🎨 **Dual Theme Support** - Seamless light/dark mode switching
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Modern Stack** - Built with Next.js 14 App Router, TypeScript, and Tailwind CSS
- 🎯 **Type-Safe** - Full TypeScript support with proper type definitions
- 🚀 **Production Ready** - Optimized build with proper error handling

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** shadcn/ui components
- **Styling:** Tailwind CSS
- **Theme Management:** next-themes
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Date Formatting:** date-fns
- **Notifications:** Sonner (toast notifications)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zexy_admin_shadcn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure your API base URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.zexy.live
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
zexy_admin_shadcn/
├── app/
│   ├── (auth)/
│   │   └── login/              # OTP login page
│   ├── (dashboard)/
│   │   ├── campaigns/          # Campaigns list, create, and details
│   │   └── layout.tsx          # Dashboard layout with header
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Root redirect to campaigns
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   └── header.tsx          # Dashboard header
│   ├── protected-route.tsx     # Auth route wrapper
│   ├── theme-provider.tsx      # Theme context provider
│   └── theme-toggle.tsx        # Light/dark mode toggle
├── lib/
│   ├── api/
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── auth.ts             # Auth API functions
│   │   └── campaigns.ts        # Campaigns API functions
│   ├── hooks/
│   │   └── useAuth.tsx         # Authentication hook
│   └── utils.ts                # Utility functions
├── types/
│   ├── auth.ts                 # Auth TypeScript types
│   └── campaigns.ts            # Campaign TypeScript types
└── public/                     # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The dashboard integrates with the Zexy API at `https://api.zexy.live`:

### Authentication Endpoints
- `POST /api/v1/admin/auth/otp/send` - Send OTP to email
- `POST /api/v1/admin/auth/otp/verify` - Verify OTP and get auth token

### Campaign Endpoints
- `GET /api/v1/admin/notifications` - List all campaigns
- `POST /api/v1/admin/notifications` - Create new campaign
- `GET /api/v1/admin/notifications/{id}` - Get campaign details

## Authentication Flow

1. User enters email on login page
2. System sends OTP to the provided email
3. User enters the 6-digit OTP code
4. On successful verification, auth token is stored in localStorage
5. User is redirected to the campaigns dashboard
6. All subsequent API requests include the auth token in headers
7. On 401 errors, user is automatically logged out and redirected to login

## Features in Detail

### OTP Login
- Clean, centered login form
- Two-step process: email → OTP
- 60-second countdown for OTP resend
- Real-time validation
- Error handling with toast notifications

### Campaigns Management
- **List View:** Table with campaign name, status, recipients, and creation date
- **Create Campaign:** Form with name, title, body, and priority fields
- **Campaign Details:** Full campaign information with timeline
- **Status Badges:** Color-coded status indicators (draft, active, scheduled, completed)
- **Empty State:** Helpful UI when no campaigns exist

### Theme Support
- System theme detection
- Manual light/dark mode toggle
- Persistent theme preference
- Smooth transitions between themes

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Optimized for tablets and desktops

## Design Philosophy

The dashboard follows a **Neo-Brutalist Precision** aesthetic:
- Bold, confident typography using Geist Sans
- Sharp edges and strong visual hierarchy
- Purposeful animations and transitions
- Electric blue accent color (#0066FF)
- Generous whitespace and grid-based layouts

## Security Considerations

- Auth tokens stored in localStorage
- Automatic logout on 401 responses
- HTTPS-only API communication
- Client-side and server-side validation
- Protected routes with authentication checks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

Planned features for future releases:
- Dashboard page with analytics and stats
- User management CRUD
- Campaign editing and deletion
- Advanced filtering and search
- Bulk operations
- Real-time notifications
- Campaign analytics
- Role-based access control

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email support@zexy.live or open an issue in the repository.

---

Built with ❤️ by the Zexy Team
