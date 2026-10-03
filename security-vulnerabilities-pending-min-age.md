## Pending vulnerabilities

No packages are currently blocked by `minimum-release-age`.

| Package | Patched version | Publish date | Eligible date | Note |
| ------- | --------------- | ------------ | ------------- | ---- |

## Intentional holds

- `lerna` stays on `9.0.7` because `lerna@10` requires Node `^22.13.0 || ^24.0.0 || ^26.0.0`, while CI still tests Node 20.x and 21.x. Upgrading would not remove the `lerna>*` overrides, since `lerna@10.0.1` still pins vulnerable `pacote` (`21.0.1`) and `js-yaml` (`4.3.0`).
- `nx` versions up to `23.2.1` still pin vulnerable `axios`, `smol-toml`, and `brace-expansion`, so the `nx>*` overrides stay until a release pins patched versions.
