const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAll, getOne, setSetting, deleteSetting } = require('../controllers/siteSettingsController');

router.get('/', getAll);
router.get('/:key', getOne);
router.post('/', authenticate, requireAdmin, setSetting);
router.delete('/:key', authenticate, requireAdmin, deleteSetting);

module.exports = router;
