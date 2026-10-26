## Pending vulnerabilities

These patched releases are inside the `minimum-release-age` window (10080 minutes). Do not add a min-age exclusion.

| Package              | Patched version | Publish date | Eligible date        | Note                                                                                                                                                          |
| -------------------- | --------------- | ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| body-parser          | 1.20.9          | 2026-10-22   | 2026-10-29           | `express@4.22.3` already allows `~1.20.5`. Refresh with `pnpm update body-parser`. No override.                                                               |
| fast-uri             | 3.1.9           | 2026-10-19   | 2026-10-26 23:05 UTC | `ajv` already allows `^3.0.1`. Refresh with `pnpm update fast-uri` after 2026-10-26 23:05 UTC. No override.                                                   |
| serialize-javascript | 7.1.3           | 2026-10-22   | 2026-10-29           | Bump the root override from `7.0.5` to `7.1.3`. `7.1.2` is old enough but still vulnerable (`<7.1.3`). `7.1.4` (published 2026-10-23) is eligible 2026-10-30. |

## Intentional holds

- `lerna` stays on `9.0.7` because upgrading would not remove the `lerna>*` overrides, since `lerna@10.0.1` still pins vulnerable `pacote` (`21.0.1`) and `js-yaml` (`4.3.0`).
- `nx` versions allowed by `lerna@9` (`>=21.5.3 <23`) still pin vulnerable `axios`, `smol-toml`, and `brace-expansion`, and `nx@22.7.12` pins `follow-redirects@1.16.0`. The `nx>*` overrides stay until a release pins patched versions. `follow-redirects` is overridden to `1.16.1` (`axios>follow-redirects` as well, because `axios@1.20.0` accepts `^1.16.0` but was deduped to the exact nx pin).
