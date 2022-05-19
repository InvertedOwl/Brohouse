const e = require("cors");
const fs = require("fs");
const ind = require("./index")

const commands = {
    "ch" : {
        "result" : (io, socket, args, username) => {

            roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))

            socket.rooms.forEach((roomI) => {
                if (checkAdmin(username, roomI)){
                    io.to(roomI).emit('clearhistory');
                    fs.writeFileSync(__dirname + '/history/chathistory-' + roomI + '.json', '{"chat":[]}')
                    io.to(roomI).emit('chat', {
                        "message" : "(/ch)\nServer>> Chat cleared\n"
                    })
                } else {
                    socket.emit('chat', {
                        "message" : "(/ch) Server>>Insufficient permissions"
                    })   
                }
              })
        }
    },
    "ip" : {
        "result" : (io, socket, args, username) => {
            socket.emit('chat', {
                "message" : "(/ip) Server>> You are " + socket.handshake.address
            })
        }
    },
    "help" : {
        "result" : (io, socket, args, username) => {
            socket.emit('chat', {
                "message" : "(/help) Server>> Commands are (/ip, gives the current connect ip) (/ch, clears the current rooms history) (/admin [Username], An admin specific command to make a user an admin) (/unadmin [Username], An admin specific command to remove admin from a user) (/nickof <Username>, Gets the nickname of a user or self if the first argument is empty) (/mute [Username], And admin specific command that toggles mute on a user based on room)"
            })
        }
    },
    "rave" : {
        "result" : (io, socket, args, username) => {
            if (args.length != 1){
                socket.emit('rave', args[1])
            } else {
                socket.emit('rave', 1)
            }
        }
    },
    "admin" : {
        "result" : (io, socket, args, username) => {
            if (args.length != 1){
                socket.rooms.forEach((roomI) => {
                    roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))
                    if (checkAdmin(username, roomI)){
                        roomJson[roomI].Admins.push(args[1])
                        io.to(roomI).emit("chat", {
                            "message" : "(/admin) Server>> Successfully made " + args[1] + " and admin"
                        })
                    } else {
                        socket.emit('chat', {
                            "message" : "(/admin) Server>>Insufficient permissions"
                        })   
                    }
                })
                fs.writeFileSync(__dirname + '/rooms.json', JSON.stringify(roomJson))
            } else {
                socket.emit('chat', {
                    "message" : "(/admin) Server>>Incorrect usage. (/admin [user])"})
            }
        }
    },
    "unadmin" : {
        "result" : (io, socket, args, username) => {
            console.log(username)
            if (args.length != 1){
                socket.rooms.forEach((roomI) => {
                    roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))
                    if (checkAdmin(username, roomI)){
                        const index = roomJson[roomI].Admins.indexOf(args[1]);
                        if (index > -1) {
                            roomJson[roomI].Admins.splice(index, 1);
                        }
                        io.to(roomI).emit("chat", {
                            "message" : "(/unadmin) Server>> Successfully removed " + args[1] + " from admin"
                        })
                    } else {
                        socket.emit('chat', {
                            "message" : "(/unadmin) Server>>Insufficient permissions"
                        })   
                    }
                })
                fs.writeFileSync(__dirname + '/rooms.json', JSON.stringify(roomJson))
            } else {
                socket.emit('chat', {
                    "message" : "(/unadmin) Server>>Incorrect usage. (/unadmin [user])"
                })
            }
        }
    },
    "raveall" : {
        "result" : (io, socket, args, username) => {
            socket.rooms.forEach((roomI) => {
                roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))
                if (checkAdmin(username, roomI)){
                    if (args.length != 1){
                        io.to(roomI).emit('rave', args[1])
                    } else {
                        io.to(roomI).emit('rave', 1)
                    }
                } else {
                    socket.emit('chat', {
                        "message" : "(/raveall) Server>>Insufficient permissions)"
                    })
                }
            })
        }
    },
    "nickof" : {
        "result" : (io, socket, args, username) => {
            var accounts = JSON.parse(fs.readFileSync(__dirname + '/accounts.json'));// TO DO MAKE CREATING ACCOUNTS N STUFF

            if (args.length != 1){
                if (accounts[args[1]] != undefined){
                    if (accounts[args[1]].nickname != undefined){
                        socket.emit('chat', {
                            "message" : "(/nickof) Server>>Nickname of " + args[1] + " is: " + accounts[args[1]].nickname
                        })
                    } else {
                        socket.emit('chat', {
                            "message" : "(/nickof) Server>>Nickname of " + args[1] + " is: " + args[1]
                        })
                    }
                } else {
                    socket.emit('chat', {
                        "message" : "(/nickof) Server>>Cant find user with username " + args[1]
                    })
                }
            } else {
                socket.emit('chat', {
                    "message" : "(/nickof) Server>>Your nickname is: " + accounts[username].nickname
                })
            }
        }
    },
    "mute" : {
        "result" : (io, socket, args, username) => {
            if (args.length != 1){
                roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))
                socket.rooms.forEach((roomI) => {
                    if (checkAdmin(username, roomI)){
                        if (roomJson[roomI]["mute"] == undefined) roomJson[roomI]["mute"] = []

                        if (!roomJson[roomI]["mute"].includes(args[1])){
                            roomJson[roomI]["mute"].push(args[1])
                            socket.emit('chat', {
                                "message" : "(/mute) Server>> Added " + args[1] + " to mute list in " + roomI
                            })
                        } else {
                            const index = roomJson[roomI].mute.indexOf(args[1]);
                            if (index > -1) {
                                roomJson[roomI].mute.splice(index, 1);
                                socket.emit('chat', {
                                    "message" : "(/mute) Server>> Removed " + args[1] + " to mute list in " + roomI
                                })
                            }
                        }
                        console.log(roomJson[roomI].mute)
                    } else {
                        socket.emit('chat', {
                            "message" : "(/mute) Server>>Insufficient permissions)"
                        })
                    }
                    })
                fs.writeFileSync(__dirname + '/rooms.json', JSON.stringify(roomJson))
            } else {
                socket.emit('chat', {
                    "message" : "(/mute) Server>>Incorrect usage. (/mute [user])"
                })
            }
        }
    },
    "archiveroom" : {
        "result" : (io, socket, args, username) => {
            if (checkAdmin(username, roomI)){
                roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))


                socket.rooms.forEach((roomI) => {
                    delete roomJson[roomI];
                })

                fs.writeFileSync(__dirname + '/rooms.json', JSON.stringify(roomJson))
            } else {
                socket.emit('chat', {
                    "message" : "(/archiveroom) Server>>Insufficient permissions)"
                })
            }
        }
    },
    "roommaxpeople" : {
        "result" : (io, socket, args, username) => {
            socket.rooms.forEach((roomI) => {
                if (checkAdmin(username, roomI)) {
                    if (args.length > 1) {
                        roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))


                            roomJson[roomI].maxPeople = args[1];

                        fs.writeFileSync(__dirname + '/rooms.json', JSON.stringify(roomJson))
                        socket.emit('chat', {
                            "message" : "(/roommaxpeople) Server>>Succesfully set room max to " + args[1]
                        })
                    } else {
                        socket.emit('chat', {
                            "message" : "(/roommaxpeople) Server>>Incorrect usage (/roommaxpeople [value])"
                        })
                    }
                } else {
                    socket.emit('chat', {
                        "message" : "(/roommaxpeople) Server>>Insufficient permissions)"
                    })
                }
            })
        }
    }
}

function checkAdmin (username, roomI) {
    roomJson = JSON.parse(fs.readFileSync(__dirname + '/rooms.json'))
    return roomJson[roomI].Admins.includes(username) || username == "Owl";
}

exports.handleCommand = function(io, socket, message, username) {
    console.log(username + " entered command " + message.message)
    var msg = message.message.substring(1);
    var args = msg.split(" ");

    if (Object.keys(commands).includes(args[0])){
        var result = commands[args[0]].result;
        result(io, socket, args, username);
    } else {
        socket.emit('chat', {
            "message" : "Unknown command " + message.message
        })
    }
}