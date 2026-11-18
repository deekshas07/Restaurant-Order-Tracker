const http = require("http");
const assert = require("assert");
const { app, initializeServices } = require("../server");

const PIPE_PATH =
  process.platform === "win32"
    ? `\\\\.\\pipe\\rot-qa-suite-${process.pid}-${Date.now()}`
    : `/tmp/rot-qa-suite-${process.pid}-${Date.now()}.sock`;

function makeRequest(method, path, body = null, rawBody = null) {
  return new Promise((resolve, reject) => {
    const payload =
      rawBody !== null
        ? rawBody
        : body !== null
        ? JSON.stringify(body)
        : null;

    const options = {
      socketPath: PIPE_PATH,
      path,
      method,
      headers: {
        Accept: "application/json",
      },
    };

    if (payload !== null) {
      options.headers["Content-Type"] = "application/json";
      options.headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(raw);
        } catch (e) {
          json = raw;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on("error", reject);
    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

async function runQaTestSuite() {
  console.log("=========================================================");
  console.log("  RESTAURANT ORDER TRACKER - AUTOMATED QA API TEST SUITE ");
  console.log("=========================================================\n");

  await initializeServices();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(PIPE_PATH, resolve));

  let passed = 0;
  let failed = 0;

  async function testCase(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const ms = Date.now() - start;
      console.log(`  [PASS] ${name} (${ms}ms)`);
      passed += 1;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         -> ${err.message}`);
      failed += 1;
    }
  }

  let createdOrderId = null;

  await testCase("1. GET /api/health returns 200 OK with DB, Mongo, & Redis diagnostics", async () => {
    const res = await makeRequest("GET", "/api/health");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, "healthy");
    assert.ok(res.body.connections.postgresql);
    assert.ok(res.body.connections.mongodb);
    assert.ok(res.body.connections.redis);
    assert.ok(res.headers["x-response-time"]);
  });

  await testCase("2. POST /api/orders/seed resets & seeds 9 sample orders (201 Created)", async () => {
    const res = await makeRequest("POST", "/api/orders/seed");
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.count, 9);
    assert.strictEqual(res.headers["x-cache"], "INVALIDATED");
  });

  await testCase("3. GET /api/orders (1st request) fetches from DB & populates Redis cache (X-Cache: MISS)", async () => {
    const res = await makeRequest("GET", "/api/orders");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["x-cache"], "MISS");
    assert.strictEqual(Array.isArray(res.body), true);
    assert.strictEqual(res.body.length, 9);
  });

  await testCase("4. GET /api/orders (2nd request) serves from Redis cache (X-Cache: HIT)", async () => {
    const res = await makeRequest("GET", "/api/orders");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["x-cache"], "HIT");
    assert.strictEqual(res.body.length, 9);
  });

  await testCase("5. POST /api/orders creates a new order in 'Pending' state & invalidates cache (201 Created)", async () => {
    const res = await makeRequest("POST", "/api/orders", {
      customer_name: "Deeksha QA Tester",
      food_item: "Gourmet Avocado Toast",
      quantity: 2,
      table_number: "T-15",
      priority: "High",
      price: 17.5,
      notes: "Automated QA test order",
    });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.headers["x-cache"], "INVALIDATED");
    assert.strictEqual(res.body.customer_name, "Deeksha QA Tester");
    assert.strictEqual(res.body.status, "Pending");
    assert.strictEqual(res.body.quantity, 2);
    createdOrderId = res.body.id;
  });

  await testCase("6. GET /api/orders after mutation triggers fresh fetch (X-Cache: MISS)", async () => {
    const res = await makeRequest("GET", "/api/orders");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["x-cache"], "MISS");
    assert.strictEqual(res.body.length, 10);
  });

  await testCase("7. GET /api/orders/:id returns specific order details (200 OK)", async () => {
    const res = await makeRequest("GET", `/api/orders/${createdOrderId}`);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.id, createdOrderId);
    assert.strictEqual(res.body.customer_name, "Deeksha QA Tester");
  });

  await testCase("8. PUT /api/orders/:id transitions Pending -> Preparing (200 OK)", async () => {
    const res = await makeRequest("PUT", `/api/orders/${createdOrderId}`, {
      status: "Preparing",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, "Preparing");
  });

  await testCase("9. PUT /api/orders/:id transitions Preparing -> Ready (200 OK)", async () => {
    const res = await makeRequest("PUT", `/api/orders/${createdOrderId}`, {
      status: "Ready",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, "Ready");
  });

  await testCase("10. PUT /api/orders/:id transitions Ready -> Completed (200 OK)", async () => {
    const res = await makeRequest("PUT", `/api/orders/${createdOrderId}`, {
      status: "Completed",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, "Completed");
  });

  await testCase("11. [Negative QA] PUT /api/orders/:id blocks invalid transition Completed -> Preparing (400 Bad Request)", async () => {
    const res = await makeRequest("PUT", `/api/orders/${createdOrderId}`, {
      status: "Preparing",
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error, "Bad Request");
    assert.ok(res.body.message.includes("Invalid status transition"));
  });

  await testCase("12. [Negative QA] POST /api/orders rejects missing/invalid fields (400 Bad Request)", async () => {
    const res = await makeRequest("POST", "/api/orders", {
      customer_name: "",
      food_item: "Pizza",
      quantity: 0,
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error, "Bad Request");
    assert.ok(Array.isArray(res.body.details));
    assert.ok(res.body.details.length >= 2);
  });

  await testCase("13. [Negative QA] GET /api/orders/invalid-id rejects non-numeric ID (400 Bad Request)", async () => {
    const res = await makeRequest("GET", "/api/orders/invalid-id");
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error, "Bad Request");
  });

  await testCase("14. [Negative QA] PUT /api/orders/999999 returns 404 Not Found for non-existent order", async () => {
    const res = await makeRequest("PUT", "/api/orders/999999", {
      status: "Ready",
    });
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.error, "Not Found");
  });

  await testCase("15. [Negative QA] POST /api/orders with malformed JSON returns 400 Bad Request", async () => {
    const res = await makeRequest("POST", "/api/orders", null, "{ invalid_json: ");
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error, "Bad Request");
  });

  await testCase("16. DELETE /api/orders/:id deletes order (200 OK) & subsequent GET returns 404 Not Found", async () => {
    const delRes = await makeRequest("DELETE", `/api/orders/${createdOrderId}`);
    assert.strictEqual(delRes.statusCode, 200);
    assert.strictEqual(delRes.body.deletedOrder.id, createdOrderId);

    const getRes = await makeRequest("GET", `/api/orders/${createdOrderId}`);
    assert.strictEqual(getRes.statusCode, 404);
  });

  await testCase("17. GET /api/qa/audit-logs returns recorded state transitions from MongoDB/Audit layer", async () => {
    const res = await makeRequest("GET", "/api/qa/audit-logs");
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.logs));
    assert.ok(res.body.logs.length >= 5);
  });

  await testCase("18. POST /api/qa/cache/flush manually clears Redis cache (200 OK)", async () => {
    const res = await makeRequest("POST", "/api/qa/cache/flush");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["x-cache"], "INVALIDATED");
  });

  await new Promise((resolve) => server.close(resolve));

  console.log("\n=========================================================");
  console.log(`  QA TEST SUMMARY: ${passed} Passed | ${failed} Failed`);
  console.log("=========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runQaTestSuite().catch((err) => {
  console.error("Fatal QA Test Suite Error:", err);
  process.exit(1);
});

