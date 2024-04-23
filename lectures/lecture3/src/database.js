const messageRecords = [];

class MessagesTable {
    async fetchAll() {
        return messageRecords.slice();
    }

    async fetchSince(since) {
        return messageRecords.slice(since + 1, messageRecords.length);
    }

    async insert(message) {
        message.id = messageRecords.length;
        message.after = messageRecords.length - 1;
        messageRecords.push(message);
        return message;
    }
}

const userRecords = [];

class UsersTable {
    async findById(id) {
        if (id < 0 || id >= userRecords.length)
            return null;
        return userRecords[id];
    }

    async findByLogin(login) {
        const user = userRecords.find(u => u.login === login);
        return user !== undefined ? user : null;
    }

    async tryInsert(user) {
        if (userRecords.find(u => u.login === user.login))
            return false;
        user.id = userRecords.length;
        userRecords.push(user);
        return true;
    }
}

export { UsersTable, MessagesTable };
