try {
  process.loadEnvFile();
} catch (e) {
  console.warn(".env file not found, using default values.");
}

const jsonServer = require("json-server");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET;

server.use(middlewares);
server.use(morgan("dev"));
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

server.post("/login", (req, res) => {
  const { username, password } = req.body;

  const db = router.db.getState();
  const user = db.usuarios.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, {
    expiresIn: "8h",
  });

  res.json({ token });
});

server.use(router);

server.listen(PORT, () => {
  console.log(`JSON Server is running at port ${PORT}`);
});
