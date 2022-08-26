
const User = require('../models/user');

module.exports.createUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.flash('success', "Welcome to Yelp Camp");
        req.login(registerUser, err => {
            if (err) return next(err);
        })
        res.redirect('/campgrounds');
    } catch (e) {
        if (JSON.stringify(e.keyPattern) === '{"email":1}') {
            console.dirxml(e)
            req.flash('error', "Email already registered");
            res.redirect('register');
        }
        else {
            console.log(typeof (String(e.keyPattern)), JSON.stringify(e.keyPattern))
            req.flash('error', e.message);
            res.redirect('register');
        }
    }
}

module.exports.loginUser = (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success', "Welcome Back")
    return res.redirect(`${redirectUrl}`);
}

module.exports.logoutUser = async (req, res, next) => {
    req.logout((err) => {
        if (err)
            return next(err);
    });
    req.flash('success', 'Logged Out');
    res.redirect('campgrounds');
}

module.exports.renderLogin = async (req, res) => {
    res.render('users/login');
}


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}