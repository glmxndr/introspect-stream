# introspect-stream

Provides rudimentary reactive streams.

Very early stage, use at our own risk.

## Design goals

+ Very small code base
+ Extensibility through plugins (map, filter, scan and merge are one-liner plugins)
+ Use of priorisation of dependencies instead of backpressure: dependent stream data processing is done before producing new values to emit
+ No focus on performance at this stage

## License

[GPL](https://gnu.org/licenses/gpl.html)
