function roomsbutton () {
    if (document.getElementById("centercolumn").style.width != "150px"){
        document.getElementById("centercolumn").style.width = "150px";
        document.getElementById("chatContainer").style.width = "150px";

        document.getElementById("left_button").style.width = "50%";
        document.getElementById("left_button").style.left = "0px";
        document.getElementById("left_button").style.right = null;

        document.getElementById("rooms").style.position = "absolute";
        document.getElementById("rooms").style.width = "190px";
        document.getElementById("rooms").style.right = "0px";
        document.querySelectorAll("#chatboxD *").forEach((element) => {
            element.style.width = "130px";
        })


        document.getElementById("roomide").style.width = "100px";
        

    } else {
        document.getElementById("centercolumn").style.width = "90%";
        document.getElementById("chatContainer").style.width = "calc(100% )";
        document.getElementById("left_button").style.width = "40px";
        document.getElementById("left_button").style.right = "0px";
        document.getElementById("left_button").style.left = null;
        document.getElementById("rooms").style.position = "relative";
        document.getElementById("rooms").style.right = "20000px";

        document.querySelectorAll("#chatboxD *").forEach((element) => {
            element.style.width = "84vw";
        })

        document.getElementById("roomide").style.width = "240px";


    }
}