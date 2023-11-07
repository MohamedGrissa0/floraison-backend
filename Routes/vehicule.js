const express = require("express");
const router = express.Router();
const vehicule = require("../Models/Vechicule");

// Get all vehicule entries
router.get('/', async (req, res) => {
  try {
    const savedvehicule = await vehicule.find();
    res.status(200).json(savedvehicule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching vehicule entries' });
  }
});

;

// Add a new vehicule entry
router.post("/", async (req, res) => {
  try {
    const { Name } = req.body;
    const newvehicule = await vehicule.create({ Name, }); // Create and save in one step
    res.status(201).json(newvehicule); // Use 201 status code for revehicule creation
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the vehicule entry" });
  }
});

// Update an existing vehicule entry by ID
router.put("/:id", async (req, res) => {
  try {
    const { Name } = req.body;
    const updatedvehicule = await vehicule.findByIdAndUpdate(
      req.params.id,
      { Name, },
      { new: true }
    );
    if (!updatedvehicule) {
      return res.status(404).json({ message: "vehicule entry not found" });
    }
    res.json(updatedvehicule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the vehicule entry" });
  }
});

// Delete an existing vehicule entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedSource = await vehicule.deleteOne({Name:req.params.id});
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
