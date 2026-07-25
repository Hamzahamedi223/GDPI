const mongoose = require("mongoose");
require("dotenv").config();

const Role = require("../models/Role");
const Department = require("../models/Department");
const User = require("../models/Signup");
const Categorie = require("../models/Categorie");
const Model = require("../models/Model");
const Fournisseur = require("../models/Fournisseurs");
const Equipment = require("../models/Equipment");
const SparePart = require("../models/SparePart");
const PanneType = require("../models/PanneType");
const Panne = require("../models/Panne");
const Reclamation = require("../models/Reclamation");
const Besoin = require("../models/Besoin");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Gestion_du_parc_informatique";
const TEST_PASSWORD = "Test@12345";

const pick = (items, index) => items[index % items.length];

const upsertByName = (ModelRef, name, extra = {}) =>
  ModelRef.findOneAndUpdate({ name }, { name, ...extra }, { upsert: true, new: true, setDefaultsOnInsert: true });

async function ensureUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) return existing;

  const user = new User(data);
  user.isEmailVerified = true;
  await user.save();
  return user;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const roles = await Promise.all(
    ["admin", "chef service", "user"].map((name) => upsertByName(Role, name))
  );

  const departments = await Promise.all(
    ["General", "IT", "Finance", "RH", "Production", "Maintenance", "Logistique", "Commercial"].map((name) =>
      upsertByName(Department, name)
    )
  );

  const categories = await Promise.all(
    ["Laptop", "Desktop", "Printer", "Network", "Server", "Scanner", "Phone", "Accessory"].map((name) =>
      upsertByName(Categorie, name)
    )
  );

  const models = await Promise.all(
    ["ThinkPad T14", "OptiPlex 7090", "LaserJet Pro", "Catalyst 2960", "PowerEdge R650", "ScanJet Pro", "Galaxy A55", "Dock USB-C"].map((name, index) =>
      upsertByName(Model, name, { category: pick(categories, index)._id })
    )
  );

  const suppliers = await Promise.all(
    Array.from({ length: 12 }, (_, index) => {
      const number = index + 1;
      return Fournisseur.findOneAndUpdate(
        { email: `supplier${number}@example.com` },
        {
          name: `Supplier ${number}`,
          contactPerson: `Contact ${number}`,
          email: `supplier${number}@example.com`,
          phone: `+212600000${String(number).padStart(3, "0")}`,
          address: {
            street: `${number} Avenue Test`,
            city: pick(["Casablanca", "Rabat", "Tanger", "Marrakech"], index),
            postalCode: `20${String(number).padStart(3, "0")}`,
            country: "Morocco",
          },
          taxId: `TAX-${String(number).padStart(5, "0")}`,
          status: index % 5 === 0 ? "inactive" : "active",
          notes: "Generated test supplier",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  const users = [];
  for (let index = 0; index < 80; index += 1) {
    const number = index + 1;
    const role = index === 0 ? roles[0] : index % 7 === 0 ? roles[1] : roles[2];
    users.push(
      await ensureUser({
        firstname: `Test${number}`,
        lastname: `User${number}`,
        username: `test_user_${number}`,
        email: `test.user.${number}@example.com`,
        password: TEST_PASSWORD,
        role: role._id,
        department: pick(departments, index)._id,
        isEmailVerified: true,
      })
    );
  }

  const equipments = await Promise.all(
    Array.from({ length: 160 }, (_, index) => {
      const number = index + 1;
      return Equipment.findOneAndUpdate(
        { serial_number: `GDPI-SN-${String(number).padStart(5, "0")}` },
        {
          name: `${pick(categories, index).name} ${number}`,
          categorie: pick(categories, index)._id,
          model: pick(models, index)._id,
          serial_number: `GDPI-SN-${String(number).padStart(5, "0")}`,
          purchase_date: new Date(2022 + (index % 4), index % 12, (index % 27) + 1),
          warranty_status: index % 4 === 0 ? "expired" : "valid",
          department: pick(departments, index)._id,
          fournisseur: pick(suppliers, index)._id,
          prix: 600 + index * 17,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  await Promise.all(
    Array.from({ length: 120 }, (_, index) => {
      const number = index + 1;
      return SparePart.findOneAndUpdate(
        { part_number: `PART-${String(number).padStart(5, "0")}` },
        {
          name: `Spare Part ${number}`,
          category: pick(categories, index)._id,
          supplier: pick(suppliers, index)._id,
          status: index % 6 === 0 ? "unavailable" : "available",
          part_number: `PART-${String(number).padStart(5, "0")}`,
          purchase_date: new Date(2023 + (index % 3), index % 12, (index % 27) + 1),
          department: pick(departments, index)._id,
          price: 40 + index * 3,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    })
  );

  const panneTypes = await Promise.all(
    [
      ["Hardware", "#EF4444", "cpu"],
      ["Software", "#3B82F6", "code"],
      ["Network", "#F59E0B", "wifi"],
      ["Printer", "#8B5CF6", "printer"],
    ].map(([name, color, icon]) => upsertByName(PanneType, name, { description: `${name} issue`, color, icon }))
  );

  await Promise.all(
    Array.from({ length: 90 }, (_, index) =>
      Panne.findOneAndUpdate(
        { description: `Generated panne ${index + 1}` },
        {
          equipment: pick(equipments, index)._id,
          description: `Generated panne ${index + 1}`,
          type: pick(panneTypes, index)._id,
          status: pick(["pending", "in_progress", "resolved", "rejected"], index),
          priority: pick(["high", "medium", "low"], index),
          department: pick(departments, index)._id,
          reportedBy: pick(users, index)._id,
          assignedTo: pick(users, index + 5)._id,
          resolution: index % 4 === 2 ? "Resolved during test seed" : "",
          resolutionDate: index % 4 === 2 ? new Date() : undefined,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await Promise.all(
    Array.from({ length: 75 }, (_, index) =>
      Reclamation.findOneAndUpdate(
        { title: `Generated reclamation ${index + 1}` },
        {
          title: `Generated reclamation ${index + 1}`,
          description: `Test reclamation payload ${index + 1}`,
          department: pick(departments, index)._id,
          status: pick(["pending", "in_progress", "resolved", "rejected"], index),
          priority: pick(["high", "medium", "low"], index),
          createdBy: pick(users, index)._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await Promise.all(
    Array.from({ length: 75 }, (_, index) =>
      Besoin.findOneAndUpdate(
        { title: `Generated besoin ${index + 1}` },
        {
          title: `Generated besoin ${index + 1}`,
          description: `Test besoin payload ${index + 1}`,
          department: pick(departments, index)._id,
          status: pick(["pending", "approved", "rejected"], index),
          priority: pick(["high", "medium", "low"], index),
          quantity: (index % 10) + 1,
          createdBy: pick(users, index)._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  console.log("Seed complete");
  console.log(`Users: ${users.length}, equipment: ${equipments.length}, suppliers: ${suppliers.length}`);
  console.log(`Default generated password: ${TEST_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
