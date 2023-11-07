const express = require("express");
const router = express.Router();
const Fournisseur = require("../Models/Fournisseur");

// Get all Fournisseur entries
router.get('/', async (req, res) => {
  try {
    const savedFournisseur = await Fournisseur.find();
    res.status(200).json(savedFournisseur);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching Fournisseur entries' });
  }
});

;

// Add a new Fournisseur entry
router.post("/", async (req, res) => {
  try {
    const { Name,Place } = req.body;
    const newFournisseur = await Fournisseur.create({ Name,Place }); // Create and save in one step
    res.status(201).json(newFournisseur); // Use 201 status code for reFournisseur creation
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the Fournisseur entry" });
  }
});

// Update an existing Fournisseur entry by ID
router.put("/:id", async (req, res) => {
  try {
    const { Name,Place } = req.body;
    const updatedFournisseur = await Fournisseur.findByIdAndUpdate(
      req.params.id,
      { Name, Place},
      { new: true }
    );
    if (!updatedFournisseur) {
      return res.status(404).json({ message: "Fournisseur entry not found" });
    }
    res.json(updatedFournisseur);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the Fournisseur entry" });
  }
});

// Delete an existing Fournisseur entry by ID
router.delete("/:id", async (req, res) => {
  try {
    console.log(req.params.id);

    const deletedFournisseur = await Fournisseur.findOneAndDelete({ Name: req.params.id });

    console.log(deletedFournisseur);

    if (!deletedFournisseur) {
      return res.status(404).json({ message: "Fournisseur entry not found or already deleted" });
    }

    res.json({ message: "Fournisseur entry deleted successfully", deletedEntry: deletedFournisseur });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the Fournisseur entry" });
  }
});


router.get('/Place/:id', async (req, res) => {
  try {
    const savedSource = await Fournisseur.findOne({Name: req.params.id });
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
    const savedSource = await Fournisseur.findOne({Name: req.params.id });
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

module.exports = router;
