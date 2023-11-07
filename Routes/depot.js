const express = require('express');
const {PfinidModel,NlotdModel} = require("../Models/Depot.js");
const router = express.Router();



router.post("/", async (req, res) => {
  try {
    const newPfiniData = req.body;
    const CodeArticle = req.body.CodeArticle;

    const existingPfini = await PfinidModel.findOne({ CodeArticle: CodeArticle });

    if (existingPfini) {
      // Item already exists, send a 409 (Conflict) status
      return res.status(409).json({ message: "Item Already Exists" });
    }

    const newPfini = new PfinidModel(newPfiniData);

    // Save the new document to the database
    await newPfini.save();

    res.status(201).json({ message: "New Pfini item created successfully", pfini: newPfini });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.get('/searchNlots', async (req, res) => {
  try {
    const { term } = req.query;

    // Query your Mongoose model to search for Nlots based on the search term
    const nlots = await NlotdModel.find({ Nlot: { $regex: term, $options: 'i' } }); // Case-insensitive search

    res.json(nlots);
  } catch (error) {
    console.error('Error searching Nlots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const allPfiniItems = await PfinidModel.find({ Category: req.params.id });
    res.status(200).json(allPfiniItems);
    console.log(allPfiniItems)

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

  



// Delete a Pfini by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await PfinidModel.findById(req.params.id);
   
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }


    // Delete the related items in NlotdModel with the same CodeArticle
    await NlotdModel.deleteMany({ CodeArticle: deletedItem.CodeArticle });

    // Now, delete the item from PfinidModel
    await PfinidModel.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the item' });
  }
});








router.get("/getbydate", async (req, res) => {
try {
  const { nlot, date } = req.query;

  const pfiniItem = await Pfini.findOne({ Nlot: nlot });
  if (!pfiniItem) {
    return res.status(404).json({ message: "Pfini item not found" });
  }

  const selectedDate = new Date(date);
  const entry = pfiniItem.dailyEntries.find(
    (entry) => entry.date.toDateString() === selectedDate.toDateString()
  );

  if (!entry) {
    return res.status(404).json({ message: "No data found for the selected date" });
  }

  const selectedData = {
    entre: entry.entre,
    sortie: entry.sortie,
  };

  res.status(200).json(selectedData);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "An error occurred while fetching data" });
}
});


const handleUpdate = async (req, res) => {
try {
  const itemId = req.params.id;
  const {
    CodeArticle,
    Designation,
    Unite,
    Min,
  } = req.body;

  // Validate the item ID
  if (!itemId) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  // Fetch the existing item by ID
  const existingItem = await PfinidModel.findById(itemId);

  // Check if the item exists
  if (!existingItem) {
    return res.status(404).json({ error: 'Item not found' });
  }

  // Update PfinidModel
  if (CodeArticle) {
    existingItem.CodeArticle = CodeArticle;
  }
  if (Designation) {
    existingItem.Designation = Designation;
  }
  if (Unite) {
    existingItem.Unite = Unite;
  }
  if (Min) {
    existingItem.Min = Min;
  }

  // Save the updated PfinidModel
  const updatedItem = await existingItem.save();

  // Update related NlotdModel and nlots array
  await PfinidModel.updateMany(
    { 'nlots.itemId': itemId },
    {
      $set: {
        'nlots.$.CodeArticle': CodeArticle ? CodeArticle : existingItem.CodeArticle,
        'nlots.$.Designation': Designation ? Designation : existingItem.Designation,
        'nlots.$.Unite': Unite ? Unite : existingItem.Unite,
      },
    }
  );

  // Update the NlotdModel
  await NlotdModel.updateOne(
    { itemId: itemId },
    {
      $set: {
        'CodeArticle': CodeArticle ? CodeArticle : existingItem.CodeArticle,
        'Designation': Designation ? Designation : existingItem.Designation,
        'Unite': Unite ? Unite : existingItem.Unite,
      },
    }
  );

  // Respond with the updated item
  res.status(200).json(updatedItem);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'An error occurred while updating data' });
}
};


// Use the handleUpdate function in your router
router.put('/:id', handleUpdate);

module.exports = router;
