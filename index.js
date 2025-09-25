// index.js
import express from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

// Static assets (CSS, images)
app.use(express.static("public"));
// Parse form bodies
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set("view engine", "ejs");
app.set("views", "views");

// Helper: build a safe JokeAPI URL from query
function buildJokeUrl(category = "Any") {
  const base = "https://v2.jokeapi.dev/joke/";
  const flags = "blacklistFlags=nsfw,religious,political,racist,sexist,explicit";
  // no type=single → allow both single and twopart
  return `${base}${encodeURIComponent(category)}?${flags}`;
}

// Home page - fetch a joke and render
app.get("/", async (req, res) => {
  const category = req.query.category || "Any";
  const name = req.query.name || "Friend";

  try {
    const { data } = await axios.get(buildJokeUrl(category));

    let jokeText = null;

    if (data?.type === "single") {
      jokeText = data.joke;
    } else if (data?.type === "twopart") {
      // show setup + delivery together
      jokeText = `${data.setup} — ${data.delivery}`;
    }

    res.render("index.ejs", {
      name,
      category,
      joke: jokeText,
      error: null,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).render("index.ejs", {
      name,
      category,
      joke: null,
      error: "Sorry, we couldn't load a joke right now. Please try again.",
    });
  }
});

// Handle form submit (POST -> redirect to GET with query)
app.post("/joke", (req, res) => {
  const { name, category } = req.body;
  const q = new URLSearchParams({ name: name || "", category: category || "Any" });
  res.redirect(`/?${q.toString()}`);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
