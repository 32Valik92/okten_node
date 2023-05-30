const path = require('path');
const fs = require('fs');

fs.mkdir(path.join(__dirname, 'foldersAndFiles'), (err) => {
    if (err) throw new Error(err.message);
});

for (let i = 1; i < 6; i++) {
    fs.writeFile(path.join(__dirname, 'foldersAndFiles', `text${i}.txt`), `This is file №${i}`, (err) => {
        if (err) throw new Error(err.message);
    })

    fs.mkdir(path.join(__dirname, 'foldersAndFiles', `folder${i}`), (err) => {
        if (err) throw new Error(err.message);
    })
}

fs.readdir(path.join(__dirname, 'foldersAndFiles'), {withFileTypes: true}, (err, elements) => {
    if (err) throw new Error(err.message);

    const arrFiles = [];
    const arrDirectories = [];

    elements.forEach(element => {
        element.isFile() ? arrFiles.push(element.name) : arrDirectories.push(element.name);
    })

    console.log('FILES: ', arrFiles);
    console.log('FOLDERS: ', arrDirectories);
});