This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Supabase SQL Setup for Todos, Notes, and Goals

Copy and run this in the Supabase SQL editor to set up your tables, RLS, and triggers:

```sql
-- Enable uuid_generate_v4 if not already enabled
create extension if not exists "uuid-ossp";

-- NOTES TABLE
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  done boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- TODOS TABLE
create table if not exists todos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  done boolean default false,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- GOALS TABLE
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  category text,
  done boolean default false,
  target_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table notes enable row level security;
alter table todos enable row level security;
alter table goals enable row level security;

-- NOTES POLICIES
drop policy if exists "Allow insert for authenticated users" on notes;
create policy "Allow insert for authenticated users" on notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Allow select for authenticated users" on notes;
create policy "Allow select for authenticated users" on notes
  for select using (auth.uid() = user_id);

drop policy if exists "Allow update for authenticated users" on notes;
create policy "Allow update for authenticated users" on notes
  for update using (auth.uid() = user_id);

drop policy if exists "Allow delete for authenticated users" on notes;
create policy "Allow delete for authenticated users" on notes
  for delete using (auth.uid() = user_id);

-- TODOS POLICIES
drop policy if exists "Allow insert for authenticated users" on todos;
create policy "Allow insert for authenticated users" on todos
  for insert with check (auth.uid() = user_id);

drop policy if exists "Allow select for authenticated users" on todos;
create policy "Allow select for authenticated users" on todos
  for select using (auth.uid() = user_id);

drop policy if exists "Allow update for authenticated users" on todos;
create policy "Allow update for authenticated users" on todos
  for update using (auth.uid() = user_id);

drop policy if exists "Allow delete for authenticated users" on todos;
create policy "Allow delete for authenticated users" on todos
  for delete using (auth.uid() = user_id);

-- GOALS POLICIES
drop policy if exists "Allow insert for authenticated users" on goals;
create policy "Allow insert for authenticated users" on goals
  for insert with check (auth.uid() = user_id);

drop policy if exists "Allow select for authenticated users" on goals;
create policy "Allow select for authenticated users" on goals
  for select using (auth.uid() = user_id);

drop policy if exists "Allow update for authenticated users" on goals;
create policy "Allow update for authenticated users" on goals
  for update using (auth.uid() = user_id);

drop policy if exists "Allow delete for authenticated users" on goals;
create policy "Allow delete for authenticated users" on goals
  for delete using (auth.uid() = user_id);

-- Function to set user_id to the current authenticated user
create or replace function set_user_id()
returns trigger as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$ language plpgsql security definer;

-- TODOS TRIGGER
 drop trigger if exists set_user_id_trigger_todos on todos;
create trigger set_user_id_trigger_todos
before insert on todos
for each row execute function set_user_id();

-- NOTES TRIGGER
drop trigger if exists set_user_id_trigger_notes on notes;
create trigger set_user_id_trigger_notes
before insert on notes
for each row execute function set_user_id();

-- GOALS TRIGGER
drop trigger if exists set_user_id_trigger_goals on goals;
create trigger set_user_id_trigger_goals
before insert on goals
for each row execute function set_user_id();
```

---

Paste this in the Supabase SQL editor to set up your tables, RLS, and triggers correctly.


you can make your random nextauth secret code with this command:

 node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"