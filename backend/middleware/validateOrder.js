const { findMenuMetadata } = require("../utils/seedData");

const VALID_STATUSES = [
  "Pending",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

const VALID_PRIORITIES = ["Low", "Normal", "High"];

const ALLOWED_TRANSITIONS = {
  Pending: ["Preparing", "Cancelled"],
  Preparing: ["Ready", "Cancelled"],
  Ready: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

function validateOrderId(req, res, next) {
  const { id } = req.params;
  const parsed = Number(id);

  if (
    !id ||
    !/^[1-9]\d*$/.test(String(id).trim()) ||
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return res.status(400).json({
      error: "Bad Request",
      statusCode: 400,
      message: `Invalid order ID '${id}'. Order ID must be a positive integer.`,
      details: [
        `Parameter 'id' received '${id}', expected a positive integer (e.g., 1, 2, 3).`,
      ],
      timestamp: new Date().toISOString(),
    });
  }

  req.orderId = parsed;
  next();
}

function validateCreateOrder(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      error: "Bad Request",
      statusCode: 400,
      message: "Request payload must be a valid JSON object.",
      details: [
        "Expected JSON object with customer_name, food_item, and quantity.",
      ],
      timestamp: new Date().toISOString(),
    });
  }

  const errors = [];
  const {
    customer_name,
    food_item,
    quantity,
    status,
    table_number,
    priority,
    price,
    notes,
    category,
    diet_type,
    image_url,
  } = body;

  if (
    customer_name === undefined ||
    customer_name === null ||
    typeof customer_name !== "string" ||
    customer_name.trim().length === 0
  ) {
    errors.push(
      "Customer name ('customer_name') is required and cannot be empty."
    );
  } else if (
    customer_name.trim().length < 2 ||
    customer_name.trim().length > 100
  ) {
    errors.push(
      "Customer name ('customer_name') must be between 2 and 100 characters."
    );
  }

  if (
    food_item === undefined ||
    food_item === null ||
    typeof food_item !== "string" ||
    food_item.trim().length === 0
  ) {
    errors.push("Food item ('food_item') is required and cannot be empty.");
  } else if (food_item.trim().length < 2 || food_item.trim().length > 150) {
    errors.push(
      "Food item ('food_item') must be between 2 and 150 characters."
    );
  }

  const numericQty = Number(quantity);
  if (
    quantity === undefined ||
    quantity === null ||
    quantity === "" ||
    Number.isNaN(numericQty) ||
    !Number.isInteger(numericQty)
  ) {
    errors.push(
      "Quantity ('quantity') is required and must be a valid integer."
    );
  } else if (numericQty < 1 || numericQty > 100) {
    errors.push("Quantity ('quantity') must be between 1 and 100.");
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(
      `Invalid status '${status}'. Allowed statuses: ${VALID_STATUSES.join(
        ", "
      )}.`
    );
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(
      `Invalid priority '${priority}'. Allowed priorities: ${VALID_PRIORITIES.join(
        ", "
      )}.`
    );
  }

  if (price !== undefined && price !== null && price !== "") {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0 || numericPrice > 100000) {
      errors.push("Price ('price') must be a number between ₹0 and ₹100,000.");
    }
  }

  if (
    table_number !== undefined &&
    (typeof table_number !== "string" || table_number.trim().length > 30)
  ) {
    errors.push(
      "Table number ('table_number') must be a string up to 30 characters."
    );
  }

  if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
    errors.push("Order notes ('notes') must be a string up to 500 characters.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Bad Request",
      statusCode: 400,
      message: errors[0],
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  const trimmedFood = food_item.trim();
  const meta = findMenuMetadata(trimmedFood);

  req.validatedOrder = {
    customer_name: customer_name.trim(),
    food_item: trimmedFood,
    quantity: numericQty,
    status: status || "Pending",
    table_number:
      table_number && table_number.trim() ? table_number.trim() : "T-01",
    priority: priority || meta.priority || "Normal",
    price:
      price !== undefined && price !== null && price !== ""
        ? Number(Number(price).toFixed(2))
        : meta.price || 320,
    notes: notes ? notes.trim() : "",
    category: category || meta.category || "Dinner",
    diet_type: diet_type || meta.diet_type || "Veg",
    image_url: image_url || meta.image_url || "",
  };

  next();
}

