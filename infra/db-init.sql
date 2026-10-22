-- gotrue runs its migrations against the auth schema and needs it to exist first.
CREATE SCHEMA IF NOT EXISTS auth;
