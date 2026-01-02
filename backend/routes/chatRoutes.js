const express = require('express');
const router = express.Router();
const { chatWithDocs, getHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, chatWithDocs);
router.get('/history', protect, getHistory);

module.exports = router;
