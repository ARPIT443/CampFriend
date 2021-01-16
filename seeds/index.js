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

    for(let i=0;i<200;i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '5ffea09d2d0697101ce359a5',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nobis obcaecati recusandae esse placeat doloribus quaerat eveniet similique deserunt unde autem iure, at enim porro veritatis voluptate dolorum voluptas quam nisi.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude]
            },
            images: [
                {   
                    url: 'https://res.cloudinary.com/dbjpkdsfj/image/upload/v1610782966/Camp-Friend/ie4oj8nl8jddytsqu0zz.jpg',
                    filename: 'Camp-Friend/o4n4lmxmnifatqjpq75y'
                },
                {
                    url: 'https://res.cloudinary.com/dbjpkdsfj/image/upload/v1610701239/Camp-Friend/if1yj4xskqhv4m4onmkb.jpg',
                    filename: 'Camp-Friend/if1yj4xskqhv4m4onmkb'
                }
              ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});