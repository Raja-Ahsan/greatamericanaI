# Wallet Integration – Vendor & Admin

## Overview

Wallet integration lets vendors receive earnings from sales and request withdrawals. Admins can view all wallets and process withdrawal requests (approve, reject, or mark as paid).

## Features

### Vendor Dashboard (`/vendor/wallet`)

- **Balance** – Available balance (85% of each sale, credited automatically).
- **Request withdrawal** – Minimum $10, with optional notes. Creates a pending withdrawal request.
- **Transactions** – Paginated list of credits (sales) and debits (withdrawals).
- **Withdrawal requests** – List of requests with status: Pending → Approved → Paid (or Rejected).

### Admin Dashboard (`/admin/wallets`)

- **Wallets** – List all vendor/admin wallets with balance, user, and status. Search by name/email.
- **Withdrawal requests** – List all withdrawal requests. Filter by status.
- **Process withdrawals** – For each request:
  - **Pending** → Approve or Reject (optional payment reference and notes).
  - **Approved** → Mark as Paid (deducts from wallet, optional payment reference).

## Flow

1. **Sale** – Customer completes a purchase → vendor wallet is credited with 85% of the sale (platform keeps 15%).
2. **Withdrawal** – Vendor requests withdrawal (min $10) → status: `pending`.
3. **Admin** – Approves (status: `approved`) or Rejects (status: `rejected`).
4. **Payout** – Admin marks as Paid (status: `paid`) after sending payment → amount is debited from vendor wallet; optional payment reference stored.

## Security

- **Authorization** – Wallet API requires `auth:sanctum`; vendor wallet endpoints require role `vendor` or `admin`; admin wallet/withdrawal endpoints require role `admin`.
- **Rate limiting** – Withdraw requests: 5 per minute per user.
- **Validation** – Withdrawal amount ≥ 10; balance and pending withdrawals checked before creating a request.
- **Database** – Wallets and transactions use DB transactions and row locking (`lockForUpdate`) to avoid race conditions.
- **Audit** – All transactions (credit/debit) and withdrawal status changes are stored with timestamps and references.

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/wallet` | vendor, admin | Get current user's wallet |
| GET | `/api/wallet/transactions` | vendor, admin | List transactions (paginated) |
| GET | `/api/wallet/withdrawals` | vendor, admin | List own withdrawal requests |
| POST | `/api/wallet/withdraw` | vendor, admin | Create withdrawal request |
| GET | `/api/admin/wallets` | admin | List all wallets (paginated, search) |
| GET | `/api/admin/wallets/{id}` | admin | Get one wallet |
| GET | `/api/admin/withdrawals` | admin | List all withdrawal requests (filter by status) |
| PATCH | `/api/admin/withdrawals/{id}` | admin | Update status (approved/rejected/paid) |

## Database

- **wallets** – `user_id`, `balance`, `currency`, `status` (active/locked).
- **wallet_transactions** – `wallet_id`, `type` (credit/debit), `amount`, `balance_after`, `reference_type`, `reference_id`, `description`, `meta`.
- **withdrawal_requests** – `wallet_id`, `amount`, `status`, `payment_reference`, `notes`, `requested_at`, `processed_at`, `processed_by`.

Wallets are created on first use (first sale or first visit to wallet page) for vendors and admins.

## Testing wallet integration (dummy sales)

To seed dummy sales and populate vendor wallets for testing:

```bash
cd backend
php artisan db:seed --class=DummySalesSeeder
```

This creates 3–8 dummy purchases per vendor agent (random customer as buyer, random quantity, dates in the last 60 days), then syncs each vendor’s wallet. You can then:

1. Log in as a vendor and open **Wallet** to see balance and transactions.
2. Request a withdrawal (min $10) and, as admin, approve/reject or mark as paid from **Admin → Wallets → Withdrawal Requests**.
