const fs = require('fs/promises');
const path = require('path');

module.exports = {
    readDB: async () => {
        const buffer = await fs.readFile(path.join(process.cwd(), 'dataBase.json'));
        const json = buffer.toString();
        return json ? JSON.parse(json) : [];
    },

    writeDB: async (users) => {
        await fs.writeFile(path.join(process.cwd(), 'dataBase.json'), JSON.stringify(users));
    }
}