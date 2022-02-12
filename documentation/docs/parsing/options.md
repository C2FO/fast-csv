---
title: Options
---

All of the following options can be passed to any of the [parse methods](./methods.mdx).

## objectMode
**Type**: `boolean` **Default**: `true`

Ensure that all rows are emitted as objects. 

If set to `false` all data will be a JSON version of the row.

## delimiter
**Type**: `string` **Default**: `','`

The delimiter that will separate columns. 

Set this option if your file uses an alternate delimiter such as `;` or `\t`. [Example](./examples.mdx#alternate-delimiter)

:::note
When specifying an alternate delimiter you may only pass in a single character! 
:::


## quote
**Type**: `string|null` **Default**: `'"'`

The character to use to quote fields that contain a delimiter. 

(e.g. `"first,name",last name` => `['first,name', 'last name']`)

:::note
If you set to `null` then all quoting will be ignored.
:::

## escape
**Type**: `string` **Default**: `'"'`

The character to use to escape quotes inside of a quoted field.

i.e: `First,"Name"' => '"First,""Name"""`

## headers
**Type**: `boolean|string[]|(string[]) => string[])` **Default**: `false`

If set to `true` the first row will be treated as the headers. [Example](./examples.mdx#first-row-as-headers)

If you want to manually specify the headers set to a `string[]`. [Example](./examples.mdx#custom-headers)

:::info
If you wish to discard the first row and use your own headers you need to set the **renameHeaders** option to **true**
:::

If you wish to transform the headers you can provide a transform function. [Example](./examples.mdx#transforming-headers)

If your rows are arrays, and you wan to skip certain columns you can provide a sparse array. [Example](./examples.mdx#skipping-columns)

:::note
When setting the headers option to a function it will always rename the headers 
:::
:::caution
If you specify headers and there are more columns than headers the following rules will apply
 * If you have `strictColumnHandling` set to `true` a `data-invalid` event will be emitted and parsing will continue.
 * If `strictColumnHandling` is not specified an `error` will be emitted and parsing will stop.
 * If you have set `discardUnmappedColumns` to `true` the extra columns will be dropped. 
:::
:::warning
If headers either parsed, provided or transformed are NOT unique, then an error will be emitted and the stream will stop parsing.
:::

## renameHeaders
**Type**: `boolean` **Default**: `false`

If you want the first line of the file to be removed and replaced by the one provided in the `headers` option. [Example](./examples.mdx#renaming-headers) 

:::info
This option should only be used if the `headers` option is a `string[]`
:::

:::note
If the `headers` option is a function then this option is always set to true.
:::

## ignoreEmpty
**Type**: `boolean` **Default**: `false`

Set to `true` to ignore empty rows. [Example](./examples.mdx#ignoring-empty-rows)

:::note
this will discard columns that are all white space or delimiters.
:::

## comment
**Type**: `string|null` **Default**: `null`

If your CSV contains comments you can use this option to ignore lines that begin with the specified character (e.g. `#`).

## discardUnmappedColumns
**Type**: `boolean` **Default**: `false`

If you want to discard columns that do not map to a header.

:::note
This is only valid in the case when the number of parsed columns is greater than the number of headers.
:::

## strictColumnHandling
**Type**: `boolean` **Default**: `false`
 
If you want to consider empty lines/lines with too few fields as invalid and emit a `data-invalid` event 

:::note
This option is only considered when `headers` are present.
:::

## trim
**Type**: `boolean` **Default**: `false`

Set to `true` to trim all white space from columns.

## rtrim
**Type**: `boolean` **Default**: `false`

Set to `true` to right trim all columns.

## ltrim
**Type**: `boolean` **Default**: `false`

Set to `true` to left trim all columns.

## encoding
**Type**: `string` **Default**: `'utf8'`

Passed to [StringDecoder](https://nodejs.org/api/string_decoder.html#string_decoder_new_stringdecoder_encoding) when decoding incoming buffers. Change if incoming content is not 'utf8' encoded.

## maxRows
**Type**: `number` **Default**: `0`

If number is `> 0` then only the specified number of rows will be parsed.(e.g. `100` would return the first 100 rows of data). [Example](./examples.mdx#max-rows)

## skipRows
**Type**: `number` **Default**: `0`

If number is `> 0` then the specified number of **parsed** rows will be skipped. [Example](./examples.mdx#skip-rows)

## skipLines
**Type**: `number` **Default**: `0`

If number is `> 0` the specified number of lines will be skipped. [Example](./examples.mdx#skip-lines)
