# Prompt for AI Agent — Backend Security & Bug Fixes

Apply the following fixes to `backend/` in this repo (FastAPI trading journal). Five files
are touched: `models.py`, `auth.py`, `database.py`, `app.py`, `trade_import.py`.
I've attached the already-corrected versions of these five files — use them as the
reference for exactly what the end state should look like, then reconcile with any
changes I've made locally since.

## 1. Critical security fix — bulk import ownership bypass
`POST /api/trades/bulk` currently only checks a single **global** `X-API-Key` against
`settings.api_key`. Anyone holding that one key can pass *any* `user_id` in the body and
write trades into a different user's account.

Fix: give every `User` a unique `api_key` (random, `secrets.token_urlsafe(32)`),
generated at registration. The bulk import endpoint must look up the target user by
`user_id`, then require the `X-API-Key` header to match **that specific user's**
`api_key` — not a shared secret. Add `POST /api/user/me/api-key` so an authenticated
user can regenerate (rotate) their own key. Keep `settings.api_key` in `database.py` but
make it optional/unused going forward (deprecated), so existing `.env` files don't break.

Run a data migration / manual backfill for any existing users so they get an `api_key`
(existing rows will have `NULL` until they call the regenerate endpoint — that's
intentional, it forces an explicit opt-in rather than being silently vulnerable).

## 2. Bug fix — bulk import silently corrupts numeric fields
In `trade_import.py`, code like:
```python
existing_trade.open_price = float(trade_data.get('open_price', existing_trade.open_price or 0))
```
`dict.get(key, default)` only returns `default` when the key is **missing** — if the key
is present with value `None` (common from MT5 payloads for empty numeric fields), this
raises `TypeError: float() argument must be a string or a real number, not 'NoneType'`,
which then gets swallowed by the per-trade `except` and silently reported as "skipped".
Replace with a small `_num(value, fallback)` helper that treats `None` the same as
"missing". Apply it to every numeric field in both the update and create branches.

## 3. Deprecated FastAPI startup pattern
`@app.on_event("startup")` is deprecated. Replace with a `lifespan` async context
manager passed to `FastAPI(..., lifespan=lifespan)`, calling `init_db()` there.

## 4. Pydantic v2 deprecation
`trade_data.dict()` and `trade_update.dict(exclude_unset=True)` use the Pydantic v1 API
even though `pydantic==2.6.1` is pinned. Replace with `.model_dump()` /
`.model_dump(exclude_unset=True)`.

## After applying
- Run `python -m py_compile app.py auth.py database.py models.py trade_import.py` (or
  the project's equivalent) to confirm no syntax errors.
- If there's an Alembic setup, generate a migration for the new `users.api_key` column
  (nullable, unique). If the project uses `Base.metadata.create_all()` only (no
  migrations), note that a manual `ALTER TABLE users ADD COLUMN api_key VARCHAR UNIQUE;`
  will be needed against the production Postgres DB on Render before deploying, since
  `create_all()` does not alter existing tables.
- Update `backend/README.md` and `sync-client/mt5_sync_client.py` (and its
  install scripts) to reflect that the bulk-import API key is now fetched per-user from
  `/api/user/me/api-key` instead of a shared `.env` secret.

## Not in scope for this pass (flag but don't fix unless asked)
- Rate limiting on `/login` and `/register`.
- Whether `mt5_password` on the `User` model is actually encrypted before storage —
  the column comment claims it is but no encryption code exists; confirm intent.
- CORS `allowed_origins` value in the deployed environment — make sure it's the real
  frontend domain, not a wildcard, once the Vercel frontend URL is known.
