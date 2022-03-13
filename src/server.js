import express from "express";
import cors from "cors"
import path from "path"
import http from "http"
import {Server} from "socket.io"

const app = express()
const server = http.createServer(app)

const __dirname = path.resolve(path.dirname(""));



const io =  new Server(server, {
    cors:{
        origin: "*",
        method:["GET","POST"]
    }
})

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src',"view"));

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.render('index',{
        title:"Home Page",
    })
})


io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log("Server is listening on " + PORT))