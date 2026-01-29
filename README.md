# Order Management Frontend (React + Vite + TypeScript + Tailwind)

## Overview
A role-based Order Management UI built with React Router, local state store (OrdersProvider), and responsive UI.

## Roles
- **clerk**: can create new orders, edit all fields on detail, delete orders
- **staff**: can view assigned orders, can change status (Save Changes)
- **boss**: read-only overview (can view all orders)

## Features
- Login with role selection (demo)
- Orders list:
  - search (customer/product/id/staff)
  - filters (status, staff, date range)
  - sort (date, amount, id)
  - pagination (page size 10)
  - URL-synced filters (refresh/back keeps state)
  - export CSV (exports filtered/sorted list)
  - keyboard navigation (Tab + ArrowUp/ArrowDown + Enter)
- Order detail:
  - role-based editing rules
  - Save Changes + dirty-state indicator
  - toast feedback
  - delete confirmation modal
  - back navigation returns to same list page+filters

## Tech
- React + Vite + TypeScript
- React Router
- Tailwind CSS

## Run locally
```bash
npm install
npm run dev
