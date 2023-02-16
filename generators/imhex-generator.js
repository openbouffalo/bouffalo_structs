import fs from 'fs/promises';
import YAML from 'yaml';

function typeToImHex(type) {
  switch (type) {
    case 'uint8_t': return 'u8';
    case 'uint16_t': return 'u16';
    case 'uint32_t': return 'u32';
    // default: throw new Error(`Type ${type} not found.`);
    // TODO: Check if it doesn't exists among consts, enums and other structs
    default:
      console.log(`Warning, unknown type ${type}.`);
      return type;
  }
}

function typeToBits(type) {
  switch (type) {
    case 'uint8_t': return 8;
    case 'uint16_t': return 16;
    case 'uint32_t': return 32;
    default: throw new Error(`Type ${type} not found.`);
  }
}

async function structureToImHex(structPath, hexpatPath) {
  const struct = YAML.parse(await fs.readFile(structPath, 'utf-8'));

  let finalHexpat = [];
  if (struct.meta.imports !== undefined) {
    let imports = struct.meta.imports.map(_import => {
      return `#include "${_import}.hexpat"`;
    }).join('\n');
    finalHexpat.push(imports);
  }

  let bitfields = [];
  let currentBitfield = null;
  let mainStructFields = [];

  for (const field of struct.fields) {
    let type = typeToImHex(field.type);
    let name = field.id;
    let size = field.size !== undefined ? `[${field.size}]` : '';
    if (field.bitsize !== undefined) {
      if (currentBitfield === null) {
        currentBitfield = {
          size: 0,
          fields: []
        };
      }
      currentBitfield.size += field.bitsize;
      currentBitfield.fields.push(`${name} : ${field.bitsize};`);
      continue;
    } else if (currentBitfield !== null && field.bitsize === undefined) {
      if (currentBitfield.size % 8 !== 0) throw new Error('Bitfield size is not 8 bit aligned.');
      const index = bitfields.length;
      const type = `${struct.meta.name}_flags${index}`;
      bitfields.push({
        name: type,
        fields: currentBitfield.fields,
      });
      currentBitfield = null;
      mainStructFields.push(`${type} flags${index};`);
    }
    
    mainStructFields.push(`${type} ${name}${size};`);
  }

  for (const bitfield of bitfields) {
    finalHexpat.push(`bitfield ${bitfield.name} {\n  ` +
    bitfield.fields.join('\n  ') + 
    '\n};');
  }

  finalHexpat.push(`struct ${struct.meta.name} {\n  ` +
    mainStructFields.join('\n  ') + 
    '\n};');
  
  await fs.writeFile(hexpatPath, finalHexpat.join('\n\n'));
}

async function main() {
  await structureToImHex('./bl808/bl808_clock_cfg.yaml', './imhex/includes/bl808_clock_cfg.hexpat');
  await structureToImHex('./bl808/bl808_flash_cfg.yaml', './imhex/includes/bl808_flash_cfg.hexpat');
  await structureToImHex('./bl808/bl808_boot_clock_cfg.yaml', './imhex/includes/bl808_boot_clock_cfg.hexpat');
  await structureToImHex('./bl808/bl808_boot_flash_cfg.yaml', './imhex/includes/bl808_boot_flash_cfg.hexpat');
  await structureToImHex('./bl808/bl808_boot_cpu_cfg.yaml', './imhex/includes/bl808_boot_cpu_cfg.hexpat');
  await structureToImHex('./bl808/bl808_boot_basic_cfg.yaml', './imhex/includes/bl808_boot_basic_cfg.hexpat');
  await structureToImHex('./bl808/bl808_boot_patch_cfg.yaml', './imhex/includes/bl808_boot_patch_cfg.hexpat');
  await structureToImHex('./bl808/bl808_boot_header.yaml', './imhex/includes/bl808_boot_header.hexpat');

  // await structureToImHex('./bl61x/bl61x_clock_cfg.yaml', './imhex/bl61x/bl61x_clock_cfg.hexpat');
  // await structureToImHex('./bl61x/bl61x_flash_cfg.yaml', './imhex/bl61x/bl61x_flash_cfg.hexpat');
  // await structureToImHex('./bl61x/bl61x_boot_clock_cfg.yaml', './imhex/bl61x/bl61x_boot_clock_cfg.hexpat');
  // await structureToImHex('./bl61x/bl61x_boot_flash_cfg.yaml', './imhex/bl61x/bl61x_boot_flash_cfg.hexpat');
  // await structureToImHex('./bl61x/bl61x_boot_cpu_cfg.yaml', './imhex/bl61x/bl61x_boot_cpu_cfg.hexpat');
  // await structureToImHex('./bl61x/bl61x_boot_basic_cfg.yaml', './imhex/bl61x/bl61x_boot_basic_cfg.hexpat');
  // await structureToImHex('./bl61x/bl61x_boot_patch_cfg.yaml', './imhex/bl61x/bl61x_boot_patch_cfg.hexpat');
  // await structureToImHex('./bl61x/bl61x_boot_header.yaml', './imhex/bl61x/bl61x_boot_header.hexpat');
}
main();