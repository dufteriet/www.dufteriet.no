import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "js/prisdata.json");

// Hjelpefunksjoner
const err = (msg) => {
  console.error("❌", msg);
  process.exitCode = 1;
};

try {
  // Finn filen
  if (!fs.existsSync(FILE)) {
    err(`Finner ikke ${FILE}. Er stien korrekt?`);
    process.exit();
  }

  const raw = fs.readFileSync(FILE, "utf8");

  // Rå JSON-parse (fanger syntaksfeil)
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    err(`Ugyldig JSON-syntaks i ${FILE}: ${e.message}`);
    process.exit();
  }

  // Grunnleggende struktur
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    err("Roten i prisdata må være et JSON-objekt (ikke array).");
  }

  const keyRe = /^[A-Za-z0-9-]+$/; // kun bokstaver/tall/bindestrek
  const sizeRe = /^\d+ml$/; // f.eks. 1ml, 2ml, 3ml, 5ml, 10ml

  let countKeys = 0;

  for (const [key, entry] of Object.entries(data)) {
    countKeys++;

    // Nøkkel-format
    if (!keyRe.test(key)) {
      err(
        `Nøkkel "${key}" inneholder ugyldige tegn. Bare [A–Z a–z 0–9 -] er tillatt.`
      );
    }

    // Må ha "new"
    if (!entry || typeof entry !== "object" || !entry.new) {
      err(`"${key}" mangler "new"-seksjon.`);
      continue;
    }
    if (typeof entry.new !== "object" || Array.isArray(entry.new)) {
      err(`"${key}".new må være et objekt (for eksempel {"2ml": 40, ...}).`);
      continue;
    }

    // Sjekk størrelser og priser
    const sizes = Object.entries(entry.new);
    if (sizes.length === 0) {
      err(`"${key}".new inneholder ingen størrelser/priser.`);
      continue;
    }

    for (const [sizeKey, price] of sizes) {
      if (!sizeRe.test(sizeKey)) {
        err(
          `"${key}": størrelse "${sizeKey}" er ugyldig. Bruk format som "2ml", "3ml", "5ml" (uten mellomrom).`
        );
      }
      if (typeof price !== "number" || !Number.isFinite(price)) {
        err(`"${key}": pris for "${sizeKey}" må være et tall (f.eks. 70).`);
      }
    }
  }

  if (process.exitCode === 1) {
    // Det var feil; la jobben feile.
    process.exit();
  } else {
    console.log(`✅ Prisdata OK. Antall produkter: ${countKeys}`);
  }
} catch (e) {
  err(`Uventet feil: ${e.message}`);
  process.exit();
}
