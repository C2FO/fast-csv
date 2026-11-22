## Pending vulnerabilities

None pending. Patched releases inside the `minimum-release-age` window (10080 minutes) are not installed, and there is no min-age exclusion.

## Intentional holds

- `deepmerge` has no patched release. `4.3.1` is the latest version and is inside `>=4.2.0 <=4.3.1`. `@svgr/plugin-svgo@8.1.0` and `jest-config@30.5.2` require `^4.3.1`, so there is nothing to override until a fixed release exists.
- `glob` is overridden to `14.0.3` on the parents that resolve `10.5.0`, `11.1.0`, and `13.0.6` (`test-exclude`, `@npmcli/package-json`, `@jest/reporters`, `jest-config`, `jest-runtime`, `@npmcli/map-workspaces`, `cacache`). Those ranges stop at 10, 11, or 13, and the advisory covers `>=9.0.0 <=14.0.1`. `14.0.4` (published 2026-11-06) is not required to clear the advisory.
- `minimatch` `>=7.0.0 <11.0.1` is overridden to `11.0.4` for `@npmcli/arborist`, `@npmcli/map-workspaces`, `@nx/devkit`, `@tufjs/models`, `@typescript-eslint/typescript-estree`, `ignore-walk`, `nx`, and `test-exclude`. `minimatch@3` (`lerna`, `eslint`, `serve-handler`) is outside that range. `11.0.5` (published 2026-11-05) is not required to clear the advisory.
- `lerna` stays on `9.0.7` because upgrading would not remove the `lerna>*` overrides, since `lerna@10.0.1` still pins vulnerable `pacote` (`21.0.1`) and `js-yaml` (`4.3.0`).
- `nx` versions allowed by `lerna@9` (`>=21.5.3 <23`) still pin vulnerable `axios`, `smol-toml`, and `brace-expansion`, and `nx@22.7.12` pins `follow-redirects@1.16.0`. The `nx>*` overrides stay until a release pins patched versions. `follow-redirects` is overridden to `1.16.2` (`axios>follow-redirects` as well, because `axios@1.20.0` accepts `^1.16.0` but was deduped to the exact nx pin). `http-proxy@1.18.1` allows `^1.0.0`, so it follows the same `1.16.2` without its own override.
