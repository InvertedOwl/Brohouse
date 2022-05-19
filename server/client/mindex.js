let socket;
let chat = [];
var username;
var password;
let roomsArray;
let attemptToJoin;
let roomJoined;
let pagescroll = 0;


function connect () {
    socket = io();
    
    //document.getElementById("chatbox").focus()



    // if (document.cookie && document.cookie != "null") {
    //     var brler = document.cookie.split("login=");
    //     if (brler){
    //         username = brler.at(brler.length - 1).split(" ").at(0);
    //         password = brler.at(brler.length - 1).split(" ").at(1);

    //         clickCancelNewRoom()
    //         socket.emit('connects', {
    //             "username" : username,
    //             "password" : password
    //         });
    //         document.getElementById("usersettings_username").textContent = username;
    //         document.getElementById("usersettings_pfp").src = "https://brohouse.dev/usr/image/" + username + ".png"
    //     }
    // }

    socket.emit('rooms', null);



    socket.on('connectsuccess', function(room) {
        clickCancelNewRoom();
        roomJoined = attemptToJoin;
        
        document.getElementById("usersettings_pfp").src = "https://brohouse.dev/usr/image/" + username + ".png";
        document.getElementById("usersettings_username").textContent = username;
        
    }) 

    socket.on('history', function(json) {
        jsonHistory = JSON.parse(json)

        var pfps = {}
        for (var i = 0; i < jsonHistory.chat.length; i++){
            var message = jsonHistory.chat[i].message
            const img = new Image()
            img.src = `https://brohouse.dev/usr/image/${jsonHistory.chat[i].username}.png`
            addChat(message, img)
        }
    })

    var speedd = 1;
    var rave = false;
    function raving() {
        document.getElementById("body").style.backgroundColor = "rgb(" + getRandomInt(255) + "," +getRandomInt(255) + "," +getRandomInt(255) + ")"
        if (rave){
            setTimeout(raving, 500 / speedd)
        } else {
            document.getElementById("body").style.backgroundColor = "rgb(112, 112, 112)"

        }

        
    }
    socket.on('rave', function(speed) {
        speedd = speed;
        rave = !rave
        if (rave){
            setTimeout(() => {
                raving(speed)
            }, 50)
        } else {
            document.getElementById("body").style.backgroundColor = "rgb(112, 112, 112)"

        }
    })


    socket.on('joinroom', function(connectionSuccessful) {
        console.log("Was able to log in to room: " + connectionSuccessful.success)
        if (connectionSuccessful.success) {
            screenToBottom();            
            clickCancelNewRoom()
            document.getElementById("roomidetext").textContent = connectionSuccessful.name;
            document.getElementById("roomideid").textContent = connectionSuccessful.id
        }
    })

    socket.on('connects', function(username) {
        document.getElementById('users').innerHTML = ""

        for (newUse of username){
            document.getElementById('users').innerHTML += `        
            <button id="${newUse}" class="user" onclick="userInfo(this)">
                <p class="usertext">${newUse}</p>
                <div class="userimgdiv">
                    <img src="https://brohouse.dev/usr/image/${newUse}.png" alt="user" class="userimg" onerror="this.src = 'https://brohouse.dev/usr/image/usr default.png'"> </img>
                </div>
            </button>`
        }
    })

    socket.on('disconnects', function(username) {
        document.getElementById('users').innerHTML = ""
        for (newUse of username){
            document.getElementById('users').innerHTML += `        
            <button id="${newUse}" class="user" onclick="userInfo(this)">
                <p class="usertext">${newUse}</p>
                <div class="userimgdiv">
                    <img src="https://brohouse.dev/usr/image/${newUse}.png" alt="user" class="userimg" onerror="this.src = 'https://brohouse.dev/usr/image/usr default.png'"> </img>
                </div>
            </button>`
        }
    })

    socket.on('getnickname', function(nick) {
        if (document.getElementById("userview").style.display == "block"){
            document.getElementById("userview_nickname").textContent = nick;
        }
        document.getElementById("usersettings_nickname").textContent = nick;
    })

    socket.on("roomPeople", function(roomPeople){
        for (var rooml of document.getElementById("rooms").children){
            if (roomPeople[rooml.id.substring(5)] != undefined){
                rooml.getElementsByClassName("numOn")[0].textContent = roomPeople[rooml.id.substring(5)].length + "/" + roomsArray[rooml.id.substring(5)].maxPeople
                if (roomPeople[rooml.id.substring(5)].length == roomsArray[rooml.id.substring(5)].maxPeople){
                    rooml.getElementsByClassName("numOn")[0].classList.add("numOnFull");
                } else {
                    rooml.getElementsByClassName("numOn")[0].classList.remove("numOnFull");
                }
            }
        }
    })

    socket.on('rooms', function(rooms) {
        roomsArray = rooms;
        document.getElementById("rooms").innerHTML = "";

        for (var roomJ of Object.keys(rooms)){
            console.log("Room incoming! " + rooms[roomJ].name)
            document.getElementById("rooms").innerHTML += `
            <button id="room_` + roomJ +`" class="room" onclick="roomClick('` + roomJ + `')">
                <p class="numOn">0/` + rooms[roomJ].maxPeople + `</p>
                <p class="roomname">` + rooms[roomJ].name +`</p>
            </button>
            `
        }

        document.getElementById("rooms").innerHTML += `                <button id="createRoom" class="add" onclick="clickNewRoom()">
        <b>+</b>
    </button>`;
    })
    socket.on('clearhistory', function() {
        document.getElementById("chatContainer").innerHTML = "";
    })

    socket.on('chat', function(msg) {
        if (msg.pfp != undefined) {
            const img = new Image()
            img.src = `data:image/png;base64,${msg.pfp}`
            addChat(msg.message, img)

        } else {
            addChat(msg.message)

        }
        window.scrollTo(0, document.body.scrollHeight);
        pagescroll = 0;
      });
    socket.on('connectfail', function(error) {
        console.log(error)
        document.getElementById("errorbg").style.display = "block";
        document.getElementById("error").textContent = error;
    })

    socket.on('createaccountsuccess', function() {
        socket.emit('connects', {
            "username" : username,
            "password" : password
        });
    })

    document.getElementById("centercolumn").addEventListener("wheel", function(e){
          document.getElementById("chatContainer").style.marginBottom = pagescroll + "px";
          pagescroll += e.deltaY 
          if (pagescroll > 0) {
              pagescroll = 0;
          } else if (-pagescroll + document.getElementById("chatContainerConatinerr").offsetHeight - 120 > document.getElementById("chatContainer").offsetHeight) {
              pagescroll = -document.getElementById("chatContainer").offsetHeight + document.getElementById("chatContainerConatinerr").offsetHeight  - 120;
          }

          if (document.getElementById("chatContainer").offsetHeight < document.getElementById("chatContainerConatinerr").offsetHeight ) {
            pagescroll = 0;
          }
      }, false)
}

