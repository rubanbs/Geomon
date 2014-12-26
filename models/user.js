var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    email: String,
    password: String,
    name: String,
    lon: { type: Number, default: 38.9814 },
    lat: { type: Number, default: 45.0537 },
    update: { type: Date, default: Date.now },
    updateInterval: { type: Number, default: 30 },
    track: { type: [{ lon: { type: Number }, lat: { type: Number }, update: { type: Date } }] },
    iconType: { type: String, default: '' },
    color: { type: String, default: '#dd4814' }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);