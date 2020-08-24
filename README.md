# D4AD

[![build](https://circleci.com/gh/newjersey/d4ad.svg?style=shield)](https://circleci.com/gh/newjersey/d4ad)

Data for the American Dream
## Getting Started

This [typescript](https://www.typescriptlang.org/) repo is structured with two primary sub-folders:

 - **backend** - the [express](https://expressjs.com/) API server
 - **frontend** - the [react](https://reactjs.org/) web UI
 
### npm Dependencies

For npm dependencies:
```shell script
./scripts/install-all.sh
```

### postgres

If not already installed, install [postgres](https://www.postgresql.org/)

Create postgres local DB:
```shell script
psql -c 'create database d4adlocal;' -U postgres
```

Run database migrations:
```shell script
./scripts/db-migrate.sh
```

## Development

Start frontend dev server:
```shell script
./scripts/frontend-start.sh
```

Start backend dev server:
```shell script
./scripts/backend-start.sh
```

Run all [jest](https://jestjs.io/) tests, and linting:
```shell script
./scripts/test-all.sh
```

Run [cypress](https://www.cypress.io/) feature tests:
```shell script
./scripts/feature-tests.sh
```

### Fences

This repo uses [good-fences](https://github.com/smikula/good-fences) to enforce module boundaries.
Most importantly, the `backend` and `frontend` cannot import from each other.

Additionally, fences are used in the backend subdirectories to enforce [dependency inversion](https://en.wikipedia.org/wiki/Dependency_inversion_principle).
The `routes` and `database` folders depend on the interfaces defined in `domain` (only - not on each other), and `domain` is not allowed to
import from any of these implementation directories.

Fences are enforced via a linting-like command that will fail when any violations are flagged:

```shell script
npm --prefix=backend run fences
npm --prefix=frontend run fences
```

### Adding DB migrations

```shell script
npm --prefix=backend run db-migrate create [migration-name] -- --sql-file
```

#### Seeding

When you want to add a DB migration that is a **seed** operation (that is, inserting
data from a CSV), there's a specific process for this:
- make sure that the CSV source file is in the `backend/data` directory
- ensure that it does not have any leading/trailing newlines 
- run the above DB migrate command to create the migration scripts in `backend/migrations`. 
I recommend the name to be "seed-[description]"
- run the `csvInserter` script to populate the migration file with insert statements generated from the CSV:
```shell script
node backend/data/csvInserter.js csvFilename.csv tablenameToInsertInto backend/migrations/sqls/seed-migration-name.sql
```

assuming that you want a different seed for testing vs real life, then:

- create a CSV in `/backend/data` with matching structure, and test data
- duplicate the `.sql` migration file and rename it to end with `-TEST.sql`
- run the same node command above, with the test CSV filename and the test sql migration filename
- edit the corresponding `.js` file for the migration by replacing this line:
```javascript
exports.up = function(db) {
  var filePath = path.join(__dirname, 'sqls', 'filename.sql');
``` 

with this instead:
```javascript
exports.up = function(db) {
  const fileName = process.env.NODE_ENV === 'test' ? 'filename-TEST.sql' : 'filename.sql';
  var filePath = path.join(__dirname, 'sqls', fileName);
```

#### Updating Seeds

When you want to add a DB migration that is a **seed update** operation (that is, replacing data
in a table new fresher data from a CSV), here is what to do:

For the up-file:
- Follow the seed instructions above to add the CSV and create an `update-*.sql` file
- Follow the instructions above to use `csvInserter` to insert new CSV data into your update file.
- Add a `delete from [tablename];` line at the top of the sql file.

**Important** - For the down-file:
- Copy all the insert statements from the previous seed/update up-file for this table into this down-file.
- Add a `delete from [tablename];` line at the top of the sql down-file

**IMPORTANT!** - if we're updating the `programs` table:
- at the END of both the up-file AND the down-file, we must delete all rows from the `programtokens` table
and re-create it by adding the `programtokens` code that is in `20200706210029-programtokens-up.sql`.
- This will ensure that the tokens being searched on are up-to-date with program table changes.

Please see `decision_log.md #2020-08-12` for explanation of why we need this, and please see `20200812144318-update-programs-*.sql`
migration for examples of what this should look like.

## Pushing changes

Always push via ship-it ([why?](https://medium.com/@AnneLoVerso/ship-it-a-humble-script-for-low-risk-deployment-1b8ba99994f7))
```shell script
./scripts/ship-it.sh
```

## Deployment

Build frontend, build backend, compile all into one directory:
```shell script
./scripts/build.sh
```

Start the production server (frontend & backend)
```shell script
./scripts/prod-start.sh
```

### Deploying to GCP

First, make sure that [Google Cloud SDK](https://cloud.google.com/sdk/install) is installed

Ensure you are logged in to the CLI and pointing to the correct project.

This script generates the `app.yaml` and deploys the app:
```shell script
./scripts/deploy.sh
```
