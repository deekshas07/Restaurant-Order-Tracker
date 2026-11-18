const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { INITIAL_ORDERS, findMenuMetadata } = require("../utils/seedData");

const PERSISTENT_STORE_DIR = path.join(__dirname, "..", "data");
const PERSISTENT_STORE_FILE = path.join(
  PERSISTENT_STORE_DIR,
  "orders_store.json"
);

let activePool = null;
let isPostgresConnected = false;
let activeDbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "restaurant_tracker",
  user: process.env.DB_USER || "postgres",
};
let lastPingMs = 0;
let lastError = null;
let queryCount = 0;

// Zero-Dependency Persistent Relational Store (auto-saved to disk & used when PostgreSQL is offline)
let memoryOrders = [];
let memoryNextId = 1;

function enrichOrderObject(item, fallbackId = 1) {
  const meta = findMenuMetadata(item.food_item);
  const rawPrice = Number(item.price);
  const effectivePrice =
    !Number.isNaN(rawPrice) && rawPrice >= 40
      ? rawPrice
      : meta.price || 320;

  return {
    id: Number(item.id || fallbackId),
    customer_name: item.customer_name,
    food_item: item.food_item,
    quantity: Number(item.quantity || 1),
    status: item.status || "Pending",
    table_number: item.table_number || "T-01",
    priority: item.priority || "Normal",
    price: effectivePrice,
    category: item.category || meta.category || "Dinner",
    diet_type: item.diet_type || meta.diet_type || "Veg",
    image_url: item.image_url || meta.image_url,
    notes: item.notes || "",
    created_at: item.created_at
      ? new Date(item.created_at).toISOString()
      : new Date().toISOString(),
    updated_at: item.updated_at
      ? new Date(item.updated_at).toISOString()
      : new Date().toISOString(),
  };
}

