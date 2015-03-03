function User(id) {
    this.id = id;
    this.isVerified = (id % 2) === 0;
    this.hasLoggedIn = this.isVerified ? (id % 4) === 0 : false;
    this.age = +(id) + 10;
}

User.findById = function (id, cb) {
    setImmediate(function () {
        cb(void 0, new User(id));
    });
};

module.exports = User;