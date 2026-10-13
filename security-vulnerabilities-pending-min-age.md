## Pending vulnerabilities

| Package    | Patched version | Publish date | Eligible date | Note                                                                                                                                                                                                                                                                          |
| ---------- | --------------- | ------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| handlebars | 4.7.10          | 2026-10-05   | 2026-10-12    | Published 2026-10-05 22:37 UTC, so it is eligible after 22:37 UTC on 2026-10-12. Parents (`ts-jest` `^4.7.9`, `conventional-changelog-writer` `^4.7.7`) already allow it. When eligible, refresh the lockfile with `pnpm update -r --depth Infinity handlebars`. No override. |

## Intentional holds

- `braces` has no patched npm release. The advisory range is `<=3.0.3`, and `3.0.3` is still `latest`. It is pulled in by `micromatch@4.0.8` (`braces: ^3.0.3`) and `chokidar@3` through `@docusaurus/core@3.10.2`. Do not add an override until a release newer than `3.0.3` is published.
- `lerna` stays on `9.0.7` because `lerna@10` requires Node `^22.13.0 || ^24.0.0 || ^26.0.0`, while CI still tests Node 20.x and 21.x. Upgrading would not remove the `lerna>*` overrides, since `lerna@10.0.1` still pins vulnerable `pacote` (`21.0.1`) and `js-yaml` (`4.3.0`).
- `nx` versions up to `23.2.1` still pin vulnerable `axios`, `smol-toml`, and `brace-expansion`, so the `nx>*` overrides stay until a release pins patched versions.
