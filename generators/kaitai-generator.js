import fs from 'fs/promises';
import YAML from 'yaml';

function typeToKaitai(type) {
  switch (type) {
    case 'uint8_t': return 'u1';
    case 'uint16_t': return 'u2';
    case 'uint32_t': return 'u4';
    // default: throw new Error(`Type ${type} not found.`);
    // TODO: Check if it doesn't exists among consts, enums and other structs
    default:
      console.log(`Warning, unknown type ${type}.`);
      return type;
  }
}

async function structureToKaitai(structPath, kaitaiPath) {
  const struct = YAML.parse(await fs.readFile(structPath, 'utf-8'));
  let ksy = {
    meta: {
      id: struct.meta.name,
      endian: 'le',
      'bit-endian': 'le',
    },
    seq: []
  };

  if (struct.meta.imports !== undefined) {
    ksy.meta.imports = struct.meta.imports;
  }

  for (const field of struct.fields) {
    let ksyField = {
      id: field.id,
    };
    if (field.bitsize !== undefined) {
      ksyField.type = 'b' + field.bitsize;
    } else if (field.type !== undefined && field.size !== undefined) {
      // TODO: Workaround... + needs proper size calculation
      ksyField.type = typeToKaitai(field.type);
      ksyField.repeat = 'expr'
      ksyField['repeat-expr'] = field.size;
    } else if (field.type !== undefined) {
      ksyField.type = typeToKaitai(field.type);
    } else if (field.size !== undefined) {
      throw new Error('Unimplemented');
    }
    ksy.seq.push(ksyField);
  }


  await fs.writeFile(kaitaiPath, YAML.stringify(ksy));
}


async function main() {
  await structureToKaitai('./bl808/bl808_clock_cfg.yaml', './kaitai/bl808/bl808_clock_cfg.ksy');
  await structureToKaitai('./bl808/bl808_flash_cfg.yaml', './kaitai/bl808/bl808_flash_cfg.ksy');
  await structureToKaitai('./bl808/bl808_boot_clock_cfg.yaml', './kaitai/bl808/bl808_boot_clock_cfg.ksy');
  await structureToKaitai('./bl808/bl808_boot_flash_cfg.yaml', './kaitai/bl808/bl808_boot_flash_cfg.ksy');
  await structureToKaitai('./bl808/bl808_boot_cpu_cfg.yaml', './kaitai/bl808/bl808_boot_cpu_cfg.ksy');
  await structureToKaitai('./bl808/bl808_boot_basic_cfg.yaml', './kaitai/bl808/bl808_boot_basic_cfg.ksy');
  await structureToKaitai('./bl808/bl808_boot_patch_cfg.yaml', './kaitai/bl808/bl808_boot_patch_cfg.ksy');
  await structureToKaitai('./bl808/bl808_boot_header.yaml', './kaitai/bl808/bl808_boot_header.ksy');
}

main();