class Message {
    constructor(id, after, on, author, body) {
        this.id = id;
        this.after = after;
        this.on = on;
        this.author = author;
        this.body = body;
    }
}

class User {
    constructor(id, login, pwdhash, name) {
        this.id = id;
        this.login = login;
        this.pwdhash = pwdhash;
        this.name = name;
    }
}

export { User, Message };
