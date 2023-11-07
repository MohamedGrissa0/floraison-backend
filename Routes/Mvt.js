const express = require("express");
const router = express.Router();
const Mvt = require("../models/Mvt");
const { PfinidModel, NlotdModel } = require("../Models/Depot.js");
const { PfiniModel, NlotModel } = require("../Models/Pfini.js");


router.get("/", async (req, res) => {
  try {
    const savedMvt = await Mvt.find(); // Add 'await' here
    res.status(200).json(savedMvt); // Use 200 status code for success
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching Mvt entries" });
  }
});

// Add a new Mvt entry
router.post("/", async (req, res) => {
  try {
    const { nlot, date, sortieQuantity } = req.body;
    const mvt = await Mvt.create({ nlot, date, sortieQuantity }); // Create and save in one step
    res.status(201).json(mvt); // Use 201 status code for resource creation
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the Mvt entry" });
  }
});


// Update an existing Mvt entry by ID
router.put("/:id", async (req, res) => {
  try {
    const { nlot, date, sortieQuantity } = req.body;
    const updatedMvt = await Mvt.findByIdAndUpdate(
      req.params.id,
      { nlot, date, sortieQuantity },
      { new: true }
    );
    if (!updatedMvt) {
      return res.status(404).json({ message: "Mvt entry not found" });
    }
    res.json(updatedMvt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the Mvt entry" });
  }
});

// Delete an existing Mvt entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedMvt = await Mvt.findByIdAndRemove(req.params.id);
    if (!deletedMvt) {
      return res.status(404).json({ message: "Mvt entry not found" });
    }
    res.json({ message: "Mvt entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the Mvt entry" });
  }
});
router.post("/transfer", async (req, res) => {
  const { nlot, date, sortieQuantity ,source , destination} = req.body;
console.log(source)
  try {
    if (!nlot || !date || isNaN(sortieQuantity) || sortieQuantity <= 0) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    
    // Find the source Nlot
    const sourceNlot = await NlotModel.findOne({ Nlot: nlot });
    if (!sourceNlot) {
      return res.status(404).json({ message: "Source Nlot not found" });
    }

    // Find the target Nlot
    const targetNlot = await NlotdModel.findOne({ Nlot: nlot });
    if (!targetNlot) {
      return res.status(404).json({ message: "Target Nlot not found" });
    }

    // Parse sortieQuantity to ensure it's a valid number
    const parsedSortieQuantity = parseFloat(sortieQuantity);

    // Check if an entry with the same date already exists in the source Nlot's dailyEntries array
    const sourceExistingEntryIndex = sourceNlot.dailyEntries.findIndex(
      (entry) => entry.date.toISOString() === new Date(date).toISOString()
    );

    if (sourceExistingEntryIndex !== -1) {
      // If an entry with the same date exists, update the entre and sortie values of that entry
      sourceNlot.dailyEntries[sourceExistingEntryIndex].entre += parsedSortieQuantity;
      // No need to update sortie as per your comment
    } else {
      // If no entry with the same date exists, create a new entry
      sourceNlot.dailyEntries.push({
        date: new Date(date),
        entre: parsedSortieQuantity,
        sortie: 0,
        source: source,
        destination: destination,
      });
    }

    // Check if an entry with the same date already exists in the target Nlot's dailyEntries array
    const targetExistingEntryIndex = targetNlot.dailyEntries.findIndex(
      (entry) => entry.date.toISOString() === new Date(date).toISOString()
    );

    if (targetExistingEntryIndex !== -1) {
      // If an entry with the same date exists, update the entre and sortie values of that entry
      targetNlot.dailyEntries[targetExistingEntryIndex].sortie += parsedSortieQuantity;
      // No need to update entre as per your comment
    } else {
      // If no entry with the same date exists, create a new entry
      targetNlot.dailyEntries.push({
        date: new Date(date),
        entre: 0,
        sortie: parsedSortieQuantity,
        source: source,
        destination: destination,
      });
    }

    // Update totalEntres and totalSorties for both source and target Nlots
    const updateTotals = (nlot) => {
      const iventoryDate = nlot.iventoryDate;
      const filteredDailyEntries = iventoryDate
        ? nlot.dailyEntries.filter((entry) => entry.date >= iventoryDate)
        : nlot.dailyEntries;

      const totalEntres = filteredDailyEntries.reduce(
        (total, entry) => total + (entry.entre || 0),
        0
      );
      const totalSorties = filteredDailyEntries.reduce(
        (total, entry) => total + (entry.sortie || 0),
        0
      );
      nlot.totalEntres = totalEntres;
      nlot.totalSorties = totalSorties;
    };

    updateTotals(sourceNlot);
    updateTotals(targetNlot);

    await sourceNlot.save();
    await targetNlot.save();

    await Mvt.deleteOne({ nlot: nlot });
console.log(sourceNlot.CodeArticle)
console.log(targetNlot.CodeArticle)

    // Find the corresponding Pfini and Pfinid documents
    const pfiniDocument = await PfiniModel.findOne({ CodeArticle: sourceNlot.CodeArticle });
    const pfinidDocument = await PfinidModel.findOne({ CodeArticle: sourceNlot.CodeArticle });

    if (!pfiniDocument || !pfinidDocument) {
      return res.status(404).json({ message: "Pfini or Pfinid document not found" });
    }

    // Remove the existing sourceNlot from Pfini's nlots array
    pfiniDocument.nlots = pfiniDocument.nlots.filter((n) => n.Nlot !== nlot);

    // Remove the existing targetNlot from Pfinid's nlots array
    pfinidDocument.nlots = pfinidDocument.nlots.filter((n) => n.Nlot !== nlot);

    // Push the updated sourceNlot to Pfini's nlots array
    pfiniDocument.nlots.push(sourceNlot);

    // Push the updated targetNlot to Pfinid's nlots array
    pfinidDocument.nlots.push(targetNlot);

    // Recalculate Pfini and Pfinid totals
    // (You need to implement this logic based on your data structure)

    // Save the updated Pfini and Pfinid documents
    await pfiniDocument.save();
    await pfinidDocument.save();

    return res.status(200).json({ message: "Transfer completed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while processing the request" });
  }
});


module.exports = router;
