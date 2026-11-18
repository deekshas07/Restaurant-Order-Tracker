const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  seedOrders,
} = require("../controllers/orderController");
const {
  validateOrderId,
  validateCreateOrder,
  validateUpdateOrder,
} = require("../middleware/validateOrder");
const { MENU_CATALOG } = require("../utils/seedData");

// GET all orders (supports optional ?status=... & ?search=... query filters)
router.get("/", getAllOrders);

// GET full 56-dish culinary catalog with images & INR prices
router.get("/menu", (req, res) => {
  res.setHeader("X-Cache", "HIT");
  return res.status(200).json({
    count: MENU_CATALOG.length,
    currency: "INR",
    items: MENU_CATALOG,
  });
});

// POST reset & seed demo dataset for QA demonstrations
router.post("/seed", seedOrders);

// GET a single order by ID
router.get("/:id", validateOrderId, getOrderById);

// POST create a new order
router.post("/", validateCreateOrder, createOrder);

// PUT update order status or details
router.put("/:id", validateOrderId, validateUpdateOrder, updateOrder);

// PATCH alias for status / partial updates
router.patch("/:id", validateOrderId, validateUpdateOrder, updateOrder);

// DELETE an order by ID
router.delete("/:id", validateOrderId, deleteOrder);

module.exports = router;
