# Authentication and User Access — Authentication & User Foundation API

This implementation keeps Firebase Authentication as the identity/token provider.
`Authorization: Bearer <Firebase ID token>` is the session credential verified by
the existing `authenticate` middleware.

## Unique ID rule

A unique dashboard ID is generated from the user's first name plus exactly three
random digits, for example:

- `DHRUV527`
- `PRIYA004`

The value is collision-checked before it is stored.

## 1. Bootstrap the existing Super Admin

`POST /api/auth/bootstrap-admin`

Requirements:
- Valid Firebase bearer token.
- Token email must match `ADMIN_EMAIL`, `DONATION_ADMIN_EMAIL`, or `SUPER_ADMIN_EMAIL`.
- Matching MongoDB User must already exist.

This endpoint is idempotent and establishes the `UserAccess` record.

## 2. Validate current session

`GET /api/auth/session`

Returns:
- Firebase session identity
- unique ID
- normalized role
- permissions
- active/inactive state
- `mustChangePassword`

Unknown MongoDB users and inactive users are rejected.

## 3. Provision a dashboard user

`POST /api/auth/users/provision`

Role required: `super_admin`

Example request body:

```json
{
  "name": "Dhruv Mankame",
  "email": "dhruv@example.com",
  "role": "department_head",
  "department": "Technology",
  "team": "Dashboard",
  "permissions": ["users.read", "users.create"]
}
```

Behavior:
1. Generates `FIRSTNAME + 3 digits`.
2. Generates a strong temporary password.
3. Creates the Firebase Auth account.
4. Creates the MongoDB User.
5. Creates the UserAccess record with `mustChangePassword=true`.
6. Sends credentials through Resend.
7. Does not store the plaintext temporary password.

## 4. First-login password change

`POST /api/auth/first-login/change-password`

Example request body:

```json
{
  "newPassword": "NewStrong#Password9"
}
```

Behavior:
- Requires a valid Firebase bearer token.
- Requires 10+ characters with uppercase, lowercase, number, and special character.
- Updates the password through Firebase Admin.
- Revokes existing refresh tokens.
- Sets `mustChangePassword=false`.
- Requires the frontend to sign in again.

## Authentication and User Access role values

- `super_admin`
- `department_head`
- `team_member`

Aliases such as `admin`, `department head`, and `member` are normalized.

## Required environment variables for credential email

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_REPLY_TO`
- `EMAIL_DISABLED=false`

For initial Super Admin bootstrap, configure at least one:

- `ADMIN_EMAIL`
- `DONATION_ADMIN_EMAIL`
- `SUPER_ADMIN_EMAIL`

## Frontend enforcement

After login:
1. Obtain Firebase ID token.
2. Call `GET /api/auth/session`.
3. If `user.mustChangePassword === true`, block normal dashboard navigation and
   show the first-login password-change screen.
4. Submit the new password to `/api/auth/first-login/change-password`.
5. Sign the user out and require a fresh login.
