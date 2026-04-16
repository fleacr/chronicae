# Supabase Setup Guide

## Step 1: Configure Environment Variables

Create a `.env` file in your project root (copy from `.env.example`):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**How to find your credentials:**

1. Go to [supabase.com](https://supabase.com) and open your project
2. Click "Settings" in the left sidebar
3. Click "API" under the settings menu
4. Copy the "Project URL" and paste it as `VITE_SUPABASE_URL`
5. Under "Project API keys", copy the "anon" public key and paste it as `VITE_SUPABASE_ANON_KEY`

⚠️ **IMPORTANT**: Never commit `.env` to git. Use `.env.local` for local development.

## Step 2: Enable Email/Password Authentication

1. In your Supabase project, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled (it's enabled by default)
3. Configure email settings:
   - Go to **Authentication** → **Email Templates**
   - Keep default templates or customize based on your needs

## Step 3: Set Up User Profile Table

Run this SQL in your Supabase SQL editor (**SQL Editor** in left sidebar):

```sql
-- Create a public.profiles table to store additional user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  country TEXT,
  disease_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_profiles_updated_at();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own data
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## Step 4: Set Up Authentication Trigger

Add this trigger to automatically create a profile entry when a user signs up:

```sql
-- Create a function to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Step 5: Set Up Pain Log Table

Add this SQL to create the `pain_logs` table for storing user pain tracking entries:

```sql
-- Create pain_logs table
CREATE TABLE IF NOT EXISTS public.pain_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pain_level INTEGER NOT NULL CHECK (pain_level >= 1 AND pain_level <= 10),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_pain_logs_user_id ON public.pain_logs(user_id);
CREATE INDEX idx_pain_logs_created_at ON public.pain_logs(created_at DESC);

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_pain_logs_updated_at_trigger
  BEFORE UPDATE ON public.pain_logs
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_profiles_updated_at();

-- Enable Row Level Security
ALTER TABLE public.pain_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own pain logs
CREATE POLICY "Users can view their own pain logs"
  ON public.pain_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pain logs"
  ON public.pain_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pain logs"
  ON public.pain_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pain logs"
  ON public.pain_logs FOR DELETE
  USING (auth.uid() = user_id);
```

## Step 6: Test the Integration

### Option A: Using the App

1. Run your dev server: `npm run dev`
2. Navigate to the signup page
3. Create a test account
4. Check your Supabase project's **Authentication** → **Users** tab to verify the user was created

### Option B: Using Supabase SQL Editor

Test the auth service directly:

```sql
-- Check if users were created
SELECT id, email, created_at FROM auth.users;

-- Check profile data
SELECT * FROM public.profiles;
```

## Step 7: Configure OAuth (Optional for Social Login)

If you want to enable Google/Apple login:

1. Go to **Authentication** → **Providers**
2. Click on **Google** or **Apple**
3. Add your OAuth credentials (you'll need to set these up in Google Cloud Console and Apple Developer)

## Environment Variables Reference

```env
# REQUIRED
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# OPTIONAL (for production)
VITE_APP_ENV=development|production
```

## Security Checklist

- ✓ Row Level Security (RLS) enabled on profiles table
- ✓ Users can only view/edit their own profiles
- ✓ Environment variables contain no sensitive data in code
- ✓ Anon key is public-safe (read-only by design in RLS policies)
- ✓ Service role key is NEVER exposed to client

## Troubleshooting

### "Missing Supabase credentials"
- Make sure `.env` file exists in project root
- Verify variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check that values don't have quotes: `VITE_SUPABASE_URL=https://...` (not `VITE_SUPABASE_URL="https://..."`)
- Restart dev server after creating `.env`

### CORS errors
- Go to Supabase **Settings** → **API**
- Scroll to "CORS Configuration" 
- Add your development URL: `http://localhost:5173`

### Users not being created
- Check **Authentication** → **Policies** (enable email confirmation if needed)
- Go to **SQL Editor** and run `SELECT * FROM auth.users;` to check

## Next Steps

Once Supabase is set up:

1. The auth service will automatically work with your login/signup pages
2. Users signing up will automatically get a profile entry
3. Protected routes can be added to prevent unauthorized access
4. Future symptom tracking data will be stored per-user with RLS protection

For more info, see [Supabase Docs](https://supabase.com/docs)
