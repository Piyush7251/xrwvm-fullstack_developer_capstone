const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

const reviews_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'reviews.json'), 'utf8')
);
const dealerships_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'dealerships.json'), 'utf8')
);

let Reviews = null;
let Dealerships = null;
let useInMemory = false;
let memoryReviews = [...reviews_data['reviews']];
const memoryDealerships = [...dealerships_data['dealerships']];

const mongoUri = process.env.MONGO_URI || 'mongodb://mongo_db:27017/';
mongoose
  .connect(mongoUri, { dbName: 'dealershipsDB', serverSelectionTimeoutMS: 2000 })
  .then(async () => {
    Reviews = require('./review');
    Dealerships = require('./dealership');
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data['reviews']);
    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data['dealerships']);
    console.log('Connected to MongoDB and seeded data');
  })
  .catch(() => {
    useInMemory = true;
    console.log('MongoDB unavailable; serving from in-memory JSON store');
  });

app.get('/', async (req, res) => {
  res.send('Welcome to the Mongoose API');
});

app.get('/fetchReviews', async (req, res) => {
  try {
    if (useInMemory || !Reviews) {
      return res.json(memoryReviews);
    }
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);
    if (useInMemory || !Reviews) {
      return res.json(memoryReviews.filter((r) => Number(r.dealership) === idNum));
    }
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealers', async (req, res) => {
  try {
    if (useInMemory || !Dealerships) {
      return res.json(memoryDealerships);
    }
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    if (useInMemory || !Dealerships) {
      return res.json(
        memoryDealerships.filter(
          (d) => d.state.toLowerCase() === req.params.state.toLowerCase()
        )
      );
    }
    const documents = await Dealerships.find({ state: req.params.state });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships by state' });
  }
});

app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);
    if (useInMemory || !Dealerships) {
      return res.json(memoryDealerships.filter((d) => Number(d.id) === idNum));
    }
    const documents = await Dealerships.find({ id: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealership by id' });
  }
});

app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  const data = JSON.parse(req.body);
  if (useInMemory || !Reviews) {
    const maxId = memoryReviews.reduce((max, r) => Math.max(max, r.id || 0), 0);
    const newReview = {
      id: maxId + 1,
      name: data['name'],
      dealership: Number(data['dealership']),
      review: data['review'],
      purchase: data['purchase'],
      purchase_date: data['purchase_date'],
      car_make: data['car_make'],
      car_model: data['car_model'],
      car_year: data['car_year'],
    };
    memoryReviews.push(newReview);
    return res.json(newReview);
  }

  const documents = await Reviews.find().sort({ id: -1 });
  const new_id = documents[0]['id'] + 1;
  const review = new Reviews({
    id: new_id,
    name: data['name'],
    dealership: data['dealership'],
    review: data['review'],
    purchase: data['purchase'],
    purchase_date: data['purchase_date'],
    car_make: data['car_make'],
    car_model: data['car_model'],
    car_year: data['car_year'],
  });

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
