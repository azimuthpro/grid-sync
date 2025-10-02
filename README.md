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

### v0.5.0 (October 2, 2025)

**Manual Insolation Data Management**

**Major Features:**
- **Manual data fetch endpoint** - New API endpoint for on-demand insolation data retrieval with comprehensive error handling
- **UI data fetch button** - Added interactive button in insolation dashboard for manual data synchronization
- **Enhanced data control** - Users can now trigger insolation data updates manually in addition to automated CRON jobs

**User Experience Improvements:**
- **On-demand data updates** - Manual refresh capability for insolation data without waiting for scheduled updates
- **Better data control** - Direct user control over data synchronization timing
- **Improved feedback** - Real-time status updates when fetching insolation data manually

**Technical Enhancements:**
- **Extended API functionality** - New manual fetch endpoint with proper authentication and validation
- **UI integration** - Seamless integration of manual fetch button in insolation dashboard interface
- **Error handling** - Comprehensive error handling for manual data fetch operations

### v0.4.0 (August 29, 2025)

**Code Quality and Settings Enhancement**

**Major Features:**
- **Password change functionality** - Added complete password management system in settings page with current password verification and secure password updates
- **Enhanced settings interface** - Professional settings page with secure password change form, validation, and user feedback

**Code Quality Improvements:**
- **Standardized code formatting** - Comprehensive formatting standardization with consistent double quotes, semicolons, and code structure across all components
- **Improved component consistency** - Unified formatting patterns in dashboard components for better maintainability
- **Enhanced form handling** - Better password visibility toggles and validation feedback in settings forms

**User Experience Enhancements:**
- **Security-focused design** - Secure password change workflow with current password verification and confirmation
- **Better visual feedback** - Enhanced error and success messaging in settings interface
- **Professional UI styling** - Improved button styling and form layout for better user experience

**Technical Improvements:**
- **Type-safe form validation** - Enhanced password change schema with proper validation rules
- **Secure authentication flow** - Current password verification before allowing password updates
- **Code consistency** - Standardized formatting patterns across all TypeScript and React components

### v0.3.0 (August 25, 2025)

**Polish Localization and Landing Page**

**Major Features:**
- **Complete Polish localization** - Converted all app metadata, UI text, and content to Polish language for native user experience
- **Comprehensive landing page** - Added full-featured homepage with pricing, features showcase, and user onboarding flow
- **Pricing structure** - Added transparent pricing with monthly (90 PLN) and annual (900 PLN) plans, including 2-month discount for yearly subscriptions

**User Experience Improvements:**
- **Native language support** - Full Polish translation including metadata, OpenGraph tags, and UI elements
- **Landing page navigation** - Professional homepage with clear value proposition and call-to-action buttons
- **Pricing transparency** - Detailed pricing information with VAT notice and savings calculation for annual plans

**Technical Enhancements:**
- **HTML language attribute** - Updated to 'pl' for proper browser and screen reader support
- **Enhanced date range handling** - Updated report generation to default to 3-day periods for better data analysis
- **Improved MWE validation** - Removed past date warnings that were causing confusion in report validation
- **Optimized CRON scheduling** - Adjusted insolation data fetch to 8:45 AM for better server resource utilization

### v0.2.2 (August 22, 2025)

**Timezone Fix for MWE Reports**

**Critical Bug Fix:**
- **Resolved timezone shift in MWE reports** - Fixed 1-hour timezone offset issue where generated reports showed hours 7:00-20:00 instead of the correct database range 6:00-19:00
- **Enhanced timezone handling** - Improved `formatMWEDateTime` function to properly handle local timezone without double conversion
- **Updated date processing** - Fixed `calculatePPLAN` function to use proper timezone conversion with `toZonedTime` for accurate database queries

**Technical Improvements:**
- **Corrected datetime formatting** - Removed redundant timezone conversion that was causing hour shifts in report generation
- **Improved date matching** - Enhanced insolation data matching with proper timezone-aware date string formatting
- **Code cleanup** - Removed unused variables and improved code quality

### v0.2.1 (August 21, 2025)

**UI/UX Improvements and Report Formatting Enhancements**

**Major Improvements:**
- **Streamlined report configuration** - Compact 4-column form layout with improved data availability indicators and better visual hierarchy
- **Smart defaults and automation** - Auto-selection of first location and intelligent date range setting (last 2 days) for faster report generation
- **Enhanced MWE report formatting** - Polish decimal notation (3 decimal places with comma separator) and proper kW to MW unit conversion
- **Dark theme enhancements** - Improved date picker calendar icon styling for better visibility in dark mode

**User Experience Enhancements:**
- **Simplified report workflow** - Streamlined configuration form with auto-populated fields and intelligent defaults
- **Better visual feedback** - Repositioned generate button and improved data availability status indicators
- **Cleaner number formatting** - Removed trailing zeros from all formatted numbers for better readability
- **Improved report accuracy** - Enhanced MWE report validation with proper unit conversion and formatting standards

**Technical Improvements:**
- **UI component optimization** - Better layout structure and positioning for improved user experience
- **Number formatting utilities** - Enhanced formatting functions with trailing zero removal across all utilities
- **Report validation enhancements** - Updated MWE report validation with proper MW conversion limits
- **CSS improvements** - Dark theme support for form elements and better cross-browser compatibility

### v0.2.0 (August 20, 2025)

**Enhanced MWE Report System and Code Management**

**Major Features:**
- **MWE code field with auto-populate** - New MWE code field for locations with automatic population in report generation, enhancing report tracking and identification
- **Simplified MWE report generation** - Streamlined report generation process with improved efficiency and cleaner code architecture

**User Experience Improvements:**
- **Automated report identification** - MWE codes are automatically included in generated reports for better tracking and organization
- **Enhanced location management** - New MWE code field provides better identification and organization of energy installations
- **Simplified report workflow** - More efficient report generation process with reduced complexity

**Technical Enhancements:**
- **Refactored report system** - Simplified and optimized MWE report generation codebase for better maintainability
- **Enhanced location schema** - Extended location data model to support MWE code tracking
- **Code organization improvements** - Better structured report generation logic with improved readability

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
