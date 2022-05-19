const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const fs = require("fs");
const { all } = require('express/lib/application');
const io = new Server(server);
global.io = io;
const nodemailer = require('nodemailer');
const e = require('cors');
const hash = crypto = require("crypto");
const commandhandler = require("./commandhandler");

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})
app.set('etag', false)
const nocache = require('nocache');

app.use(nocache());

let numConnected = 0;
app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html')
});




var rooms = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'));
var allUsers = [];

app.get('/api/rooms', (req, res) => {
  res.send("WIP")
});

var roomPeople = {
  "global" : []
}


module.exports = {roomPeople}; 

io.on('connection', (socket) => {
    rooms = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'));
    socket.emit("roomPeople", roomPeople);
    socket.emit('history', fs.readFileSync(__dirname + '/history/chathistory-global.json').toString())
    socket.rooms.forEach((socketRoom) => {
      socket.leave(socketRoom);
    })
    socket.join("global")
    numConnected++;

    var ourUsername;

    socket.on('nickname', (account) => {
      if (verifyUserb(account)){
        var accounts = JSON.parse(fs.readFileSync(__dirname + '/accounts.json'));// TO DO MAKE CREATING ACCOUNTS N STUFF
        accounts[account.username].nickname = account.nickname;
        fs.writeFileSync(__dirname + '/accounts.json', JSON.stringify(accounts));
      }
    })

    socket.on('createaccount', (account) => {
      var accounts = JSON.parse(fs.readFileSync(__dirname + '/accounts.json'));// TO DO MAKE CREATING ACCOUNTS N STUFF

      var accountLower = Object.keys(accounts).map((element) => {
        return element.toLowerCase();
      })

      if (!accountLower.includes(account.username.toLowerCase())){
        accounts[account.username] = {
          "password" : crypto.createHash('md5').update(account.password).digest('hex')
        } 
        socket.emit('createaccountsuccess')
      } else {
        console.log("Username already in use: " + account.username);
        socket.emit('connectfail', "Username already in use")
      }
      fs.writeFileSync(__dirname + '/accounts.json', JSON.stringify(accounts));
    })

    socket.on('pfp', (account) => {
      var image = account.image;
      const buffer = Buffer.from(image, 'base64');
      fs.writeFileSync(__dirname + '/usr/image/' + ourUsername + '.png', buffer); // fs.promises
    })


    socket.on('connects', (msg1) => {
      rooms = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'));
      var accounts = JSON.parse(fs.readFileSync(__dirname + '/accounts.json'));// TO DO MAKE CREATING ACCOUNTS N STUFF

      if (verifyUserb(msg1)){
        ourUsername = msg1.username;
        console.log(msg1.username + " connected")
        console.log("All users before: " + allUsers)
        allUsers.push(msg1.username);
        console.log("All users after: " + allUsers)

        roomPeople.global.push(ourUsername);
        io.emit("roomPeople", roomPeople);

        io.emit('connects', allUsers);
        socket.emit('connectsuccess');
        console.log("Success!")
      } else {
        socket.emit('connectfail', "Incorrect Username/Password")
      }

    })

    socket.on('joinroom', (creds) => {
        rooms = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'));
         console.log("Room: " + creds.id + ", Password:" + creds.password)
         console.log(rooms[creds.id].password)

        if (roomPeople[creds.id] == undefined) roomPeople[creds.id] = [];

        if (rooms[creds.id].password == creds.password && roomPeople[creds.id].length != rooms[creds.id].maxPeople){
          var roomsWithouPass = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'));
          for (var roomP of Object.keys(roomsWithouPass)){
              roomsWithouPass[roomP].password = "";
          }
    
          socket.emit('rooms', roomsWithouPass);
          socket.rooms.forEach((socketRoom) => {
            socket.leave(socketRoom);
            var indexOfUs = roomPeople[socketRoom].indexOf(ourUsername);
            if (indexOfUs > -1) roomPeople[socketRoom].splice(indexOfUs, 1)
          })
          if (roomPeople[creds.id] == undefined) roomPeople[creds.id] = [];

          roomPeople[creds.id].push(ourUsername);
          io.emit("roomPeople", roomPeople);


          socket.emit('joinroom', {
            "success" : true,
            "name" : rooms[creds.id].name,
            "id" : creds.id
          })
          socket.join(creds.id)
          socket.emit('clearhistory');
          socket.emit('history', fs.readFileSync(__dirname + '/history/chathistory-' + creds.id + '.json').toString());
        } else {
          
          socket.emit('joinroom', {
            "success" : false,
            "name" : rooms[creds.id].name,
            "id" : creds.id
          })
        }
    })
    socket.on('rooms', (nothing) => {
      var roomsWithouPass = JSON.parse(JSON.stringify(rooms));
      for (var roomP of Object.keys(roomsWithouPass)){
          roomsWithouPass[roomP].password = "";
      }

      socket.emit('rooms', roomsWithouPass);
    })

    socket.on('getnickname', (username) => {
      var accounts = JSON.parse(fs.readFileSync(__dirname + '/accounts.json'));// TO DO MAKE CREATING ACCOUNTS N STUFF

      if (accounts[username]) socket.emit("getnickname", accounts[username].nickname)
    })

    socket.on('create_room', (room) => {
      if (!(room.id == undefined) && !Object.keys(rooms).includes(room.id)) {

        roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))
        roomJson[room.id] = {
          "name" : room.name,
          "maxPeople" : room.maxPeople,
          "lock" : room.lock,
          "password" : room.password,
          "Admins" : [ourUsername]
        }
        rooms = roomJson;
        fs.writeFileSync(__dirname + '/history/chathistory-' + room.id + '.json', '{"chat":[]}')

        fs.writeFileSync(__dirname + '/rooms.json', JSON.stringify(roomJson))
        io.emit('rooms', rooms)
      }
    })

    socket.on('getpfpof', (username) => {
      var bytes = undefined;
      console.log(username)

      try {
        var bitmap = fs.readFileSync(__dirname + '/usr/image/image.png')
        bytes = new Buffer(bitmap);
      } catch (e) {
        console.log(bitmap)
      }
      socket.emit('getpfpof', bytes.toString('base64'));
    })
    
    socket.on('disconnects', () => {
      rooms = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'));
      numConnected--;
      console.log(ourUsername + " disconnected")

      Object.keys(rooms).forEach((socketRoom) => {
        if (roomPeople[socketRoom] != undefined){
          var indexOfUs = roomPeople[socketRoom].indexOf(ourUsername);
          if (indexOfUs > -1) roomPeople[socketRoom].splice(indexOfUs, 1)
          io.emit("roomPeople", roomPeople);
        }
      })

      const index = allUsers.indexOf(ourUsername);
      if (index > -1) {
        allUsers.splice(index, 1);
      }

      io.emit('disconnects', allUsers)
    })


    socket.on('disconnect', () => {
      numConnected--;
      console.log(ourUsername + " disconnected")

      Object.keys(rooms).forEach((socketRoom) => {
        if (roomPeople[socketRoom] != undefined){
          var indexOfUs = roomPeople[socketRoom].indexOf(ourUsername);
          if (indexOfUs > -1) roomPeople[socketRoom].splice(indexOfUs, 1)
          io.emit("roomPeople", roomPeople);
        }
      })

      const index = allUsers.indexOf(ourUsername);
      if (index > -1) {
        allUsers.splice(index, 1);
      }

      io.emit('disconnects', allUsers)
    });


    // CHAT EVENT
    socket.on('chat', (msg1) => {
      var roomsWithouPass = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'));
      for (var roomP of Object.keys(roomsWithouPass)){
          roomsWithouPass[roomP].password = "";
      }

      socket.emit('rooms', roomsWithouPass);


      console.log(roomPeople)
      io.emit("roomPeople", roomPeople);
      var accounts = JSON.parse(fs.readFileSync(__dirname + '/accounts.json'));// TO DO MAKE CREATING ACCOUNTS N STUFF

      if (accounts[msg1.username] != undefined){
      
      var msg = (accounts[msg1.username].nickname == undefined ? msg1.username : accounts[msg1.username].nickname) + ": " + msg1.message;

      if (verifyUser(msg1, socket)){
        if (msg1.message.substring(0, 1) == "/"){
          commandhandler.handleCommand(io, socket, msg1, ourUsername);
        } else {
          socket.rooms.forEach((roomI) => {
            roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))

            if (roomJson[roomI]["mute"] == undefined) {
              roomJson[roomI]["mute"] = []
              fs.writeFileSync(__dirname + 'rooms.json', JSON.stringify(roomJson))
            }

            if (!roomJson[roomI]["mute"].includes(ourUsername)){
              
              var bytes = undefined;

              try {
                var bitmap = fs.readFileSync(__dirname + '/usr/image/' + ourUsername  + ".png")
                bytes = new Buffer(bitmap);
              } catch (e) {
                console.log(bitmap)
              }

              historyJson = JSON.parse(fs.readFileSync(__dirname + '/history/chathistory-' + roomI + '.json'))
              historyJson.chat.push({
                "message" : msg,
                "username" : ourUsername,
              })
      
              fs.writeFileSync(__dirname + '/history/chathistory-' + roomI + '.json', JSON.stringify(historyJson))

              if (bytes == undefined) {
                try {
                  var bitmap = fs.readFileSync(__dirname + '/usr/image/usr default.png')
                  bytes = new Buffer(bitmap);
                } catch (e) {
                  console.log(bitmap)
                }
              }

              io.to(roomI).emit('chat', {
                "message" : msg,
                "username" : ourUsername,
                "pfp" : bytes.toString('base64')
              })
            } else {
              socket.emit('chat', {
                "message" : "You cannot chat in this room since you are muted!",
              })
            }
          })
        }
      }
    }
  })
  socket.broadcast.emit('numconnected', numConnected.toString())

  });

function verifyUserb (user) {
  var accounts = JSON.parse(fs.readFileSync(__dirname + '/accounts.json'));// TO DO MAKE CREATING ACCOUNTS N STUFF
  if(Object.keys(accounts).includes(user.username)){
    if (accounts[user.username].password == crypto.createHash('md5').update(user.password).digest('hex')) {
      return true;
    }
  }
  return false;
}

function verifyUser (user, socket) {
  var accounts = JSON.parse(fs.readFileSync(__dirname + '/accounts.json'));// TO DO MAKE CREATING ACCOUNTS N STUFF
  if(Object.keys(accounts).includes(user.username)){
    if (accounts[user.username].password == crypto.createHash('md5').update(user.password).digest('hex')) {
      if (accounts[user.username].mute != true){
        return true;
      } else {
        socket.rooms.forEach((roomI) => {
          io.to(roomI).emit('chat', {
            "message" : "Cannot chat since you are muted!",
            "username" : user.username,
          })
        })
      }
    }
  }
  return false;
}
app.use('/games', require(__dirname + '/games/BrohouseGames/index'))


server.listen(80, () => {
  console.log('listening on *:80');
});
