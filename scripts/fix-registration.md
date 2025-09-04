# Fix Registration Database Error

## Issue
Getting "Database error saving new user" during registration due to profile creation conflicts.

## Solution 
Updated the database trigger to handle all profile fields automatically.

## Steps to Apply Fix

### 1. Copy this SQL to Supabase SQL Editor:

```sql
-- Update the profile creation trigger to handle all fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    country_id,
    series_id,
    role,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    (NEW.raw_user_meta_data->>'country_id')::UUID,
    (NEW.raw_user_meta_data->>'series_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow profile insertion during registration
CREATE POLICY "Users can insert their own profile during registration" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );
```

### 2. Test Registration Again

Try creating a new account with:
- Full name: Any name
- Email: A test email
- Country: Select any country 
- Series: Select any series for that country
- Password: At least 6 characters

The profile should now be created automatically by the database trigger without conflicts.

## How It Works Now

1. **User signs up** → Supabase creates auth.users record
2. **Database trigger fires** → Automatically creates profiles record with all metadata
3. **No manual profile creation** → Eliminates conflicts and RLS issues

## Rollback (if needed)
If there are still issues, you can disable the trigger temporarily:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```
