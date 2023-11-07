const express = require("express");
const router = express.Router();
const Source = require("../Models/Source");

// Get all Source entries
router.get('/', async (req, res) => {
  try {
    const savedSource = await Source.find();
    res.status(200).json(savedSource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching Source entries' });
  }
});
router.get('/Place/:id', async (req, res) => {
  try {
    const savedSource = await Source.findOne({Name: req.params.id });
    if (savedSource) {
      res.status(200).json(savedSource.Place);
    } else {
      res.status(404).json({ error: 'Source not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching Source entries' });
  }
});
;
router.get('/PlaceD/:id', async (req, res) => {
  try {
    const savedSource = await Source.findOne({Name: req.params.id });
    if (savedSource) {
      res.status(200).json(savedSource.Place);
    } else {
      res.status(404).json({ error: 'Source not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching Source entries' });
  }
});
;

// Add a new Source entry
router.post("/", async (req, res) => {
  try {
    const { Name, Place , Case } = req.body;
    const newSource = await Source.create({ Name, Place,Case }); // Create and save in one step
    res.status(201).json(newSource); // Use 201 status code for resource creation
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the Source entry" });
  }
});

// Update an existing Source entry by ID
router.put("/:id", async (req, res) => {
  try {
    const { Name, Place , Case } = req.body;
    const updatedSource = await Source.findByIdAndUpdate(
      req.params.id,
      { Name, Place,Case },
      { new: true }
    );
    if (!updatedSource) {
      return res.status(404).json({ message: "Source entry not found" });
    }
    res.json(updatedSource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the Source entry" });
  }
});

// Delete an existing Source entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedSource = await Source.deleteOne({Name:req.params.id});
    if (!deletedSource) {
      return res.status(404).json({ message: "Source entry not found" });
    }
    res.json({ message: "Source entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the Source entry" });
  }
});

module.exports = router;
