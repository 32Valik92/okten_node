// EVENTS
// const events = require('node:events');
//
// const eventEmitter = new events();
//
// eventEmitter.on('click', (data)=>{
//   console.log(data)
//   console.log('Click click click');
// })
//
// eventEmitter.emit('click', { data: "Hello" });
// eventEmitter.emit('click');
// eventEmitter.emit('click');
// eventEmitter.emit('click');
// eventEmitter.emit('click');
//
// console.log(eventEmitter.eventNames());
//
// eventEmitter.once('clickAndDie', ()=>{
//   console.log('Clicked and died');
// })
//
// console.log(eventEmitter.eventNames());
//
// eventEmitter.emit('clickAndDie');
// eventEmitter.emit('clickAndDie');
// eventEmitter.emit('clickAndDie');
// eventEmitter.emit('clickAndDie');
//
// console.log(eventEmitter.eventNames());
//
// const fs = require('fs');
//
// const readStream = fs.createReadStream('text.txt');
// const writeStream = fs.createWriteStream('text2.txt');
//
// readStream.on('data', (chunk)=>{
//   console.log(chunk);
//   writeStream.write(chunk)
// })
//
// readStream
//   .on('error', ()=>{
//     readStream.destroy();
//     writeStream.end('ERROR ON READING FILE');
//
//     // handle error
//   })
//   .pipe(writeStream)
//
// read, write, duplex, transform - !!!

import express, { Request, Response } from "express";

const users = [
  {
    name: "Oleh",
    age: 20,
    gender: "male",
  },
  {
    name: "Anton",
    age: 10,
    gender: "male",
  },
  {
    name: "Inokentiy",
    age: 25,
    gender: "female",
  },
  {
    name: "Anastasiya",
    age: 15,
    gender: "female",
  },
  {
    name: "Cocos",
    age: 25,
    gender: "other",
  },
];

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CRUD - create, read, update, delete

app.get("/users", (req: Request, res: Response) => {
  res.status(200).json(users);
});

app.get("/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  res.status(200).json(users[+id]);
});

app.post("/users", (req: Request, res: Response) => {
  users.push(req.body);

  res.status(201).json({
    message: "User created.",
  });
});

app.put("/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  users[+id] = req.body;

  res.status(200).json({
    message: "User updated",
    data: users[+id],
  });
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  users.splice(+id, 1);

  res.status(200).json({
    message: "User deleted",
  });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server has started on PORT ${PORT}`);
});
