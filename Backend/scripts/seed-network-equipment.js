const mongoose = require("mongoose");
require("dotenv").config();

const Categorie = require("../models/Categorie");
const Model = require("../models/Model");
const Department = require("../models/Department");
const Fournisseur = require("../models/Fournisseurs");
const Equipment = require("../models/Equipment");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aaa";

// PLACEHOLDER values below (serial_number, purchase_date, department, fournisseur)
// were not provided in the source data. Update them once the real values are known.
const PLACEHOLDER_DEPARTMENT = "IT";
const PLACEHOLDER_PURCHASE_DATE = new Date();

const upsertByName = (ModelRef, name, extra = {}) =>
  ModelRef.findOneAndUpdate({ name }, { name, ...extra }, { upsert: true, new: true, setDefaultsOnInsert: true });

// Prices researched from Tunisian retailers (Mytek, Tunisianet, Mediavision, Primini) - July 2026.
const items = [
  {
    name: "D-Link DGS-1210-28",
    categorie: "Switch",
    model: "D-Link DGS-1210-28",
    prix: 780,
    status: "operational",
  },
  {
    // Source sheet said "TP-Link T2500G-28MPS", which is not a real TP-Link SKU.
    // Closest real match: T2600G-28MPS (TL-SG3424P), 24-port Gigabit L2 Managed PoE+ w/ 4 SFP.
    name: "TP-Link T2600G-28MPS (TL-SG3424P)",
    categorie: "Switch",
    model: "TP-Link T2600G-28MPS (TL-SG3424P)",
    prix: 1699,
    status: "operational",
  },
  {
    name: "TP-Link LiteWave LS1024G",
    categorie: "Switch",
    model: "TP-Link LiteWave LS1024G",
    prix: 349,
    status: "operational",
  },
  {
    name: "TP-Link TL-SG1024",
    categorie: "Switch",
    model: "TP-Link TL-SG1024",
    // No exact Tunisia TND listing found; derived from EU pricing (~87 EUR). Verify against a local reseller.
    prix: 295,
    status: "operational",
  },
  {
    // "Fidelio" is Oracle Hospitality's hotel PMS software, not an HP server model -
    // this is an in-house asset with no current market price. prix left at 0, update manually.
    name: "HP Fidelio Server",
    categorie: "Server",
    model: "HP Server (Fidelio)",
    prix: 0,
    status: "operational",
  },
  {
    // No specific HP monitor model given; figure is a market-range estimate, not a quote.
    name: "HP Monitor for Server",
    categorie: "Monitor",
    model: "HP Server Monitor",
    prix: 275,
    status: "operational",
  },
  {
    name: "Eaton 9E 1000i",
    categorie: "UPS",
    model: "Eaton 9E 1000i",
    prix: 1600,
    status: "operational",
  },
  {
    name: "Eaton 9E 3000i",
    categorie: "UPS",
    model: "Eaton 9E 3000i",
    prix: 3400,
    status: "operational",
  },
  {
    name: "Eaton 5E 2200UI",
    categorie: "UPS",
    model: "Eaton 5E 2200UI",
    prix: 1459,
    status: "operational",
  },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  const categoryNames = [...new Set(items.map((item) => item.categorie))];
  const categories = Object.fromEntries(
    await Promise.all(categoryNames.map(async (name) => [name, (await upsertByName(Categorie, name))._id]))
  );

  const department = await upsertByName(Department, PLACEHOLDER_DEPARTMENT);

  const supplier = await Fournisseur.findOneAndUpdate(
    { email: "placeholder-supplier@to-update.local" },
    {
      name: "PLACEHOLDER SUPPLIER - TO UPDATE",
      contactPerson: "TO UPDATE",
      email: "placeholder-supplier@to-update.local",
      phone: "+000000000",
      address: {
        street: "TO UPDATE",
        city: "TO UPDATE",
        postalCode: "0000",
        country: "Tunisia",
      },
      taxId: "TO-UPDATE",
      status: "active",
      notes: "Placeholder supplier auto-created by seed-network-equipment.js - replace with real supplier.",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let created = 0;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const model = await upsertByName(Model, item.model, { category: categories[item.categorie] });
    const serial_number = `PLACEHOLDER-SN-${String(index + 1).padStart(3, "0")}`;

    const result = await Equipment.findOneAndUpdate(
      { serial_number },
      {
        name: item.name,
        categorie: categories[item.categorie],
        model: model._id,
        serial_number,
        purchase_date: PLACEHOLDER_PURCHASE_DATE,
        warranty_status: "valid",
        status: item.status,
        department: department._id,
        fournisseur: supplier._id,
        prix: item.prix,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created += 1;
    console.log(`Upserted: ${result.name} (${result.serial_number}) - ${result.prix} TND`);
  }

  console.log(`\nDone. ${created} equipment records upserted.`);
  console.log("Reminder: serial_number, purchase_date, department, and supplier are PLACEHOLDERS - update once real values are known.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
