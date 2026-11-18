const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const { initDatabase, getDbDiagnostics } = require("../config/db");
const { initMongo } = require("../config/mongo");
const { initRedis } = require("../config/redis");
const { seedDemoOrders } = require("../services/orderService");

async function main() {
  await Promise.allSettled([initDatabase(), initMongo(), initRedis()]);
  const orders = await seedDemoOrders();
  const db = getDbDiagnostics();
  console.log("====================================================");
  console.log(`Seeded ${orders.length} demo orders into: ${db.mode}`);
  console.log("====================================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err.message);
  process.exit(1);
});
