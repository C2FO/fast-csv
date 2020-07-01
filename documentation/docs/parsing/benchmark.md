---
title: Benchmarks
---

[Source in github](https://github.com/C2FO/fast-csv/tree/master/examples/benchmark)

## Quoted 

A csv with quoted columns. 

This is benchmark is important because quoted columns require additional logic to parse.


|Type|Row Count|No. Runs|Avg|
|-|-|-|-|
|quoted|1000|5|10.8ms|
|quoted|10000|5|70.8ms|
|quoted|20000|5|144.2ms|
|quoted|50000|5|356.6ms|
|quoted|100000|5|712.2ms|

## Non-quoted
 
A csv without quoted columns. 

Non-quoted fields require less logic to be parsed, and should be faster.

|Type|Row Count|No. Runs|Avg|
|-|-|-|-|
|nonquoted|1000|5|15ms|
|nonquoted|10000|5|62ms|
|nonquoted|20000|5|102.2ms|
|nonquoted|50000|5|259ms|
|nonquoted|100000|5|513ms|
