
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const VERSION = process.env.VERSION || "v1";

const match = /^v([123])$/.exec(VERSION);

if (!match) {
  throw new Error("VERSION must be v1, v2, or v3");
}

const versionNumber = Number(match[1]);
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ wishlist: [] }, null, 2)
    );
  }

  const data = JSON.parse(
    fs.readFileSync(DATA_FILE, "utf8")
  );

  return {
    wishlist: Array.isArray(data.wishlist)
      ? data.wishlist
      : []
  };
}

function writeData(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );
}

function requireVersion(requiredVersion, res) {
  if (versionNumber !== requiredVersion) {
    res.status(403).json({
      error: `This feature is available only in v${requiredVersion}`
    });
    return false;
  }

  return true;
}

// Health check: available in all versions.
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: VERSION,
    application: "Wishlist System"
  });
});

// VERSION 1: Add and save an item.
app.post("/wishlist", (req, res) => {
  if (!requireVersion(1, res)) return;

  const { name, details } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof details !== "string" ||
    !details.trim()
  ) {
    return res.status(400).json({
      error: "Item name and details are required"
    });
  }

  const data = readData();

  const item = {
    id: Math.max(0, ...data.wishlist.map(x => x.id)) + 1,
    name: name.trim(),
    details: details.trim(),
    createdAt: new Date().toISOString()
  };

  data.wishlist.push(item);
  writeData(data);

  res.status(201).json({
    message: "Wishlist item saved successfully",
    item
  });
});

// VERSION 2: Remove an item by ID.
app.delete("/wishlist/:id", (req, res) => {
  if (!requireVersion(2, res)) return;

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "A valid wishlist item ID is required"
    });
  }

  const data = readData();
  const index = data.wishlist.findIndex(
    item => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Wishlist item not found"
    });
  }

  const removed = data.wishlist.splice(index, 1)[0];
  writeData(data);

  res.json({
    message: "Wishlist item removed successfully",
    item: removed
  });
});

// VERSION 3: View all saved wishlist items.
app.get("/wishlist", (req, res) => {
  if (!requireVersion(3, res)) return;

  const data = readData();

  res.json({
    count: data.wishlist.length,
    wishlist: data.wishlist
  });
});

// Unknown endpoints.
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Wishlist System ${VERSION} running on port ${PORT}`
  );
});