function savePersistentDiskStore() {
  try {
    if (!fs.existsSync(PERSISTENT_STORE_DIR)) {
      fs.mkdirSync(PERSISTENT_STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(
      PERSISTENT_STORE_FILE,
      JSON.stringify(
        {
          nextId: memoryNextId,
          updatedAt: new Date().toISOString(),
          orders: memoryOrders,
        },
        null,
        2
      ),
      "utf8"
    );
  } catch (err) {
    // Non-fatal in read-only environments
  }
}

function seedMemoryStore() {
  const now = Date.now();
  memoryOrders = INITIAL_ORDERS.map((item, idx) => {
    const timestamp = new Date(
      now - (INITIAL_ORDERS.length - idx) * 6 * 60 * 1000
    ).toISOString();
    return enrichOrderObject(
      {
        ...item,
        id: idx + 1,
        created_at: timestamp,
        updated_at: timestamp,
      },
      idx + 1
    );
  });
  memoryNextId = memoryOrders.length + 1;
  savePersistentDiskStore();
}

function loadOrSeedMemoryStore() {
  try {
    if (fs.existsSync(PERSISTENT_STORE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(PERSISTENT_STORE_FILE, "utf8"));
      if (raw && Array.isArray(raw.orders) && raw.orders.length > 0) {
        memoryOrders = raw.orders.map((o, idx) =>
          enrichOrderObject(o, idx + 1)
        );
        const maxId = memoryOrders.reduce(
          (m, o) => Math.max(m, Number(o.id) || 0),
          0
        );
        memoryNextId = Math.max(Number(raw.nextId) || 1, maxId + 1);
        return;
      }
    }
  } catch (err) {
    // Fallback to clean seed
  }
  seedMemoryStore();
}

// Initialize persistent store immediately
loadOrSeedMemoryStore();

function normalizeOrderRow(row) {
  if (!row) return null;
  return enrichOrderObject(row, row.id);
}

/**
 * Parameterized SQL query execution with automatic PostgreSQL + persistent disk fallback.
 */
async function query(sqlText, params = []) {
  queryCount += 1;
  const start = Date.now();

  if (isPostgresConnected && activePool) {
    try {
      const res = await activePool.query(sqlText, params);
      lastPingMs = Date.now() - start;
      return res;
    } catch (err) {
      lastError = err.message;
      isPostgresConnected = false;
    }
  }

  const normalizedSql = String(sqlText).trim().replace(/\s+/g, " ");
  const upperSql = normalizedSql.toUpperCase();

  if (
    upperSql.startsWith("CREATE TABLE") ||
    upperSql.startsWith("ALTER TABLE") ||
    upperSql === "SELECT 1"
  ) {
    lastPingMs = Math.max(1, Date.now() - start);
    return { rows: [{ "?column?": 1 }], rowCount: 1 };
  }

  if (upperSql.startsWith("TRUNCATE TABLE ORDERS")) {
    memoryOrders = [];
    memoryNextId = 1;
    savePersistentDiskStore();
    lastPingMs = Math.max(1, Date.now() - start);
    return { rows: [], rowCount: 0 };
  }

  if (upperSql.includes("SELECT COUNT(*)")) {
    lastPingMs = Math.max(1, Date.now() - start);
    return {
      rows: [{ total: memoryOrders.length, count: memoryOrders.length }],
      rowCount: 1,
    };
  }

  if (upperSql.startsWith("SELECT * FROM ORDERS WHERE ID = $1")) {
    const id = Number(params[0]);
    const found = memoryOrders.find((o) => o.id === id);
    lastPingMs = Math.max(1, Date.now() - start);
    return {
      rows: found ? [{ ...found }] : [],
      rowCount: found ? 1 : 0,
    };
  }

  if (upperSql.startsWith("SELECT * FROM ORDERS")) {
    const rows = [...memoryOrders]
      .sort((a, b) => a.id - b.id)
      .map((o) => ({ ...o }));
    lastPingMs = Math.max(1, Date.now() - start);
    return { rows, rowCount: rows.length };
  }

  if (upperSql.startsWith("INSERT INTO ORDERS")) {
    const nowIso = new Date().toISOString();
    const meta = findMenuMetadata(params[1]);
    const newOrder = enrichOrderObject(
      {
        id: memoryNextId++,
        customer_name: params[0],
        food_item: params[1],
        quantity: Number(params[2] ?? 1),
        status: params[3] || "Pending",
        table_number: params[4] || "T-01",
        priority: params[5] || "Normal",
        price: params[6] !== undefined ? Number(params[6]) : meta.price,
        notes: params[7] || "",
        category: params[8] || meta.category,
        diet_type: params[9] || meta.diet_type,
        image_url: params[10] || meta.image_url,
        created_at: nowIso,
        updated_at: nowIso,
      },
      memoryNextId - 1
    );
    memoryOrders.push(newOrder);
    savePersistentDiskStore();
    lastPingMs = Math.max(1, Date.now() - start);
    return { rows: [{ ...newOrder }], rowCount: 1 };
  }

  if (upperSql.startsWith("DELETE FROM ORDERS WHERE ID = $1")) {
    const id = Number(params[0]);
    const idx = memoryOrders.findIndex((o) => o.id === id);
    lastPingMs = Math.max(1, Date.now() - start);
    if (idx === -1) return { rows: [], rowCount: 0 };
    const [deleted] = memoryOrders.splice(idx, 1);
    savePersistentDiskStore();
    return { rows: [{ ...deleted }], rowCount: 1 };
  }

  if (upperSql.startsWith("UPDATE ORDERS")) {
    if (params.length === 2) {
      const [status, id] = params;
      const idx = memoryOrders.findIndex((o) => o.id === Number(id));
      if (idx === -1) return { rows: [], rowCount: 0 };
      memoryOrders[idx] = {
        ...memoryOrders[idx],
        status,
        updated_at: new Date().toISOString(),
      };
      savePersistentDiskStore();
      lastPingMs = Math.max(1, Date.now() - start);
      return { rows: [{ ...memoryOrders[idx] }], rowCount: 1 };
    }

    const id = Number(params[params.length - 1]);
    const idx = memoryOrders.findIndex((o) => o.id === id);
    if (idx === -1) return { rows: [], rowCount: 0 };
    const meta = findMenuMetadata(params[1]);
    memoryOrders[idx] = enrichOrderObject(
      {
        ...memoryOrders[idx],
        customer_name: params[0],
        food_item: params[1],
        quantity: Number(params[2]),
        status: params[3],
        table_number: params[4],
        priority: params[5],
        price: Number(params[6]),
        notes: params[7],
        category: params[8] || memoryOrders[idx].category || meta.category,
        diet_type: params[9] || memoryOrders[idx].diet_type || meta.diet_type,
        image_url: params[10] || memoryOrders[idx].image_url || meta.image_url,
        updated_at: new Date().toISOString(),
      },
      id
    );
    savePersistentDiskStore();
    lastPingMs = Math.max(1, Date.now() - start);
    return { rows: [{ ...memoryOrders[idx] }], rowCount: 1 };
  }

  lastPingMs = Math.max(1, Date.now() - start);
  return { rows: [], rowCount: 0 };
}

async function ensureSchemaAndSeed(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(120) NOT NULL,
      food_item VARCHAR(160) NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status VARCHAR(30) NOT NULL DEFAULT 'Pending',
      table_number VARCHAR(30) DEFAULT 'T-01',
      priority VARCHAR(20) DEFAULT 'Normal',
      price NUMERIC(10, 2) DEFAULT 320.00,
      notes TEXT DEFAULT '',
      category VARCHAR(40) DEFAULT 'Dinner',
      diet_type VARCHAR(20) DEFAULT 'Veg',
      image_url TEXT DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrations = [
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number VARCHAR(30) DEFAULT 'T-01';",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Normal';",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 320.00;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS category VARCHAR(40) DEFAULT 'Dinner';",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS diet_type VARCHAR(20) DEFAULT 'Veg';",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",
  ];

  for (const sql of migrations) {
    await pool.query(sql);
  }

  const countResult = await pool.query(
    "SELECT COUNT(*)::int AS total FROM orders"
  );
  const total = countResult.rows[0]?.total || 0;

  if (total === 0) {
    for (const item of INITIAL_ORDERS) {
      const meta = findMenuMetadata(item.food_item);
      await pool.query(
        `INSERT INTO orders (customer_name, food_item, quantity, status, table_number, priority, price, notes, category, diet_type, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          item.customer_name,
          item.food_item,
          item.quantity,
          item.status,
          item.table_number || "T-01",
          item.priority || "Normal",
          item.price || meta.price || 320,
          item.notes || "",
          item.category || meta.category || "Dinner",
          item.diet_type || meta.diet_type || "Veg",
          item.image_url || meta.image_url || "",
        ]
      );
    }
  } else {
    // Enrich existing database rows that don't yet have image_url, category, or INR price
    const existingRows = await pool.query("SELECT * FROM orders");
    for (const row of existingRows.rows) {
      if (!row.image_url || !row.category || Number(row.price) < 40) {
        const enriched = enrichOrderObject(row, row.id);
        await pool.query(
          `UPDATE orders
           SET price = $1, category = $2, diet_type = $3, image_url = $4
           WHERE id = $5`,
          [
            enriched.price,
            enriched.category,
            enriched.diet_type,
            enriched.image_url,
            row.id,
          ]
        );
      }
    }
  }
}

async function tryConnectPool(config) {
  const candidatePool = new Pool({
    ...config,
    connectionTimeoutMillis: 1500,
    idleTimeoutMillis: 10000,
  });

  candidatePool.on("error", (err) => {
    lastError = err.message;
  });

  const start = Date.now();
  await candidatePool.query("SELECT 1");
  lastPingMs = Date.now() - start;
  await ensureSchemaAndSeed(candidatePool);
  return candidatePool;
}

async function initDatabase() {
  const candidates = [
    {
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "restaurant_tracker",
      password: process.env.DB_PASSWORD || "Admin@1234",
      port: Number(process.env.DB_PORT) || 5432,
    },
    {
      user: "postgres",
      host: process.env.DB_HOST || "localhost",
      database: "restaurant_db",
      password: "postgres",
      port: Number(process.env.DB_PORT) || 5432,
    },
  ];

  for (const candidate of candidates) {
    try {
      const pool = await tryConnectPool(candidate);
      activePool = pool;
      isPostgresConnected = true;
      activeDbConfig = {
        host: candidate.host,
        port: candidate.port,
        database: candidate.database,
        user: candidate.user,
      };
      lastError = null;
      return true;
    } catch (err) {
      // If database "restaurant_tracker" does not exist yet on a running PostgreSQL server, auto-create it!
      if (err && err.code === "3D000") {
        try {
          const adminPool = new Pool({
            ...candidate,
            database: "postgres",
            connectionTimeoutMillis: 1500,
          });
          await adminPool.query(`CREATE DATABASE ${candidate.database}`);
          await adminPool.end();
          const pool = await tryConnectPool(candidate);
          activePool = pool;
          isPostgresConnected = true;
          activeDbConfig = {
            host: candidate.host,
            port: candidate.port,
            database: candidate.database,
            user: candidate.user,
          };
          lastError = null;
          return true;
        } catch (createErr) {
          lastError = createErr.message;
        }
      } else {
        lastError = err.message;
      }
    }
  }

  isPostgresConnected = false;
  return false;
}

async function findAllOrders() {
  const result = await query("SELECT * FROM orders ORDER BY id ASC");
  const normalized = result.rows.map(normalizeOrderRow);
  if (isPostgresConnected) {
    memoryOrders = normalized;
    savePersistentDiskStore();
  }
  return normalized;
}

async function findOrderById(id) {
  const numericId = Number(id);
  const result = await query("SELECT * FROM orders WHERE id = $1", [numericId]);
  return result.rows[0] ? normalizeOrderRow(result.rows[0]) : null;
}

async function insertOrder(orderData) {
  const meta = findMenuMetadata(orderData.food_item);
  const {
    customer_name,
    food_item,
    quantity,
    status = "Pending",
    table_number = "T-01",
    priority = "Normal",
    price = meta.price || 320,
    notes = "",
    category = meta.category || "Dinner",
    diet_type = meta.diet_type || "Veg",
    image_url = meta.image_url || "",
  } = orderData;

  const result = await query(
    `INSERT INTO orders (customer_name, food_item, quantity, status, table_number, priority, price, notes, category, diet_type, image_url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [
      customer_name,
      food_item,
      Number(quantity),
      status,
      table_number,
      priority,
      Number(price),
      notes,
      category,
      diet_type,
      image_url,
    ]
  );
  return normalizeOrderRow(result.rows[0]);
}

async function updateOrderById(id, updates) {
  const numericId = Number(id);
  const existing = await findOrderById(numericId);
  if (!existing) return null;

  const nextFood =
    updates.food_item !== undefined ? updates.food_item : existing.food_item;
  const meta = findMenuMetadata(nextFood);

  const nextCustomer =
    updates.customer_name !== undefined
      ? updates.customer_name
      : existing.customer_name;
  const nextQuantity =
    updates.quantity !== undefined
      ? Number(updates.quantity)
      : existing.quantity;
  const nextStatus =
    updates.status !== undefined ? updates.status : existing.status;
  const nextTable =
    updates.table_number !== undefined
      ? updates.table_number
      : existing.table_number;
  const nextPriority =
    updates.priority !== undefined ? updates.priority : existing.priority;
  const nextPrice =
    updates.price !== undefined ? Number(updates.price) : existing.price;
  const nextNotes =
    updates.notes !== undefined ? updates.notes : existing.notes;
  const nextCategory =
    updates.category !== undefined
      ? updates.category
      : updates.food_item
      ? meta.category
      : existing.category;
  const nextDiet =
    updates.diet_type !== undefined
      ? updates.diet_type
      : updates.food_item
      ? meta.diet_type
      : existing.diet_type;
  const nextImage =
    updates.image_url !== undefined
      ? updates.image_url
      : updates.food_item
      ? meta.image_url
      : existing.image_url;

  const result = await query(
    `UPDATE orders
     SET customer_name = $1,
         food_item = $2,
         quantity = $3,
         status = $4,
         table_number = $5,
         priority = $6,
         price = $7,
         notes = $8,
         category = $9,
         diet_type = $10,
         image_url = $11,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $12
     RETURNING *`,
    [
      nextCustomer,
      nextFood,
      nextQuantity,
      nextStatus,
      nextTable,
      nextPriority,
      nextPrice,
      nextNotes,
      nextCategory,
      nextDiet,
      nextImage,
      numericId,
    ]
  );

  return result.rows[0] ? normalizeOrderRow(result.rows[0]) : null;
}

async function deleteOrderById(id) {
  const numericId = Number(id);
  const result = await query(
    "DELETE FROM orders WHERE id = $1 RETURNING *",
    [numericId]
  );
  return result.rows[0] ? normalizeOrderRow(result.rows[0]) : null;
}

async function resetAndSeedOrders() {
  if (isPostgresConnected && activePool) {
    try {
      await activePool.query("TRUNCATE TABLE orders RESTART IDENTITY");
      const inserted = [];
      for (const item of INITIAL_ORDERS) {
        const meta = findMenuMetadata(item.food_item);
        const res = await activePool.query(
          `INSERT INTO orders (customer_name, food_item, quantity, status, table_number, priority, price, notes, category, diet_type, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [
            item.customer_name,
            item.food_item,
            item.quantity,
            item.status,
            item.table_number || "T-01",
            item.priority || "Normal",
            item.price || meta.price || 320,
            item.notes || "",
            item.category || meta.category || "Dinner",
            item.diet_type || meta.diet_type || "Veg",
            item.image_url || meta.image_url || "",
          ]
        );
        inserted.push(normalizeOrderRow(res.rows[0]));
      }
      memoryOrders = inserted;
      savePersistentDiskStore();
      return inserted;
    } catch (err) {
      lastError = err.message;
      isPostgresConnected = false;
    }
  }

  seedMemoryStore();
  return [...memoryOrders];
}

function getDbDiagnostics() {
  return {
    engine: "PostgreSQL",
    connected: isPostgresConnected,
    mode: isPostgresConnected
      ? `PostgreSQL Live (${activeDbConfig.database})`
      : "Persistent Disk + In-Memory Relational Store (Zero-Dependency Fallback)",
    host: `${activeDbConfig.host}:${activeDbConfig.port}`,
    database: activeDbConfig.database,
    latencyMs: lastPingMs,
    queryCount,
    activeRecords: memoryOrders.length,
    persistentFile: PERSISTENT_STORE_FILE,
    lastError: isPostgresConnected ? null : lastError,
  };
}

module.exports = {
  query,
  initDatabase,
  findAllOrders,
  findOrderById,
  insertOrder,
  updateOrderById,
  deleteOrderById,
  resetAndSeedOrders,
  getDbDiagnostics,
};
