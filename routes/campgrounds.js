const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const { index, newCampground, makeNewCampground, displayCamp, editFormCampground, deleteCampground, editCampground } = require('../controllers/campgrounds')
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage })


router.get('/', catchAsync(index));



// Adding a new Campground 

router.get('/new', isLoggedIn, newCampground)

router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(makeNewCampground));


// Details of a particular Camp 

router.get('/:id', catchAsync(displayCamp))

// Editing a campground 

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(editFormCampground));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(editCampground));

// Deleting a Campground

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(deleteCampground))

module.exports = router;                                                                                                