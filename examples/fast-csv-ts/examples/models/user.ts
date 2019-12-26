export type UserCallback = (err: Error | null, user?: User) => void;

export class User {
    public readonly id: number;

    public readonly isVerified: boolean;

    public readonly hasLoggedIn: boolean;

    public readonly age: number;

    static findById(id: number, cb: UserCallback): void {
        setImmediate(() => {
            cb(null, new User(id));
        });
    }

    constructor(id: number) {
        this.id = id;
        this.isVerified = id % 2 === 0;
        this.hasLoggedIn = this.isVerified ? id % 4 === 0 : false;
        this.age = +id + 10;
    }
}
