const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const Geocoder = require('../@maptiler-improved/geocoder');
const geocoder = new Geocoder({
    key: process.env.MAPTILER_GEOCODER
});
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.newCampground = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.makeNewCampground = async (req, res, next) => {
    let geoData = await geocoder.geocode(req.body.campground.location);
    const campground = new Campground(req.body.campground);
    if (geoData.features[0].geometry.geometries) {
        geoData.features[0].geometry.type = 'Point'
        if (Array.isArray(geoData.features[0].geometry.geometries[0].coordinates[0])) {
            geoData.features[0].geometry.coordinates = geoData.features[0].geometry.geometries[0].coordinates[0];
        }
        else {
            geoData.features[0].geometry.coordinates = geoData.features[0].geometry.geometries[0].coordinates;
        }

    }
    else if (Array.isArray(geoData.features[0].geometry.coordinates[0])) {
        geoData.features[0].geometry.type = 'Point'
        geoData.features[0].geometry.coordinates = geoData.features[0].geometry.coordinates[0];
    }
    campground.geometry = geoData.features[0].geometry;
    console.log(campground.geometry);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfuly created a campground');
    res.redirect(`campgrounds/${campground._id}`);
}

module.exports.displayCamp = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate
        ({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    if (!campground) {
        req.flash('error', 'Unable to find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}

module.exports.editFormCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Unable to find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.editCampground = async (req, res, next) => {

    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }, { runValidators: true, new: true });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...images);
    let geoData = await geocoder.geocode(req.body.campground.location);
    if (Array.isArray(geoData.features[0].geometry.coordinates[0])) {
        geoData.features[0].geometry.type = 'Point'
        geoData.features[0].geometry.coordinates = geoData.features[0].geometry.coordinates[0];
    }
    campground.geometry = geoData.features[0].geometry;
    await campground.save();
    if (req.body.deleteImages) {
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
    }
    req.flash('success', 'Updated Campground');
    res.redirect(`/campgrounds/${campground._id}`);


}

module.exports.deleteCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    for (let image of campground.images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    campground.delete();
    // console.log('Deleted Records');
    res.redirect('/campgrounds');
}