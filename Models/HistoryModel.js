const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  card_title: {
    type: String,
    required: true,
  },
  card_video_link: {
    type: String,
    required: true,
  },
  played_at: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('History', HistorySchema);
