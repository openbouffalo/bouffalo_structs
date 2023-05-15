# Bouffalo Structures

This repository contains structures such of boot headers, efuses, and others structures, which are complex, and they're often used.
The structures are in YAML format, and it is based on original Bouffalo structures from their source code, although, not all functions are documented,
some of values can be mapped to enums, and some of fields might be wrong. So improvements and fixes are always welcome.

# Download

You can find latest generated files in [Github Actions](https://github.com/openbouffalo/bouffalo_structs/actions).

# Generators

Repository also contains scripts, for converting those YAMLs to another file formats. Planned generators are:

- [X] Kaitai
- [X] ImHex ([docs](docs/imhex.md))
- [ ] C Headers
- [ ] Rust Headers