function onclicks () {
    if (document.getElementById("chatbox").value){
        var message = document.getElementById("chatbox").value
        // addChat(message)
        socket.emit('chat', {
            "message" : message,
            "username" : username,
            "password" : password
        })
        screenToBottom();
        document.getElementById("chatbox").value = ""
    }
}


function addChat(message) {
    var div = document.createElement('div')
    var item = document.createElement('li');
    item.textContent = message;
    div.append(item)
    document.getElementById("chatContainer").append(div)
    window.scrollTo(0, document.body.scrollHeight);
}
function addChat(message, image) {
    console.log(message)

    var div = document.createElement('div')

    var item = document.createElement('li');
    if (checkURL(message)){
        item = document.createElement('img')
        item.src = message.split(": ")[1]
        item.classList.add("gifembed")
    }
    else {
        item.textContent = message;

    }
    if (image){
        div.append(image)
        image.addEventListener("error", (e) => {
            console.log(e)
            e.target.src = 'https://brohouse.dev/usr/image/usr default.png'
        })
        image.setAttribute("class", "pfp")

    }
    div.className = "pfp"

    
    div.append(item)

    document.getElementById("chatContainer").append(div)
    div.setAttribute("class", "chatHolder")

    window.scrollTo(0, document.body.scrollHeight);
}

