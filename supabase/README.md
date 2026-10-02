# Supabase setup for Localtour China

## One-time setup

1. Open the Localtour China project in Supabase.
2. Open **SQL Editor** and select **New query**.
3. Paste all of `setup.sql` and select **Run**.
4. Open **Table Editor → inquiries** to see new customer inquiries.

The script also creates the private `online-guide-receipts` Storage bucket. Screenshots can be uploaded but are never publicly readable. Review them while signed in through **Storage → online-guide-receipts** and match the folder UUID to the inquiry `access_token`.

## Updating a customer record

In **Table Editor → inquiries**, edit only the relevant row:

- `status`: `received`, `reviewing`, `quoted`, `deposit_paid`, `confirmed`, `completed`, or `cancelled`
- `quote_currency`: for example `KRW` or `USD`
- `quote_amount`: numbers only
- `payment_note`: deposit, balance and payment instructions visible to the customer
- `customer_note`: a short progress message visible to the customer
- `notion_itinerary_url`: the customer's published Notion itinerary URL
- `notion_quote_url`: the customer's published Notion quote URL

Never store passport details, birth dates, card details or bank credentials in this table.

The `access_token` is the secret part of the customer's status link. Do not post it publicly.
