const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { spawn } = require("child_process");
const multer = require("multer");
const path = require("path");
const Ticket = require("./models/Ticket");

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || "bsbsfbrnsftentwnnwnwn";

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: true })); // Allow client origin

if (!process.env.MONGO_URL) {
  console.error("Error: MONGO_URL is not defined");
} else {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userDoc = await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await UserModel.findOne({ email });
  if (!userDoc) {
    return res.status(404).json({ error: "User not found" });
  }
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) {
    return res.status(401).json({ error: "Invalid password" });
  }
  jwt.sign(
    { email: userDoc.email, id: userDoc._id },
    jwtSecret,
    {},
    (err, token) => {
      if (err) {
        return res.status(500).json({ error: "Failed to generate token" });
      }
      res.cookie("token", token).json(userDoc);
    }
  );
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await UserModel.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

const eventSchema = new mongoose.Schema({
  owner: String,
  title: String,
  description: String,
  organizedBy: String,
  eventDate: Date,
  eventTime: String,
  location: String,
  Participants: Number,
  Count: Number,
  Income: Number,
  ticketPrice: Number,
  Quantity: Number,
  image: String,
  likes: Number,
  Comment: [String],
});

const Event = mongoose.model("Event", eventSchema);

app.post("/createEvent", upload.single("image"), async (req, res) => {
  try {
    const eventData = req.body;
    eventData.image = req.file ? req.file.path : "";
    const newEvent = new Event(eventData);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "Failed to save the event to MongoDB" });
  }
});

app.get("/createEvent", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events from MongoDB" });
  }
});

app.get("/event/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.post("/event/:eventId", (req, res) => {
  const eventId = req.params.eventId;
  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      event.likes += 1;
      return event.save();
    })
    .then((updatedEvent) => {
      res.json(updatedEvent);
    })
    .catch((error) => {
      console.error("Error liking the event:", error);
      res.status(500).json({ message: "Server error" });
    });
});

app.get("/events", (req, res) => {
  Event.find()
    .then((events) => {
      res.json(events);
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Server error" });
    });
});

app.get("/event/:id/ordersummary", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.get("/event/:id/ordersummary/paymentsummary", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.post("/tickets", async (req, res) => {
  try {
    const ticketDetails = req.body;
    const newTicket = new Ticket(ticketDetails);
    await newTicket.save();
    return res.status(201).json({ ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

app.get("/tickets/:id", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

app.get("/tickets/user/:userId", (req, res) => {
  const userId = req.params.userId;
  Ticket.find({ userid: userId })
    .then((tickets) => {
      res.json(tickets);
    })
    .catch((error) => {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ error: "Failed to fetch user tickets" });
    });
});

app.delete("/tickets/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;
    await Ticket.findByIdAndDelete(ticketId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

app.post("/ml/recommend", (req, res) => {
  const inputData = req.body;
  console.log("Received input data:", inputData);
  if (!inputData || typeof inputData !== 'object') {
    return res.status(400).json({ error: "Invalid input data. Expected a JSON object." });
  }
  const { budget, min_events, event_types, min_popularity } = inputData;
  if (!budget || isNaN(budget) || Number(budget) <= 0) {
    return res.status(400).json({ error: "Invalid or missing budget. Budget must be a positive number." });
  }
  const validatedInput = { budget: Number(budget) };
  if (min_events && !isNaN(min_events) && Number(min_events) > 0) {
    validatedInput.min_events = Number(min_events);
  }
  if (event_types && Array.isArray(event_types) && event_types.length > 0) {
    validatedInput.event_types = event_types;
  }
  if (min_popularity && !isNaN(min_popularity) && Number(min_popularity) >= 0) {
    validatedInput.min_popularity = Number(min_popularity);
  }
  const pythonPath = "python3";
  const pythonScriptPath = path.join(__dirname, "ML", "run.py");
  const jsonInput = JSON.stringify(validatedInput);
  const pythonProcess = spawn(pythonPath, [pythonScriptPath, jsonInput], {
    cwd: path.join(__dirname, "ML"),
    env: {
      ...process.env,
      PATH: process.env.PATH,
    },
  });
  let output = "";
  let errorOutput = "";
  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
    console.log(`[Python stdout]: ${data}`);
  });
  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error(`[Python stderr]: ${data}`);
  });
  pythonProcess.on("close", (code) => {
    if (code === 0) {
      try {
        const parsedOutput = JSON.parse(output.trim());
        res.status(200).json(parsedOutput);
      } catch (e) {
        console.error("[JSON Parsing Error]:", e.message, output);
        res.status(500).json({
          error: "Invalid output from ML model",
          details: output.trim(),
        });
      }
    } else {
      console.error(`[Python process exited]: Code ${code}`);
      console.error(`[Error Output]: ${errorOutput}`);
      res.status(500).json({
        error: "Failed to execute ML model",
        details: errorOutput.trim() || "Unknown error",
      });
    }
  });
  pythonProcess.on("error", (err) => {
    console.error(`[Process Error]: ${err.message}`);
    res.status(500).json({ error: "Process execution error", details: err.message });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API is running on port ${PORT}`);
});