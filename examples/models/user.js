class User {
    static findById(id, cb) {
        setImmediate(() => {
            cb(null, new User(id));
        });
    }

    constructor(id) {
        this.id = id;
        this.isVerified = (id % 2) === 0;
        this.hasLoggedIn = this.isVerified ? (id % 4) === 0 : false;
        this.age = +(id) + 10;
    }
}

module.exports = User;
