# Small Paws Club - Static Ecommerce Site

## Overview

Small Paws Club is a static ecommerce homepage for a UK-based dropshipping store specializing in products for small mammals (rabbits, guinea pigs, hamsters, rats, and ferrets). This is Phase 2 of the project, focusing on a responsive, mobile-first design with modular SCSS architecture and JSON-driven product showcase.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static Site**: Pure HTML, CSS, and vanilla JavaScript
- **Mobile-First Responsive Design**: Progressive enhancement from mobile to desktop
- **Modular SCSS**: Component-based styling with BEM methodology
- **JSON Data Layer**: Product information stored in JSON files for easy management

### Styling Framework
- **SCSS Compilation**: Using Sass for modular stylesheets
- **CSS Architecture**: BEM (Block Element Modifier) naming convention
- **Responsive Breakpoints**: Mobile-first approach with media queries
- **Design System**: Consistent spacing scale (4px increments), typography (Poppins), and color palette

### Build Tools
- **Live Server**: Development server for local testing
- **Sass**: CSS preprocessor for modular styling
- **No Build Process**: Simple compilation to static files

## Key Components

### Navigation System
- **Responsive Header**: Desktop horizontal navigation with mobile hamburger menu
- **Mobile Drawer**: Slide-out navigation for mobile devices
- **Cart Integration**: Shopping cart icon with accessibility considerations

### Product Display
- **JSON-Driven Products**: Featured products loaded from `data/featured-products.json`
- **Dynamic Content**: JavaScript renders product cards from JSON data
- **Product Schema**: Includes pricing, descriptions, categories, badges, and inventory status
- **Individual Product Pages**: Dynamic product detail pages using URL parameters
- **Shop Page Filtering**: Real-time category and price filtering without page reloads
- **Enhanced Product Details**: Quantity selector, related products, clickable breadcrumbs, image gallery placeholders
- **Mobile-First Layout**: Product images display first on mobile, info below for optimal UX

### Brand Implementation
- **Typography**: Poppins font family (400/600/700 weights)
- **Color Palette**: Cream (#FBF8F5), Sage (#BFD8C2), Blush (#F9D8D6), Dusty Blue (#AEC9E2), Dusty Orange (#F4A269)
- **Spacing System**: 4-8-12-16-24-32-48-64px scale
- **Border Radius**: Consistent 0.75rem for all components

## Data Flow

### Product Management
1. **Data Source**: JSON files in `/data/` directory
2. **Product Loading**: JavaScript fetches and renders products dynamically
3. **Content Structure**: Each product includes metadata for display and commerce functionality

### User Interactions
1. **Navigation**: Mobile toggle, drawer controls, and menu interactions
2. **Email Signup**: Newsletter subscription form handling
3. **Product Filtering**: Real-time filtering by category and price range
4. **Product Details**: Dynamic loading of individual product pages
5. **Shopping Cart**: Add to cart functionality with visual feedback
6. **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## External Dependencies

### CDN Resources
- **Google Fonts**: Poppins font family hosting
- **Feather Icons**: Icon library for UI elements
- **Font Preconnect**: Performance optimization for external fonts

### Development Dependencies
- **Live Server**: Local development server (v1.2.2)
- **Sass**: CSS preprocessing (v1.89.2)

### Third-Party Integrations
- **Font Loading**: Google Fonts with preconnect optimization
- **Icon System**: Feather Icons for consistent iconography

## Deployment Strategy

### Static Hosting Ready
- **No Server Requirements**: Pure static files (HTML, CSS, JS)
- **CDN Compatible**: All assets can be served from content delivery networks
- **Performance Optimized**: Minimal dependencies, optimized loading

### Development Workflow
- **SCSS Compilation**: Manual or automated compilation to CSS
- **Live Reload**: Development server with auto-refresh capabilities
- **Asset Organization**: Structured file system for maintainability

### Future Considerations
- **Ecommerce Integration**: Ready for payment processing and inventory management
- **CMS Integration**: JSON structure allows for easy headless CMS migration
- **Performance Monitoring**: Foundation set for analytics and performance tracking