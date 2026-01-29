# Payment Gateways (arafadev/payment-gateways)

This project uses **arafadev/payment-gateways** for multi-gateway payments with Laravel 12. Admin configures default and enabled gateways in **Admin → Settings → Payment Gateways**; credentials are set in `config/payments.php` (published from the package).

## Backend Setup

### 1. Install the package

```bash
cd backend
composer require arafadev/payment-gateways
```

### 2. Publish config

```bash
php artisan vendor:publish --provider="Arafa\Payments\PaymentServiceProvider" --tag="config"
```

This creates `config/payments.php` with gateways: Stripe, PayPal, Paymob, Fawry, Tabby, Moyasar, MyFatoorah, Urway, Geidea, Telr, Tamara, Al Rajhi Bank, ClickPay, HyperPay, Tap.

### 3. Run migrations

```bash
php artisan migrate
```

Creates `platform_settings` and seeds default payment settings (default: Stripe, enabled: Stripe + PayPal).

### 4. Add API keys (what “edit config/payments.php and .env” means)

**In short:**  
You choose which gateways are “on” in **Admin → Settings → Payment Gateways**. For each gateway you turn on, you must give the app that gateway’s **API keys** (from Stripe, PayPal, etc.). You put those keys in **two places**:

1. **`.env`** (backend folder) — you paste the **secret keys** here. Never commit real keys to git; `.env` is ignored.
2. **`config/payments.php`** — this file **reads** those keys from `.env` using `env('STRIPE_TEST_SECRET')` etc. After you publish the package config (step 2), this file already has the right structure; you only need to add the variable names to `.env` and paste your keys.

**Step-by-step (example: Stripe)**

1. **Get keys from the gateway**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys.
   - Copy **Publishable key** (starts with `pk_test_` or `pk_live_`) and **Secret key** (starts with `sk_test_` or `sk_live_`).

2. **Put them in `backend/.env`**
   - Open the file `backend/.env` in your project.
   - Add (or edit) these lines. Use your real key values instead of `xxxx`:

   ```env
   STRIPE_MODE=test
   STRIPE_TEST_SECRET=your_stripe_test_secret_key_from_dashboard
   STRIPE_TEST_KEY=your_stripe_test_publishable_key_from_dashboard
   STRIPE_LIVE_SECRET=your_stripe_live_secret_key_from_dashboard
   STRIPE_LIVE_KEY=your_stripe_live_publishable_key_from_dashboard
   ```

3. **How `config/payments.php` uses them**
   - The published `config/payments.php` already contains something like:
     - `'test_api_key' => env('STRIPE_TEST_SECRET')`
   - So the app reads the key from `.env` when it runs. You don’t need to type the key inside `config/payments.php`; you only need to add the same variable names in `.env` (as in step 2). If the published config uses different names (e.g. `STRIPE_SECRET`), use those same names in `.env`.

**Example: PayPal**

1. Get **Client ID** and **Client Secret** from [PayPal Developer](https://developer.paypal.com/dashboard/) (Sandbox for testing).
2. In `backend/.env` add:

   ```env
   PAYPAL_MODE=sandbox
   PAYPAL_SANDBOX_CLIENT_ID=your_client_id_here
   PAYPAL_SANDBOX_CLIENT_SECRET=your_client_secret_here
   PAYPAL_LIVE_CLIENT_ID=your_live_client_id
   PAYPAL_LIVE_CLIENT_SECRET=your_live_client_secret
   ```

3. In the published `config/payments.php`, the PayPal section should use these same names in `env('...')` (e.g. `env('PAYPAL_SANDBOX_CLIENT_ID')`). If it uses different names, match your `.env` to those names.

**Summary**

| What you do in Admin | What you do in backend |
|----------------------|-------------------------|
| Enable “Stripe” and “PayPal” in Payment Gateways | Add Stripe and PayPal keys to `backend/.env` (and ensure `config/payments.php` uses the same `env('...')` names). |
| Set “Stripe” as default gateway | Same as above; default only chooses which gateway is used at checkout. |

You do **not** type the actual secret keys inside `config/payments.php`. You type them only in `.env`; `config/payments.php` just references the variable names (e.g. `env('STRIPE_TEST_SECRET')`).

## Admin Settings

- **Admin Panel → Settings → Payment Gateways**
  - **Default gateway**: Used when customers checkout.
  - **Enabled gateways**: Which gateways are available (must be configured in `config/payments.php`).
  - Values are stored in `platform_settings.payment_gateways`.

## Using the package in checkout

The package registers a **Payment** facade. Use the default gateway from your settings:

```php
use Arafa\Payments\Facades\Payment;
use App\Models\PlatformSetting;

$config = PlatformSetting::getValue('payment_gateways', []);
$defaultGateway = $config['default_gateway'] ?? config('payments.default', 'stripe');

$gateway = Payment::gateway($defaultGateway);
// Then use the gateway per arafadev/payment-gateways docs (pay, verify, etc.)
```

Set callback/success/failed URLs in `config/payments.php` as required by the package.

## API

- `GET /api/admin/settings` — Platform + payment gateway settings (admin only).
- `PUT /api/admin/settings/platform` — Update platform settings (admin only).
- `GET /api/admin/settings/payment-gateways` — Payment gateway config only (admin only).
- `PUT /api/admin/settings/payment-gateways` — Update default gateway and enabled gateways (admin only).

## Supported gateways (arafadev/payment-gateways)

| Gateway       | Region        |
|---------------|---------------|
| Stripe        | Global        |
| PayPal        | Global        |
| Paymob        | MENA          |
| Fawry         | Egypt         |
| Tabby         | MENA          |
| Moyasar       | MENA          |
| MyFatoorah    | Middle East   |
| Urway         | MENA          |
| Geidea        | MENA          |
| Telr          | Middle East   |
| Tamara        | MENA          |
| Al Rajhi Bank | Saudi Arabia  |
| ClickPay      | MENA          |
| HyperPay      | MENA          |
| Tap           | MENA          |