function submitNewRoom () {
    var name = document.getElementById("createRoomWindow_Name").value;
    var id = document.getElementById("createRoomWindow_Id").value;
    var maxPeople = document.getElementById("createRoomWindow_MaxPeople").value;
    var locked = document.getElementById('createRoomWindow_Locked').checked;
    var pass = document.getElementById("createRoomWindow_Pass").value;

    if (locked){
        var hashPass = new jsSHA("SHA-512", "TEXT", {numRounds: 1});
        hashPass.update(pass);
        pass = hashPass.getHash("HEX");
    } else {
        pass = ""
    }


    var room = new Room(name, maxPeople, locked, pass, id)
    socket.emit("create_room", room)
    document.getElementById("createRoomWindow").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function clickNewRoom() {
    document.getElementById("createRoomWindow").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function clickCancelNewRoom() {
    for (windowElement of document.getElementsByClassName("window")) {
        windowElement.style.display = "none";
    }
    document.getElementById("signup_password").value = ""
    document.getElementById("signup_username").value = ""
    document.getElementById("signin_password").value = ""
    document.getElementById("signin_username").value = ""
    document.getElementById("errorbg").style.display = "none";
    
    document.getElementById("overlay").style.display = "none";
    
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function roomClick(roomButton){
    displayRoom(roomButton)
}

function joinRoomAttempt(id) {
    var pass = document.getElementById("joinRoomPass").value;
    document.getElementById("joinRoomPass").value = "";

    if (pass != ""){
        var hashPass = new jsSHA("SHA-512", "TEXT", {numRounds: 1});
        hashPass.update(pass);
        pass = hashPass.getHash("HEX");
    }

    var data = {
        "id" : id,
        "password" : pass
    }
    attemptToJoin = id;
    socket.emit("joinroom", data)
}

function displayRoom(roomId) {
    document.getElementById("joinRoom").style.display = "block";
    document.getElementById("overlay").style.display = "block";
    document.getElementById("joinRoomText").textContent =  roomsArray[roomId].name
    if (roomsArray[roomId].lock){
        document.getElementById("joinRoomPass").style.display = "block";
    } else {
        document.getElementById("joinRoomPass").style.display = "none";
    }
    document.getElementById("joinRoomJoin").addEventListener("click", () => {
        joinRoomAttempt(roomId)

    }, {once: true})
}

function onSignUp () {
    if (document.getElementById("signup_username").value && document.getElementById("signup_password")){
        username = document.getElementById("signup_username").value;
        password = document.getElementById("signup_password").value;
        if (username.length < 1 || username.includes(" ") || password.length < 3 || password.includes(" ")) return;
        socket.emit("disconnects");

        socket.emit('createaccount', {
            "username" : username,
            "password" : password
        })

        
    }
    document.getElementById("usersettings_pfp").src = "https://brohouse.dev/usr/image/" + username + ".png";
    document.getElementById("usersettings_pfp").addEventListener("error", (e) => {
        console.log(e)
        e.target.src = 'https://brohouse.dev/usr/image/usr default.png'
    })
    document.getElementById("usersettings_username").textContent = username;

}


function onSignIn () {
    if (document.getElementById("signin_username").value && document.getElementById("signin_password")){
        username = document.getElementById("signin_username").value;
        password = document.getElementById("signin_password").value;

        socket.emit("disconnects");
        socket.emit('connects', {
            "username" : username,
            "password" : password
        });

        // if (document.getElementById("remember").value) {
        //     document.cookie = "login=" + username + " " + password
        // }

    }}

function userSettings () {
    document.getElementById("usersettings").style.display = "block";
    document.getElementById("overlay").style.display = "inline";
    socket.emit('getnickname', username);
}

function logout() {
    clickCancelNewRoom()
    socket.emit("disconnects")
    document.getElementById("overlay").style.display = "block";
    document.getElementById("signupin").style.display = "block";
    document.getElementById("usersettings_username").textContent = "Not Logged In";
}

function nickname() {
    if (document.getElementById("nickname").value.length < 10 && document.getElementById("nickname").value.length > 0 && !document.getElementById("nickname").value.includes(" ")) {
        socket.emit("nickname", {
            "username" : username,
            "password" : password,
            "nickname" : document.getElementById("nickname").value
        })
        socket.emit("getnickname", username)
    }
}

function usersettings(){
    let photo = document.getElementById("usersettingsfile").files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const bytes = new Uint8Array(this.result);
        socket.emit('pfp', {
            "image" : bytes
        })
    }
    reader.readAsArrayBuffer(photo);
    setTimeout(function() {
        document.getElementById("usersettings_pfp").src = "https://brohouse.dev/usr/image/" + username + ".png";
    }, 50)
}

function userInfo(user) {
    document.getElementById("userview").style.display = "block";
    document.getElementById("overlay").style.display = "inline";
    document.getElementById("userview_username").textContent = user.getElementsByClassName("usertext")[0].textContent;
    document.getElementById('userview_pfp').src = "https://brohouse.dev/usr/image/" + user.getElementsByClassName("usertext")[0].textContent + ".png";
    document.getElementById('userview_pfp').addEventListener("error", (e) => {
        console.log(e)
        e.target.src = 'https://brohouse.dev/usr/image/usr default.png'
    })
    socket.emit("getnickname", user.getElementsByClassName("usertext")[0].textContent)

}

class Room {
    name;
    people;
    maxPeople;
    lock;
    password;
    id;

    constructor(name, maxPeople, lock, password, id) {
        this.name = name;
        this.people = 0;
        this.maxPeople = maxPeople;
        this.lock = lock;
        this.password = password;
        this.id = id;
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function screenToBottom() {
    pagescroll = 0;
    document.getElementById("chatContainer").style.marginBottom = pagescroll + "px";
}

function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}
