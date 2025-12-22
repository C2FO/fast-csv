---
title: Events
---

## `headers`

Emitted when the headers are parsed

- If the [headers option](./options.md#headers) is a function that transform headers, the array passed to this event will be the transformed headers
- If the [headers option](./options.md#headers) is set to an array of headers, the emitted header will be the option passed in.
- If the [headers option](./options.md#headers) is set to `true` the headers will be the parsed headers from the csv.

:::note
If the [headers option](./options.md#headers) is set to `false` or the csv has no rows then the event WILL NOT be emitted.
:::

## `data`

Emitted when a record is parsed.

- If headers are present then all rows will be an object.
- If headers are not present then all rows will be an array.

:::note
If [objectMode](./options.md#objectmode) is set to false then all rows will be a buffer with a JSON row.
:::

## data-invalid

Emitted if there was invalid row encountered;

- Emitted when a `validate` function is provided and an invalid row is encountered.
- Emitted when [strictColumnHandling](./options.md#strictcolumnhandling) is `true` and a row with a different number of fields than headers is encountered.
