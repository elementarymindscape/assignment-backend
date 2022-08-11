const mongoose = require('mongoose');

const CardsSchema = new mongoose.Schema({
  card_title: {
    type: String,
    required: true,
  },
  card_video_link: {
    type: String,
    required: true,
  },
  card_bucket_type: {
    type: String,
    required: true,
  },
});

const BucketSchema = new mongoose.Schema({
  card_bucket_type: {
    type: String,
    required: true,
  },
  card_title: {
    type: String,
    required: false,
  },
  card_video_link: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Cards', CardsSchema, 'cards');
module.exports = mongoose.model('Buckets', BucketSchema, 'cards');
