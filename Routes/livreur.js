const express = require("express");
const router = express.Router();
const Livreur = require("../Models/Livreur");

// Get all Livreur entries
router.get('/', async (req, res) => {
  try {
    const savedLivreur = await Livreur.find();
    res.status(200).json(savedLivreur);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching Livreur entries' });
  }
});

;

// Add a new Livreur entry
router.post("/", async (req, res) => {
  try {
    const { Name } = req.body;
    const newLivreur = await Livreur.create({ Name, }); // Create and save in one step
    res.status(201).json(newLivreur); // Use 201 status code for reLivreur creation
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the Livreur entry" });
  }
});

// Update an existing Livreur entry by ID
router.put("/:id", async (req, res) => {
  try {
    const { Name } = req.body;
    const updatedLivreur = await Livreur.findByIdAndUpdate(
      req.params.id,
      { Name, },
      { new: true }
    );
    if (!updatedLivreur) {
      return res.status(404).json({ message: "Livreur entry not found" });
    }
    res.json(updatedLivreur);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the Livreur entry" });
  }
});

// Delete an existing Livreur entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedSource = await Livreur.deleteOne({Name:req.params.id});
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
