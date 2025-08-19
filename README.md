# GridSync

A desktop web application for prosumers (energy producers-consumers) that automates energy balance calculations from photovoltaic installations and generates reports for grid operators.

**Author:** Matt Sowa <sowa@hush.ai>

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

### v0.1.7 (August 19, 2025)

**Enhanced Reporting and Analytics Integration**

**Major Features:**
- **MWE report generation system** - Comprehensive report generation infrastructure for advanced energy balance analysis
- **Insolation charts API endpoint** - New API endpoint with aggregation functions for enhanced data visualization and analysis
- **Vercel Analytics integration** - Comprehensive user analytics and performance tracking for improved user experience insights

**User Experience Improvements:**
- **Enhanced consumption profile UI** - Improved query handling and formatting for better data presentation
- **Advanced reporting capabilities** - New MWE (Measured Withdrawal Energy) report generation for detailed energy analysis
- **Improved code formatting** - Enhanced code readability and maintainability across the reporting system

**Technical Enhancements:**
- **API aggregation functions** - Enhanced insolation data processing with advanced aggregation capabilities
- **Analytics infrastructure** - Integrated Vercel Analytics for comprehensive application monitoring
- **Query optimization** - Improved consumption profile data queries for better performance
- **Documentation updates** - Streamlined CLAUDE.md for improved development guidance

### v0.1.6 (August 18, 2025)

**Enhanced Timezone Support and Dashboard Improvements**

**Major Features:**
- **Advanced timezone handling** - Comprehensive timezone management for accurate energy data processing across different geographical regions
- **Enhanced dashboard metrics layout** - Improved dashboard layout with optimized metrics display and better visual organization
- **Code formatting and development environment enhancements** - Enhanced development tooling with improved code formatting and developer experience

**User Experience Improvements:**
- **Timezone-aware data processing** - More accurate energy calculations considering local timezone differences
- **Optimized dashboard layout** - Better visual hierarchy and metrics presentation for improved data analysis
- **Enhanced development environment** - Improved code formatting rules and development workflow optimization

**Technical Enhancements:**
- **Timezone utility improvements** - Enhanced date-time handling for global energy data processing
- **Dashboard component optimization** - Better performance and visual consistency across dashboard metrics
- **Development tooling upgrades** - Improved code quality tools and formatting standards

### v0.1.5 (August 17, 2025)

**Advanced Analytics and Performance Enhancements**

**Major Features:**
- **Enhanced insolation data analytics** - Improved data filtering capabilities and table performance optimization for better user experience
- **Advanced consumption tracking integration** - Enhanced dashboard with comprehensive consumption analytics and visual data representation
- **Custom system efficiency configuration** - Implemented configurable efficiency settings for PV installations allowing personalized performance calculations
- **Modernized dashboard UI** - Complete visual design overhaul with enhanced navigation and improved user interface components

**User Experience Improvements:**
- **Optimized data visualization** - Faster loading times and smoother interactions with large datasets
- **Enhanced system metadata** - Improved UI components with better performance and user feedback
- **Advanced filtering capabilities** - More precise data filtering options for better data analysis
- **Streamlined navigation** - Modernized dashboard layout with improved visual hierarchy and accessibility

**Technical Enhancements:**
- **Performance optimization** - Enhanced table performance and data processing efficiency
- **Component modernization** - Updated system components with improved performance characteristics
- **Enhanced environment configuration** - Better type safety and configuration management
- **UI metadata improvements** - Optimized rendering and component state management

### v0.1.4 (August 16, 2025)

**Performance Optimizations and Data Management Improvements**

**Major Improvements:**
- **Optimized batch operations** - Enhanced insolation data processing with improved batch operations and extended timeout handling for better reliability
- **Extended Polish cities support** - Updated comprehensive list of Polish cities for more accurate regional insolation data
- **Enhanced vision service** - Improved data processing variations and performance optimizations

**Technical Enhancements:**
- **Database optimization** - Improved batch operation handling for large-scale insolation data processing
- **Extended timeout support** - Better handling of long-running data processing operations
- **Service reliability** - Enhanced error handling and recovery mechanisms for automated data processing

**Data Management:**
- Expanded geographical coverage with additional Polish cities for more precise location-based calculations
- Improved data processing pipeline efficiency for faster insolation forecast updates
- Enhanced system stability for automated CRON job operations

### v0.1.3 (August 16, 2025)

**Comprehensive Insolation Data Management System**

**Major Features:**
- **Complete insolation data visualization** - Interactive charts and comprehensive data management for solar irradiation forecasts
- **Advanced city-based tracking** - Detailed insolation monitoring per city with historical data and forecasting
- **Automated data processing** - CRON job integration for automatic insolation data updates and maintenance
- **Enhanced production calculations** - Improved PV production estimates using real insolation data for accurate energy balance reports

**User Experience Improvements:**
- **Dedicated insolation dashboard** - New insolation page with comprehensive data visualization and management tools
- **Interactive data charts** - Visual representation of solar irradiation patterns with filtering and analysis capabilities
- **Real-time data updates** - Automatic synchronization of insolation forecasts with improved error handling
- **Production insights** - Enhanced energy production calculations based on actual solar irradiation data

**Technical Implementation:**
- **New API endpoints** - `/api/insolation` and `/api/cron` routes for data management and automated processing
- **Enhanced data services** - InsolationService with comprehensive CRUD operations and data validation
- **Modular component architecture** - InsolationChart, InsolationCard, and InsolationOverview components
- **Automated data pipeline** - CRON authentication and scheduled data processing for reliable updates
- **Production calculation utilities** - Advanced PV production estimation based on location-specific insolation data

### v0.1.2 (August 16, 2025)

**Energy Consumption Profiling Enhancement**

**Major Features:**
- **168-point visual grid editor** - Complete redesign of consumption profiling with interactive 7×24 grid interface
- **Advanced pattern management tools** - Copy day patterns, fill hour ranges, and apply default templates for efficient setup
- **Real-time visual feedback** - Color-coded consumption intensity levels with heat map visualization
- **Auto-save functionality** - Automatic saving with unsaved changes tracking and conflict resolution
- **CSV export capabilities** - Export consumption patterns for external analysis and backup

**User Experience Improvements:**
- **Intuitive grid navigation** - Click-to-edit cells with keyboard navigation support
- **Pattern manipulation tools** - Copy entire day patterns between days and fill specific hours across the week
- **Default templates** - Pre-configured weekday/weekend patterns for quick profile setup
- **Visual consumption indicators** - Daily totals, weekly summaries, and peak consumption highlighting
- **Responsive toolbar** - Comprehensive editing tools with tooltips and clear visual feedback

**Technical Implementation:**
- **Modular component architecture** - Separated ConsumptionGrid, ConsumptionCell, ConsumptionToolbar, and ConsumptionProfileEditor
- **Optimized data handling** - Efficient batch updates and grid-to-profile data transformation utilities
- **SWR integration** - useConsumptionProfile hook with optimistic updates and automatic revalidation
- **API enhancements** - Dedicated consumption profile endpoints with proper validation and error handling
- **Accessibility support** - ARIA labels, keyboard shortcuts, and screen reader compatibility

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
