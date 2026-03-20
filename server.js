const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  res.json({
    reply: `🔥 Investor Mode: "${message}" sounds interesting, but who will PAY for this?`
  });
});

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});