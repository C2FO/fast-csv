# Security Policy

This policy covers `fast-csv`, `@fast-csv/parse`, and `@fast-csv/format`.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 5.x     | :white_check_mark: |
| < 5.0   | :x:                |

Fixes ship as patch releases on the latest 5.x, for the Node.js versions in each package's `engines` field.

## Reporting a Vulnerability

- **Email:** [security@c2fo.com](mailto:security@c2fo.com), with `fast-csv` in the subject line, or
- **GitHub:** [private vulnerability reporting](https://github.com/C2FO/fast-csv/security/advisories/new)

Please include:

- affected package(s) and version(s), and your Node.js version
- the parser or formatter options needed to trigger the issue
- steps to reproduce, ideally a minimal script and sample input
- the impact, meaning what an attacker could achieve and under what conditions

## Scope

**In scope:** vulnerabilities in the published packages that crafted CSV _data_ can trigger, for example:

- denial of service (ReDoS, excessive CPU or memory)
- format/parse round-trip injection
- prototype pollution
- sensitive data leaked through error messages

**Out of scope:**

- dev-only dependencies that aren't shipped in the packages
- issues that require attacker-controlled _options_
- spreadsheet formula injection (CWE-1236), which is the consuming application's responsibility
- unsupported versions
- the documentation site
