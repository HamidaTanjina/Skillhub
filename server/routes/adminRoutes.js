
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

// Every route requires authentication and the admin role.
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", adminController.getAllUsers);
router.patch("/users/:userId/ban", adminController.banUser);
router.patch("/users/:userId/unban", adminController.unbanUser);

router.get("/swaps", adminController.getAllSwaps);
router.patch("/swaps/:swapId/status", adminController.updateSwapStatus);

router.get("/stats", adminController.getAdminStats);

module.exports = router;
