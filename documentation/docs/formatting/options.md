---
title: Options
---

All of the following options can be passed to any of the [formatting methods](./methods).

## delimiter
**Type**: `string` **Default**: `','`

Specify an alternate field delimiter such as `;` or `\t`. [Example](./examples#alternate-delimiter)

:::note
When specifying an alternate `delimiter` you may only pass in a single character delimiter
:::

## rowDelimiter
**Type**: `string` **Default**: `'\n'`

Specify an alternate row delimiter (i.e `\r\n`). [Example](./examples#alternate-rowdelimiter)

## quote
**Type**: `string|boolean` **Default**: `'"'`

If provided as a string it will be used to quote fields that contain a delimiter. [Example](./examples#alternate-quote)
```
"first,name",last name`
```
   
If set to `true` the default quote will be used. 

:::note
This is the same as not providing the option
:::

If set to `false` then quoting will be disabled 
:::caution
If your field could contain a delimiter then you may end up with extra columns
:::
           
## escape
**Type**: `string` **Default**: `'"'`

The character to use when escaping a value that is `quoted` and contains a `quote` character that is not the end of the field. [Example](./examples#alternate-escape)

`i.e`: `First,"Name"' => '"First,""Name"""`
    
## includeEndRowDelimiter
**Type**: `boolean` **Default**: `false`

Set to `true` to include a row delimiter at the end of the csv.

## writeBOM
**Type**: `boolean` **Default**: `false`

Set to `true` if you want the first character written to the stream to be a utf-8 BOM character.

## headers
**Type**: `null|boolean|string[]` **Default**: `null`

If `true` then the headers will be auto detected from the first row. [Example](./examples#auto-discovery)
    * If the row is a one-dimensional array then headers is a no-op
    * If the row is an object then the keys will be used.
    * If the row is an array of two element arrays (`[ ['header', 'column'], ['header2', 'column2'] ]`) then the first element in each array will be used.

If there is not a headers row and you want to provide one then set to a `string[]`. [Example](./examples#provided-headers)

:::note
* If the row is an object the headers must match fields in the object, otherwise you will end up with empty fields
* If there are more headers than columns then additional empty columns will be added
:::

## writeHeaders
**Type**: `boolean` **Default**: `true`

Set to false you dont want to write headers.

:::info
This option can be used to append to an existing csv.
:::
:::note
* If the **headers** option is set to **true** and the **writeHeaders** option set to **false** then any auto discovered headers will not be written in the output. [Example](./examples#do-not-write-headers)
* If **headers** is a **string[]** and **writeHeaders** is **false** then they will not be written. [Example](./examples#specify-column-order-without-headers)
:::

## alwaysWriteHeaders
**Type**: `boolean` **Default**: `false`
 
Set to true if you always want headers written, even if no rows are written.

:::caution
This will throw an error if headers are not specified as an array.
:::

## quoteColumns
**Type**: `boolean|boolean[]|{[string]: boolean}` **Default**: `false`

If `true` then columns and headers will be quoted (unless `quoteHeaders` is specified). 
  * [Example](./examples#boolean)
  * [Quote Columns NOT Headers Example](./examples#quote-columns-not-headers)

If it is an object then each key that has a true value will be quoted ((unless `quoteHeaders` is specified). [Example](./examples#object)

If it is an array then each item in the array that is true will have the column at the corresponding index quoted (unless `quoteHeaders` is specified). [Example](./examples#boolean-1)
:::note 
If `quoteHeaders` is not specified this option will apply to both columns and headers.
:::

## quoteHeaders
**Type**: `boolean|boolean[]|{[string]: boolean}` **Default**: the `quoteColumns` value
   
If `true` then all headers will be quoted.

If it is an object then each key that has a true value will be quoted (see example below)

If it is an array then each item in the array that is true will have the header at the corresponding index quoted

## transform
**Type**: `(row) => Row | (row, cb) => void` **Default**: `null`

A function that accepts a row and returns a transformed one to be written, or your function can accept an optional callback to do async transformations.
