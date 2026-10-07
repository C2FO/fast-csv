## Pending vulnerabilities

| Package              | Patched version | Publish date | Eligible date | Note                                                                                                                                                                                     |
| -------------------- | --------------- | ------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| http-cache-semantics | 4.3.0           | 2026-10-04   | 2026-10-11    | Parents (`cacheable-request`, `make-fetch-happen`) already allow `^4.1.1`. When eligible, refresh the lockfile with `pnpm update -r --depth Infinity http-cache-semantics`. No override. |

## Intentional holds

- `braces` has no patched npm release. The advisory range is `<=3.0.3`, and `3.0.3` is still `latest`. It is pulled in by `micromatch@4.0.8` (`braces: ^3.0.3`) and `chokidar@3` through `@docusaurus/core@3.10.2`. Do not add an override until a release newer than `3.0.3` is published.
- `lerna` stays on `9.0.7` because `lerna@10` requires Node `^22.13.0 || ^24.0.0 || ^26.0.0`, while CI still tests Node 20.x and 21.x. Upgrading would not remove the `lerna>*` overrides, since `lerna@10.0.1` still pins vulnerable `pacote` (`21.0.1`) and `js-yaml` (`4.3.0`).
- `nx` versions up to `23.2.1` still pin vulnerable `axios`, `smol-toml`, and `brace-expansion`, so the `nx>*` overrides stay until a release pins patched versions.
