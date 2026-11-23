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

## Browser tests

The workspace generates structured browser tests from the selected GitHub
repository. You can select multiple tests, run them sequentially, inspect the
pass rate, and open the Browserbase recording for each cloud run.

### Browserbase cloud runs

Copy `.env.example` to `.env.local` and add `BROWSERBASE_API_KEY`. A cloud run
can test any reachable HTTP(S) target URL. Browserbase creates and records a
separate cloud browser session for every test; the workspace saves a link to
that session after the run.

### Local development fallback

When `BROWSERBASE_API_KEY` is absent, the app only runs against `localhost`,
`127.0.0.1`, or `::1` and blocks third-party browser requests. Install the
browser once:

   ```bash
   npx playwright install chromium
   ```

Start the website you want to test, for example at
   [http://localhost:3000](http://localhost:3000).
Start this project with `npm run dev`, sign in, and open the workspace.
Configure the repository's **Target URL** to the running website's address.
Generate or open a test case, choose **Edit steps**, add browser actions,
   and save. Supported actions are navigation, clicking/filling accessible
   elements, and checking visible text or elements. If no steps are saved yet,
   **Run test** creates a structured plan automatically before running it.
Choose **Run test** to see the Passed/Failed status and the latest run log.

The test runner does not execute AI-generated code. It only runs the
structured browser actions saved with each test case.

### Database fields

The test runner needs `test_steps`, `last_run_status`, `last_run_logs`, and
`last_run_at` on `test_case`. Browserbase runs additionally need
`last_run_browserbase_session_id` and `last_run_browserbase_session_url`. If
these columns are not already present on the
database branch used by the app, apply
[`db/manual-migrations/0001_create_test_case.sql`](./db/manual-migrations/0001_create_test_case.sql),
[`db/manual-migrations/0002_add_test_execution_fields.sql`](./db/manual-migrations/0002_add_test_execution_fields.sql), and
[`db/manual-migrations/0003_add_browserbase_session_fields.sql`](./db/manual-migrations/0003_add_browserbase_session_fields.sql)
to that development branch. Do not apply it to production without reviewing
the target branch first.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
