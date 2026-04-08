const router = require('express').Router();
const Favorite = require('../models/Favorite');
const auth = require('../middleware/auth');

// Get all favorites for user
router.get('/', auth, async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.user.id });
    res.json(favs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add favorite
router.post('/', auth, async (req, res) => {
  try {
    const { city, threshold } = req.body;
    const fav = await Favorite.findOneAndUpdate(
      { userId: req.user.id, city },
      { userId: req.user.id, city, threshold: threshold || 150 },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(fav);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update threshold
router.put('/:id', auth, async (req, res) => {
  try {
    const fav = await Favorite.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { threshold: req.body.threshold },
      { new: true }
    );
    res.json(fav);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove favorite
router.delete('/:id', auth, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
