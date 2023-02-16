# ImHex generator

## Instalation

Download latest ImHex hexpat files from [Github Releases](https://github.com/openbouffalo/bouffalo_structs/releases). Extract the contents somewhere.

Then in ImHex, go to `Help > Settings > Folders`, and add extracted `imhex` folder (note, extracted `imhex` folder needs to have folder `includes` with the hexpats).

## Usage

### BL808 single boot header

In case of BL808, if you want to parse boot header (group0) which is at 0x00000000, write following code to pattern editor:

```c
#include <bl808_boot_header.hexpat>

bl808_boot_header boot_header_group0 @ 0x00000000;
```

And then press **Evaluate** button in **Console** tab.

### BL808 multiple boot headers

In case you have opened full firmware and you want to parse both group0 and group1 boot header, use following code to pattern editor, which will automatically find headers:

```c
#include <bl808_boot_header.hexpat>
#include <std/mem.pat>

fn find_group0() {
    return std::mem::find_sequence(0, 0x42, 0x46, 0x4E, 0x50);
};

fn find_group1() {
    return std::mem::find_sequence(0, 0x42, 0x46, 0x41, 0x50);
};

bl808_boot_header boot_header_group0 @ find_group0();
bl808_boot_header boot_header_group1 @ find_group1();
```

And then press **Evaluate** button in **Console** tab.