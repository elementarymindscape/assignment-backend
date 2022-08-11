require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

var corsOptions = {
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to db'));

function getYoutubeVideoIdFromURL(url) {
  let result;
  let rx =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  result = url.match(rx);
  return result[1];
}

const Card = require('./Models/CardModel');
const History = require('./Models/HistoryModel');

const cards = db.collection('cards');
const history = db.collection('histories');

app.get('/cards', async (req, res) => {
  try {
    const allCards = await Card.find({});
    res.send({ cards: allCards });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get('/cards/types', async (req, res) => {
  try {
    const types = await Card.distinct('card_bucket_type');
    res.send({ types: types });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/cards/new', async (req, res) => {
  let video_link = getYoutubeVideoIdFromURL(req.body.card_video_link);
  const card = new Card({
    card_title: req.body.card_title,
    card_video_link: video_link,
    card_bucket_type: req.body.card_bucket_type,
  });
  try {
    const newCard = await card.save();
    res
      .status(201)
      .send({ card: newCard, message: 'Card Added Successfully!' });
  } catch (err) {
    res.send({ message: 'Failed to add card' });
  }
});

app.patch('/edit/bucketname', async (req, res) => {
  try {
    const oldBucketName = req.body.old_bucket_name;
    const newBucketName = req.body.new_bucket_name;
    console.table({ oldBucketName, newBucketName });
    await Card.updateMany(
      { card_bucket_type: oldBucketName },
      { $set: { card_bucket_type: newBucketName } }
    );
    res.send({ message: 'Bucket Name Updated Successfully!' });
  } catch (err) {
    res.send({ message: err.message });
  }
});

app.patch('/cards/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const newCardName = req.body.card_title;
    const newCardVideoLink = req.body.card_video_link;
    console.table({ id, newCardName, newCardVideoLink });
    await cards.updateOne(
      { _id: ObjectId(`${id}`) },
      { $set: { card_title: newCardName, card_video_link: newCardVideoLink } }
    );
    res.send({ message: 'Card Updated Successfully!' });
  } catch (err) {
    res.send({ message: 'Failed to update card' });
  }
});

app.patch('/cards/move/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const moveToBucket = req.body.bucket_name;
    console.table({ id, moveToBucket });
    await cards.updateOne(
      { _id: ObjectId(`${id}`) },
      { $set: { card_bucket_type: moveToBucket } }
    );
    res.send({ message: `Card Moved to ${moveToBucket} Successfully!` });
  } catch (err) {
    res.send({ message: 'Failed to move card' });
  }
});

app.delete('/cards/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await cards.deleteOne({ _id: ObjectId(`${id}`) });
    res.send({ message: 'Deleted Card Succesfully!' });
  } catch (err) {
    res.send({ message: 'Failed to delete card' });
  }
});

app.delete('/bucket/delete/:bucketname', async (req, res) => {
  try {
    const bucketname = req.params.bucketname;
    await cards.deleteMany({ card_bucket_type: ObjectId(`${bucketname}`) });
    res.send({ message: 'Deleted Card Succesfully!' });
  } catch (err) {
    res.send({ message: 'Failed to delete card' });
  }
});

app.get('/history', async (req, res) => {
  try {
    const history = await History.find();
    res.send({ cards: history });
  } catch (err) {
    res.send({ message: err.message });
  }
});

app.post('/history/create', async (req, res) => {
  const history = new History({
    card_title: req.body.card_title,
    card_video_link: req.body.card_video_link,
    played_at: req.body.played_at,
    id: req.body.id,
  });
  try {
    const card_title = req.body.card_title;
    let found = await History.findOne({ card_title: card_title });
    console.log('found', found);
    if (found) {
      await History.updateOne(
        { _id: ObjectId(`${id}`) },
        { $set: { played_at: new Date() } }
      );
      return;
    } else {
      await history.save();
      res.send({ message: 'Added to history' });
    }
  } catch (err) {
    res.send({ message: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`server started.`);
});
