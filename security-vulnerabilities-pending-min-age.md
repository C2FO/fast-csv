## Pending vulnerabilities

None pending. `handlebars@4.7.10` is now resolved from parent ranges (`ts-jest` `^4.7.9`, `conventional-changelog-writer` `^4.7.7`).

## Intentional holds

- `braces` has no patched npm release. The advisory range is `<=3.0.3`, and `3.0.3` is still `latest` (`first_patched_version` is null). It is pulled in by `micromatch@4.0.8` (`braces: ^3.0.3`) and `chokidar@3` through `@docusaurus/core@3.10.2` (latest 3.x). Do not add an override until a release newer than `3.0.3` is published.
- `lerna` stays on `9.0.7` because upgrading would not remove the `lerna>*` overrides, since `lerna@10.0.1` still pins vulnerable `pacote` (`21.0.1`) and `js-yaml` (`4.3.0`).
- `nx` versions up to `23.2.1` still pin vulnerable `axios`, `smol-toml`, and `brace-expansion`, so the `nx>*` overrides stay until a release pins patched versions.
