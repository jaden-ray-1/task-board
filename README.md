# Task Board
Task Board is a task management app built with React and dnd-kit. Tasks are represented as cards and are dragged between columns to change their status, much like a kanban board, and are saved through Supabase. Tasks may also have a description, due date, and tags.

Desktop | Mobile
:------:|:------:
![Desktop Screenshot](screenshots/desktop.png) | ![Mobile Screenshot](screenshots/mobile.png)

# Features
- Create tasks
    - Title
    - Description (optional)
    - Due date (optional)
    - Tags (optional)
- Drag and drop cards between columns
    - Automatically creates "To Do", "In Progress", "In Review", and "Done" columns
- Due date indicator
    - Tasks due tomorrow have their due date highlighted in yellow
    - Tasks due today have their due date highlighted in orange
    - Tasks due before today have their due date highlighted in red
- Filter your board by tags
- Task persistence
- Board summary
    - Shows the number of total tasks, completed tasks, and non-completed overdue tasks
- Responsive layout
    - Columns are displayed horizontally on larger screens in traditional kanban style
    - Columns are displayed vertically on smaller screens to better utilize the limited space

# Getting Started

1. Clone this repository.

2. Install dependencies with `npm install`.

3. Configure Supabase with the following schema and RLS policies.

    ```sql
    CREATE TABLE public.tasks (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      title text NOT NULL DEFAULT ''::text,
      status text NOT NULL DEFAULT 'todo'::text,
      user_id uuid NOT NULL DEFAULT auth.uid(),
      created_at timestamp without time zone NOT NULL DEFAULT now(),
      description text DEFAULT ''::text,
      due_date date,
      tags ARRAY,
      CONSTRAINT tasks_pkey PRIMARY KEY (id)
    );
    ```

    ```sql
    CREATE POLICY "Users can view their own tasks"
      ON public.tasks FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own tasks"
      ON public.tasks FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own tasks"
      ON public.tasks FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own tasks"
      ON public.tasks FOR DELETE
      USING (auth.uid() = user_id);
    ```

4. Create `.env.local` in the project root with the values of your `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The [Supabase documentation](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs#6-declare-supabase-environment-variables) can help you locate these. 
    ```sh
    # .env.local example
    VITE_SUPABASE_URL=https://this-is-a-fake-url.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_long_string_of_letters
    ```

5. Run `npm run dev` to launch the app.

# Development

## Commands
- `npm run dev` launches the development sever locally.
- `npm run lint` lints the codebase.
- `npm run build` builds the project distribution.
- `npm run preview` launches a preview of the distribution locally.

## Tech Stack
- React: UI framework
- TypeScript: type safety
- Supabase: PostgresSQL backend
- Vite: development and building
- ESLint: linting
- dnd-kit: drag and drop React library

## Project Structure
```
.
├── .gitignore
├── .env.local               # Secrets
├── public                   # App assets
│  ├── favicon.svg
│  └── plus.svg
├── screenshots              # Screenshots for the README
│  ├── desktop.png
│  └── mobile.png
├── src                      # App files
│  ├── components            # Reusable TSX components
│  │  ├── Board.tsx
│  │  ├── Card.tsx
│  │  └── Column.tsx
│  ├── css                   # Styling
│  │  ├── global.css
│  │  ├── Board.module.css
│  │  ├── Card.module.css
│  │  └── Column.module.css 
│  ├── lib                   # Support libraries
│  │  ├── auth.ts            # Supabase authentication
│  │  ├── supabase.ts        # Supabase client
│  │  └── types.ts           # Supabase table schema as type
│  ├── main.tsx
│  ├── App.tsx
│  └── vite-env.d.ts
├── eslint.config.js
├── vite.config.js
├── tsconfig.json 
├── package.json
├── package-lock.json 
├── index.html               # App entry point
└── README.md
```
