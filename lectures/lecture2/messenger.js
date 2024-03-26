'use strict'

const maxAuthorLength = 128;
const maxBodyLength = 1024;

class MessageSent {
    constructor(author, body) {
        this.author = author;
        this.body = body;
    }

    static tryParse = function(json) {
        if (typeof(json) === 'object'
            && typeof(json['author']) === 'string'
            && typeof(json['body']) === 'string'
            && json['author'].length <= maxAuthorLength
            && json['body'].length <= maxBodyLength) {
            return new MessageSent(json.author, json.body);
        } else {
            return null;
        }
    }
}

class MessageReceived {
    constructor(id, after, on, author, body) {
        this.id = id;
        this.after = after;
        this.on = on;
        this.author = author;
        this.body = body;
    }
}

class Messenger {
    constructor() {
        this.messages = [];
    }

    history(since) {
        let startIndex;
        if (!!since) {
            startIndex = this.messages.findIndex((m) => m.id == since);
        } else {
            startIndex = 0;
        }
        return this.messages.slice(startIndex, this.messages.length);
    }

    receive(messageSent) {
        const messageReceived = new MessageReceived(
            this.messages.length,
            this.messages.length - 1,
            new Date().toISOString(),
            messageSent.author,
            messageSent.body
        )
        this.messages.push(messageReceived);
        return messageReceived;
    }
}

export {MessageSent, MessageReceived, Messenger};