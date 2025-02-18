import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { MongoClient, ObjectId } from "mongodb";
import compression from "compression";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import tailwindcss from '@tailwindcss/vite'

dotenv.config();

const app = express();

app.use(
    compression({
      level: 1,
    })
);

const url = process.env.MONGO_URI || "mongodb://localhost:27017";
const db_connect = new MongoClient(url);
let users_collection, piggy_collection;

async function run() {
  await db_connect.connect();
  console.log("Connected to MongoDB!");
  const db = db_connect.db("savings");
  users_collection = db.collection("users");
  piggy_collection = db.collection("piggys");
}

run().catch(console.error);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
      secret: process.env.SESSION_SECRET || "your_secret_key",
      resave: false,
      saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await users_collection.findOne({ username });

        if (!user || user.password !== password) {
          return done(null, false, { message: "Incorrect username or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await users_collection.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user)
      return res.json({ success: false, message: "Incorrect username or password" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true });
    });
  })(req, res, next);
});

app.get("/piggies", isAuthenticated, async (req, res) => {
  const userPiggies = await piggy_collection
      .find({ username: req.user.username })
      .toArray();
  res.json(userPiggies);
});

app.post("/add-piggy", isAuthenticated, async (req, res) => {
  const { title, amount, goal, need } = req.body;

  if (!title || isNaN(amount) || isNaN(goal) || !["Low", "Medium", "High", "Very High"].includes(need)) {
    return res.status(400).json({ success: false, message: "Missing piggy bank details" });
  }

  if (amount <= 0 || goal <= 0 ||  goal < amount) {
    return res.status(400).json({success: false, message: "Amount and goal can not be negative nor should goal be less than amount."})
  }

  if (amount >= 10000000 || goal >= 1000000) {
    return res.status(400).json({success: false, message: "Let's be real, you don't have money like that."})
  }

  const newPiggy = {
    title,
    amount: parseFloat(amount).toFixed(2),
    goal: parseFloat(goal).toFixed(2),
    need,
    username: req.user.username,
  };

  const result = await piggy_collection.insertOne(newPiggy);
  newPiggy._id = result.insertedId;

  res.json({ success: true, piggy: newPiggy });
});

app.delete("/delete-piggy/:id", isAuthenticated, async (req, res) => {
  try {
    const result = await piggy_collection.deleteOne({
      _id: new ObjectId(req.params.id),
      username: req.user.username,
    });

    if (result.deletedCount === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this piggy bank" });
    }

    res.json({ success: true, message: "Piggy bank deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Invalid piggy bank ID" });
  }
});

app.put("/edit-piggy/:id", isAuthenticated, async (req, res) => {
  const { title, amount, need } = req.body;

  if (!title || isNaN(amount) || isNaN(goal) || amount <= 0 || goal <= 0 ||  goal < amount || amount >= 10000000 || goal >= 1000000 || !["Low", "Medium", "High", "Very High"].includes(need)) {
    return res.status(400).json({ success: false, message: "Invalid details" });
  }

  try {
    const result = await piggy_collection.findOneAndUpdate(
        { _id: new ObjectId(req.params.id), username: req.user.username },
        { $set: { title, amount: parseFloat(amount).toFixed(2), need } },
        { returnDocument: "after" }
    );

    res.json({ success: true, piggy: result.value });
  } catch (err) {
    res.status(500).json({ success: false, message: "Invalid piggy bank ID" });
  }
});

app.get("/user-info", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ username: req.user.username });
  } else {
    res.json({ username: null });
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

ViteExpress.config({ printViteDevServerHost: true, plugins: [
    tailwindcss()]});

ViteExpress.listen(app, 3000, () => {
  console.log("Server running on port 3000");
});
