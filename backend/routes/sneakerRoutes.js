const express = require('express');
const { getAllSneakers, getSneakerById, createSneaker, updateStock, deleteSneaker, deleteVariant, addVariantToColorway, updateSneaker } = require('../controllers/sneakerController');
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');
const { route } = require('./cartRoutes');
const router = express.Router();

router.get("/", getAllSneakers);
router.post("/", verifyToken, requireAdmin, createSneaker);
router.get("/:id", getSneakerById);
router.put("/:id", verifyToken, requireAdmin, updateSneaker);
router.delete("/:id", verifyToken, requireAdmin, deleteSneaker);
router.patch("/variants/:variantId", verifyToken, requireAdmin, updateStock);
router.delete("/variants/:variantId", verifyToken, requireAdmin, deleteVariant);
router.post("/:id/variants", verifyToken, requireAdmin, addVariantToColorway);

module.exports = router;