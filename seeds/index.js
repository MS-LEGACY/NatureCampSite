const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log("Database Connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)]
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: "630474344ef3a8b803834c46",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dgfuwjgtd/image/upload/v1661361729/YelpCamp/cwo4mbdg87xd8hqy0ilr.jpg',
                    filename: 'YelpCamp/cwo4mbdg87xd8hqy0ilr'
                }
            ],
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]

            },
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.Modi quod eligendi consectetur reprehenderit perferendis aut nam odit ipsam consequatur, aliquid atque id.Maiores, odit aliquid tempore fugiat quod rerum neque?',
            price: Math.floor(Math.random() * 20) + 10
        })
        await camp.save();
    }
}

seedDB()
    .then((res) => {
        mongoose.connection.close();
        // console.log(res);
    })
