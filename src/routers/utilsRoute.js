const router = require("express").Router();
const utilsController = require("../controllers/utilsController");
const { validateToken } = require("../utils/JWT");

router.post("/upload", utilsController.uploadCSV);
router.post("/export", utilsController.exportPDF);

module.exports = router;
