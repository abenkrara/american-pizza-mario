# Implementation Plan - American Pizza Mario

## Goal
Build a comprehensive, feature-rich website for "American Pizza Mario" (Chiva & Cheste) including a dynamic reservation system and admin dashboard.

## Goal
Build a comprehensive Next.js website for "American Pizza Mario".
**Locations**: Chiva (Bar/Cafeteria with 6 tables) & Cheste (Takeaway only).
**Key Features**: Digital Menu, Chiva Table Reservations (Email Confirmation), Admin Dashboard.

## Proposed Changes
### Project Structure (Next.js 14+)
- `app/layout.tsx`: Root layout with Navbar/Footer.
- `app/page.tsx`: Landing page (Location selector/Hero).
- `app/menu/page.tsx`: Full digital menu.
- `app/reservas/page.tsx`: Reservation form (Only for Chiva).
  - Logic: Max 6 tables concurrently.
  - Confirmation: Send email to client via Nodemailer/Resend.
- `app/admin/page.tsx`: Simple auth protected dashboard to view bookings.

### Design
- **Theme**: Red, White, Green (Italian/Pizza theme) or Classic American Diner style based on "American Pizza".
- **Tech**: Tailwind CSS for rapid styling.

### Data
- **Menu**: Will use findings from web search or placeholders if not found.
- **Hours**:
  - Chiva: (Finding online...)
  - Cheste: (Finding online...)

### Key Features
1.  **Dual Location Support**: Explicitly mention Chiva and Cheste.
2.  **Digital Menu**: Categorized, mouth-watering visuals.
3.  **Reservation Engine**:
    -   Select Location -> Date -> Time -> Party Size.
    -   Email confirmation triggers on success.
4.  **Admin Panel**: Simple view for owners to see upcoming bookings.

## Verification Plan
### Automated Tests
- linting.
- build check.

### Manual Verification
- Test Reservation Flow: Create a booking -> Check Admin Panel -> Verify "Email" (console log or simulated).
- Verify Mobile Responsiveness on all pages.