function validateUpdateOrder(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      error: "Bad Request",
      statusCode: 400,
      message: "Request payload must be a valid JSON object.",
      details: ["Expected JSON object with status or order fields to update."],
      timestamp: new Date().toISOString(),
    });
  }

  const allowedKeys = [
    "status",
    "customer_name",
    "food_item",
    "quantity",
    "table_number",
    "priority",
    "price",
    "notes",
    "category",
    "diet_type",
    "image_url",
  ];
  const providedKeys = Object.keys(body).filter((k) =>
    allowedKeys.includes(k)
  );

  if (providedKeys.length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      statusCode: 400,
      message:
        "At least one valid field (e.g. 'status', 'customer_name', 'food_item', 'quantity') must be provided for update.",
      details: [`Allowed fields: ${allowedKeys.join(", ")}`],
      timestamp: new Date().toISOString(),
    });
  }

  const errors = [];
  const updates = {};

  if (body.status !== undefined) {
    if (
      typeof body.status !== "string" ||
      !VALID_STATUSES.includes(body.status)
    ) {
      errors.push(
        `Invalid status '${body.status}'. Must be one of: ${VALID_STATUSES.join(
          ", "
        )}.`
      );
    } else {
      updates.status = body.status;
    }
  }

  if (body.customer_name !== undefined) {
    if (
      typeof body.customer_name !== "string" ||
      body.customer_name.trim().length < 2 ||
      body.customer_name.trim().length > 100
    ) {
      errors.push(
        "Customer name ('customer_name') must be a string between 2 and 100 characters."
      );
    } else {
      updates.customer_name = body.customer_name.trim();
    }
  }

  if (body.food_item !== undefined) {
    if (
      typeof body.food_item !== "string" ||
      body.food_item.trim().length < 2 ||
      body.food_item.trim().length > 150
    ) {
      errors.push(
        "Food item ('food_item') must be a string between 2 and 150 characters."
      );
    } else {
      updates.food_item = body.food_item.trim();
    }
  }

  if (body.quantity !== undefined) {
    const numericQty = Number(body.quantity);
    if (
      body.quantity === "" ||
      body.quantity === null ||
      Number.isNaN(numericQty) ||
      !Number.isInteger(numericQty) ||
      numericQty < 1 ||
      numericQty > 100
    ) {
      errors.push("Quantity ('quantity') must be an integer between 1 and 100.");
    } else {
      updates.quantity = numericQty;
    }
  }

  if (body.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(body.priority)) {
      errors.push(
        `Invalid priority '${
          body.priority
        }'. Allowed priorities: ${VALID_PRIORITIES.join(", ")}.`
      );
    } else {
      updates.priority = body.priority;
    }
  }

  if (body.price !== undefined) {
    const numericPrice = Number(body.price);
    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0 ||
      numericPrice > 100000
    ) {
      errors.push(
        "Price ('price') must be a valid number between ₹0 and ₹100,000."
      );
    } else {
      updates.price = Number(numericPrice.toFixed(2));
    }
  }

  if (body.table_number !== undefined) {
    if (
      typeof body.table_number !== "string" ||
      body.table_number.trim().length === 0 ||
      body.table_number.trim().length > 30
    ) {
      errors.push(
        "Table number ('table_number') must be a non-empty string up to 30 characters."
      );
    } else {
      updates.table_number = body.table_number.trim();
    }
  }

  if (body.notes !== undefined) {
    if (typeof body.notes !== "string" || body.notes.length > 500) {
      errors.push("Order notes ('notes') must be a string up to 500 characters.");
    } else {
      updates.notes = body.notes.trim();
    }
  }

  if (body.category !== undefined && typeof body.category === "string") {
    updates.category = body.category.trim();
  }
  if (body.diet_type !== undefined && typeof body.diet_type === "string") {
    updates.diet_type = body.diet_type.trim();
  }
  if (body.image_url !== undefined && typeof body.image_url === "string") {
    updates.image_url = body.image_url.trim();
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Bad Request",
      statusCode: 400,
      message: errors[0],
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  req.validatedUpdates = updates;
  next();
}

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  ALLOWED_TRANSITIONS,
  validateOrderId,
  validateCreateOrder,
  validateUpdateOrder,
};
