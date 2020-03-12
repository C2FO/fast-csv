---
title: Row Types
---
When creating a CSV `fast-csv` supports a few row formats.

**`{[string]: any}`**

You can pass in object to any formatter function if your CSV requires headers the keys of the first object will be used as the header names.

```javascript
{
  a: "a1",
  b: "b1",
  c: "c1",
}

//Generated CSV
//a,b,c
//a1,b1,c1
```

**`string[]`**

You can also pass in your rows as arrays. If your CSV requires headers the first row passed in will be the headers used.

```javascript
[
    ["a", "b", "c"],
    ["a1", "b1", "c1"]
]
//Generated CSV
//a,b,c
//a1,b1,c1
```

**`[string, any][]`**

This is the least commonly used format but can be useful if you have requirements to generate a CSV with headers with the same column name (Crazy we know but we have seen it).

```javascript
[
    [
        ["a", "a1"],
        ["a", "a2"],
        ["b", "b1"],
        ["b", "b2"],
        ["c", "c1"],
        ["c", "c2"]
    ]
]

//Generated CSV
//a,a,b,b,c,c
//a1,a2,b1,b2,c1,c2
```
