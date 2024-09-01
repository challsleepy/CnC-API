const router = require('express').Router();
const XPUser = require('../schemas/xpUser');

router.get('/ranking', async (req, res) => {
    const users = await XPUser.find({ _id: { $ne: 'config' } }).sort({ current_level: -1, current_xp: -1 });
    return res.json(users);
})

module.exports = router;