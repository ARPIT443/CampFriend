const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/campfriend', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}, 
(err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});

    for(let i=0;i<50;i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/483251",
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nobis obcaecati recusandae esse placeat doloribus quaerat eveniet similique deserunt unde autem iure, at enim porro veritatis voluptate dolorum voluptas quam nisi.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});