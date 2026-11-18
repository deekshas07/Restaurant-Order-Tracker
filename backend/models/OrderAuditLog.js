const mongoose = require("mongoose");

const OrderAuditLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "ORDER_CREATED",
        "STATUS_TRANSITION",
        "ORDER_UPDATED",
        "ORDER_DELETED",
        "DATASET_SEEDED",
      ],
      required: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      default: null,
    },
    customerName: {
      type: String,
      default: "",
    },
    foodItem: {
      type: String,
      default: "",
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.OrderAuditLog ||
  mongoose.model("OrderAuditLog", OrderAuditLogSchema);

