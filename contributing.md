# Contributing to fast-csv

First of all **thank you** for considering contributing to this open source project!

Contributions of any type are welcome, including bug fixes, new features, and documentation improvements such as typos, incorrect code examples, or missing information.

The typical contribution flow is: report or choose an issue, set up the workspace, make and validate your changes, then submit a pull request.

## Report Bugs and Request Features

GitHub Issues is the channel for bug reports and feature requests. Use the template that matches your topic so reports are routed correctly. Keep issues clear, concise, and specific.

### Bug reports

Open an issue with the Bug report template. Include:

- A clear and concise description of the bug, and whether it concerns parsing or formatting.
- Steps to reproduce, including example file contents and example code where applicable.
- The behavior you expected to happen.
- Screenshots if they help explain the problem.
- Your environment: OS, OS version, and Node version.

### Feature requests

New features and/or enhancements are great and I encourage you to either submit a PR or create an issue. In both cases include the following as the need/requirement may not be readily apparent.

1. The use case
2. A short example

Open an issue with the Feature request template. Include:

- Whether the request concerns parsing or formatting.
- The problem the request is related to, described clearly and concisely.
- The solution you would like to see.
- Any alternative solutions you have considered.
- Additional context or screenshots.

## Choose an Issue to Work On

Browse the repository's open issues. Labels such as `enhancement` and `bug` can help you find issues by type.

If you find an issue you want to work on, comment on it to let others know you are looking at it; the maintainer will assign the issue to you. If you want to work on an issue but don't know where to start, leave a comment and the maintainer will point you in the right direction.

## Set Up Your Local Workspace

Use the Node.js version in `.nvmrc` (`24.15.0`) and the pnpm version in `package.json` (`10.34.4`) for local development. These versions are also recorded in `.tool-versions`.

Fork the repository, then clone your fork and create a branch. Replace `YOUR_GITHUB_USERNAME` with your GitHub username:

```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/fast-csv.git
cd fast-csv
git checkout -b your-change
```

From the repository root, install dependencies and build the workspace:

```sh
pnpm install
pnpm run build
```

The build runs `lerna run build` across the workspace. The parsing and formatting packages are in `packages/parse` and `packages/format`; examples are in `examples/`, and the documentation website is in `documentation/`.

## Make and Validate Your Changes

Add tests for changed behavior and update documentation and examples where applicable. Keep library changes compatible with the Node.js range declared in `package.json` (`>=20.0.0`); the local development version above is not the minimum runtime version.

After making changes, rebuild and run the formatting check and test suite from the repository root:

```sh
pnpm run build
pnpm run format:check
pnpm test
```

`pnpm test` runs linting, Jest with coverage, and example checks. Linting must finish with zero warnings. The separate `format:check` command checks formatting without modifying files.

You can also run these checks individually:

```sh
pnpm run lint
pnpm run jest
pnpm run examples
```

The test workflow also runs `pnpm run benchmarks`. Check the CI results after submitting your pull request.

For documentation changes, preview the website after installing workspace dependencies:

```sh
cd documentation
pnpm start
```

See `documentation/README.md` for the website development instructions.

## Code Style

- Follow the repository's Prettier configuration: single quotes, 120-character print width, trailing commas, and 4-space indentation. YAML/YML files use 2-space indentation.
- TypeScript files are checked with type-aware ESLint rules. Keep TSDoc syntax valid, avoid default exports, and ensure no Prettier violations.

## Submit a Pull Request

Use the repository pull request template and remove sections that do not apply to your change.

For new features and/or enhancements, include the use case and a short example as described above. If you are issuing a PR, also include the following:

1. Tests - otherwise the PR will not be merged.
2. Documentation - otherwise the PR will not be merged.
3. Examples.

### All submissions

- Confirm you have followed the contributing guidelines.
- Check that no other open pull request already covers the same update or change.

### New feature and enhancement submissions

- If you added new parsing or formatting options, document them.
- If applicable, add an example to the parsing or formatting docs.

### Changes to core features

- Explain what your changes do and why you would like them included.
- Add new tests for your core changes, as applicable.
- Confirm you have run the tests locally with your changes.

### Commit messages

Format commit messages according to the repository's commitlint configuration, which uses the Angular convention. Allowed types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`, and `example`.
