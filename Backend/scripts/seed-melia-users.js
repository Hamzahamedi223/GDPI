const mongoose = require("mongoose");
require("dotenv").config();

const Role = require("../models/Role");
const Department = require("../models/Department");
const User = require("../models/Signup");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aaa";
const PASSWORD = "hamza123";

const upsertByName = (ModelRef, name) =>
  ModelRef.findOneAndUpdate({ name }, { name }, { upsert: true, new: true, setDefaultsOnInsert: true });

// email: prefers the personal melia.com address; falls back to the elmansourmahdia.com
// address only where it is unique to that person; synthesized where neither works
// (Kacem/Hammedi shared "it@elmansourmahdia.com"). Sami Ben Feiza has no email in the
// source sheet and is skipped entirely.
const employees = [
  { firstname: "Tarek", lastname: "Bouabid", username: "tarek_bouabid", email: "tarek.bouabid@melia.com", department: "General", role: "admin" },
  { firstname: "Walid", lastname: "Kaabi", username: "walid_kaabi", email: "walid.kaabi@melia.com", department: "General", role: "chef service" },
  { firstname: "Nadia", lastname: "Chouchene", username: "nadia_chouchene", email: "nadia.chouchene@melia.com", department: "Commercial", role: "chef service" },
  { firstname: "Naziha", lastname: "Bzeouich", username: "naziha_bzeouich", email: "naziha.bzeouich@melia.com", department: "RH", role: "chef service" },
  { firstname: "Abdessalem", lastname: "Zaabi", username: "abdessalem_zaabi", email: "abdessalem.zaabi@melia.com", department: "Production", role: "chef service" },
  { firstname: "Amel", lastname: "Khadhraoui", username: "amel_khadhraoui", email: "amel.khadhraoui@melia.com", department: "Finance", role: "user" },
  { firstname: "Aicha", lastname: "El Ghoul", username: "aicha_elghoul", email: "aicha.ghoul@melia.com", department: "Finance", role: "user" },
  { firstname: "Afifa", lastname: "Banouaz", username: "afifa_banouaz", email: "afifa.banaouas@melia.com", department: "Commercial", role: "chef service" },
  { firstname: "Alia", lastname: "Ftouhi", username: "alia_ftouhi", email: "alia.ftouhi@melia.com", department: "Logistique", role: "chef service" },
  { firstname: "Chadia", lastname: "Ghouili", username: "chadia_ghouili", email: "chadia.ghouili@melia.com", department: "Finance", role: "user" },
  { firstname: "Bilel", lastname: "Hadj Hamza", username: "bilel_hadjhamza", email: "caissier.general@elmansourmahdia.com", department: "Finance", role: "user" },
  { firstname: "Mohamed", lastname: "Cherif", username: "mohamed_cherif", email: "mohamed.cherif@melia.com", department: "Maintenance", role: "chef service" },
  { firstname: "Maher", lastname: "El Aich", username: "maher_elaich", email: "maher.aich@melia.com", department: "Finance", role: "chef service" },
  { firstname: "Mohamed Ali", lastname: "Marjoua", username: "mohamedali_marjoua", email: "mohamed.marjoua@melia.com", department: "Production", role: "chef service" },
  { firstname: "Hassan", lastname: "Maghrebi", username: "hassan_maghrebi", email: "hassan.maghrebi@melia.com", department: "Logistique", role: "chef service" },
  { firstname: "Adel", lastname: "Baraket", username: "adel_baraket", email: "adel.baraket@melia.com", department: "Commercial", role: "chef service" },
  { firstname: "Hafedh", lastname: "El Ouni", username: "hafedh_elouni", email: "hafedh.ouni@melia.com", department: "RH", role: "user" },
  { firstname: "Bassem", lastname: "Dlima", username: "bassem_dlima", email: "bassem.dlima@melia.com", department: "Finance", role: "user" },
  { firstname: "Hamdi", lastname: "Ben Rjab", username: "hamdi_benrjab", email: "hamdi.ben@melia.com", department: "Logistique", role: "user" },
  { firstname: "Ali", lastname: "Bannour", username: "ali_bannour", email: "ali.bannour@melia.com", department: "Production", role: "chef service" },
  { firstname: "Aicha", lastname: "Atia", username: "aicha_atia", email: "aicha.atia@melia.com", department: "General", role: "user" },
  { firstname: "Rabiaa", lastname: "Kheder", username: "rabiaa_kheder", email: "rabiaa.kheder@melia.com", department: "General", role: "chef service" },
  { firstname: "Ameni", lastname: "Zouali", username: "ameni_zouali", email: "ameni.zouali@melia.com", department: "Commercial", role: "user" },
  { firstname: "Riadh", lastname: "Bkakra", username: "riadh_bkakra", email: "riadh.bkakra@melia.com", department: "Finance", role: "chef service" },
  { firstname: "Rawia", lastname: "Kacem", username: "rawia_kacem", email: "rawia.kacem@melia.com", department: "IT", role: "chef service" },
  { firstname: "Hamza", lastname: "Hammedi", username: "hamza_hammedi", email: "hamza.hammedi@melia.com", department: "IT", role: "user" },
  { firstname: "Abdel Waheb", lastname: "Ben Rayena", username: "abdelwaheb_benrayena", email: "animation@elmansourmahdia.com", department: "General", role: "chef service" },
];

async function ensureUser(data, roleId, departmentId) {
  const existing = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
  if (existing) {
    console.log(`Skipping (already exists): ${data.email}`);
    return existing;
  }

  const user = new User({
    firstname: data.firstname,
    lastname: data.lastname,
    username: data.username,
    email: data.email,
    password: PASSWORD,
    role: roleId,
    department: departmentId,
  });
  user.isEmailVerified = true;
  await user.save();
  console.log(`Created: ${data.email}`);
  return user;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  const roleNames = [...new Set(employees.map((e) => e.role))];
  const departmentNames = [...new Set(employees.map((e) => e.department))];

  const roles = Object.fromEntries(
    await Promise.all(roleNames.map(async (name) => [name, (await upsertByName(Role, name))._id]))
  );
  const departments = Object.fromEntries(
    await Promise.all(departmentNames.map(async (name) => [name, (await upsertByName(Department, name))._id]))
  );

  for (const emp of employees) {
    await ensureUser(emp, roles[emp.role], departments[emp.department]);
  }

  console.log(`\nDone. ${employees.length} employees processed. Password for all: ${PASSWORD}`);
  console.log("Skipped from source sheet (no email available): Sami Ben Feiza - Chief Security Officer");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
