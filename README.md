# GridSync

A desktop web application for prosumers (energy producers-consumers) that automates energy balance calculations from photovoltaic installations and generates reports for grid operators.

## Features

### 🏠 Multi-Location Management
- Manage multiple PV installations with different configurations
- Each location has its own power capacity and consumption profile
- Primary location designation for quick access

### ⚡ Energy Consumption Profiling
- Define 168-point weekly consumption patterns (7 days × 24 hours)
- Visual grid editor for easy pattern configuration
- Copy and fill functions for efficient profile setup

### 📊 Automated Report Generation
- Generate CSV reports with hourly energy balance forecasts
- Combine PV production estimates with your consumption patterns
- Export ready-to-send files for grid operators

### 🤖 AI-Powered Energy Assistant
- Get personalized energy optimization advice
- Ask questions about your energy usage patterns
- Receive suggestions for optimal energy consumption timing

### 📈 Data Visualization
- Interactive charts showing energy production vs consumption
- Visual balance analysis to optimize energy usage
- Historical data trends and forecasting

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **AI Integration**: Vercel AI SDK with Google Gemini
- **UI Components**: Radix UI with custom styling
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **CSV Export**: PapaParse for report generation

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd grid-sync
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

4. Set up the database:
- Create a new Supabase project
- Run the database migrations (SQL files in `/database` folder)
- Configure Row Level Security policies

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### user_locations
Stores user's PV installation locations:
- `id`: Primary key (UUID)
- `user_id`: Foreign key to auth.users
- `name`: Location name (e.g., "Home", "Office")
- `city`: City name for weather data
- `pv_power_kwp`: PV installation power in kWp
- `is_primary`: Boolean flag for primary location

### consumption_profiles
Stores hourly consumption patterns:
- `id`: Primary key (UUID)
- `location_id`: Foreign key to user_locations
- `day_of_week`: Day of week (0-6)
- `hour`: Hour of day (0-23)
- `consumption_kwh`: Energy consumption in kWh

### insolation_data
Stores solar irradiation forecasts:
- `id`: Primary key (auto-increment)
- `city`: City name
- `date`: Forecast date
- `hour`: Hour (0-23)
- `insolation_percentage`: Solar irradiation percentage

## Development

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication routes
│   ├── dashboard/    # Protected dashboard routes
│   └── api/            # API endpoints
├── components/         # React components
│   ├── ui/            # Basic UI components
│   ├── locations/     # Location management
│   ├── reports/       # Report generation
│   └── ai-assistant/  # AI chat widget
├── lib/               # Utility libraries
│   ├── supabase/     # Supabase client & queries
│   ├── schemas/      # Zod validation schemas
│   └── utils/        # Helper functions
└── types/            # TypeScript definitions
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

### Design Principles

- **Desktop-First**: Optimized for desktop use (min-width: 1024px)
- **Type Safety**: Comprehensive TypeScript coverage with Zod validation
- **Security**: Row Level Security policies for data protection
- **Performance**: Optimized with Next.js 15 and React 19
- **User Experience**: Intuitive interface with real-time feedback

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Version History

### v0.1.1 (August 14, 2025)

**Performance Improvements**

**Technical Updates:**
- **Enhanced data fetching** - Implemented SWR for improved caching and real-time data synchronization
- **Optimized API routes** - Refactored data fetching patterns for better performance and reliability
- **Improved client-side state management** - Enhanced data loading states and error handling

**Developer Experience:**
- Better data caching strategies for faster page loads
- More reliable API error handling and retry mechanisms
- Optimized network request patterns for reduced server load

### v0.1.0 (August 14, 2025)

**Initial Release** - Full-featured GridSync application for prosumer energy management

**Core Features:**
- **Multi-location PV management** - Add, edit, and manage multiple photovoltaic installations
- **168-point consumption profiling** - Define detailed weekly energy consumption patterns (7 days × 24 hours)
- **Automated CSV report generation** - Export energy balance forecasts for grid operators
- **AI-powered energy assistant** - Get personalized optimization advice via Google Gemini integration
- **Interactive data visualization** - Charts showing energy production vs consumption balance

**Technical Implementation:**
- Built with Next.js 15 App Router and React 19 for modern performance
- Supabase backend with PostgreSQL database and Row Level Security
- TypeScript with strict mode and comprehensive Zod validation schemas
- Tailwind CSS v4 with custom properties for responsive desktop-first design
- Vercel AI SDK integration with Google Gemini for intelligent energy recommendations
- Recharts for interactive energy balance visualizations
- React Hook Form with Zod resolver for robust form handling

**Architecture Highlights:**
- Desktop-optimized interface (minimum 1024px width)
- Secure authentication with Supabase Auth and protected routes
- Real-time data synchronization and state management with Zustand
- Comprehensive error handling and loading states
- Type-safe API routes and database operations

## License

This project is licensed under the MIT License - see the LICENSE file for details.
