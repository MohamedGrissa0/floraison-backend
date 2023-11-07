const express = require('express');
const router = express.Router();
const { PfiniModel, NlotModel } = require("../Models/Pfini.js");
const { PfinidModel, NlotdModel } = require("../Models/Depot.js");
router.post("/add-Dechet", async (req, res) => {
  try {
    const { nlot, date, entreDechet, source, destination } = req.body;
    console.log(req.body);
console.log(typeof(entreDechet))
console.log(entreDechet)
console.log(typeof(nlot))
console.log(nlot)
if (!source || !destination ) {
  return res.status(400).json({ error: "Source, Destination, and Type are required" });
}

if (source !== "floraison administration" && destination !== "floraison administration") {
  return res.status(400).json({ error: "Floraison Administration Obligatoire Source or Destination" });
}
if (source === destination) {
  return res.status(400).json({ error: "Source/Destination Error" });
}
if (entreDechet <= 0) {
  return res.status(400).json({ error: "Invalid Quantity" });
}
    const nlotDocument = await NlotModel.findOne({ Nlot: nlot });

    if (!nlotDocument) {
      return res.status(404).json({ error: "Nlot not found" });
    }

    const formattedDateTime = new Date().toISOString().split('T')[0];

    // Check if an entry with the same source and destination already exists for the given date
    const existingEntry = nlotDocument.dailydechet.find((entry) =>
      entry.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0] &&
      entry.source === source &&
      entry.destination === destination
    );

    if (existingEntry) {
      // Update the existing entry
      if (source === "floraison administration") {
        // If source is "floraison administration," update as sortie
        existingEntry.sortie = parseInt(entreDechet);
      } else {
        // Otherwise, update as entre
        existingEntry.entre = parseInt(entreDechet);
      }
      existingEntry.DateNow = formattedDateTime;
    } else {
      // Create a new entry with a unique source and destination
      const newEntry = {
        date: new Date(date),
        DateNow: formattedDateTime,
        entre: source !== "floraison administration" ? Math.max(parseInt(entreDechet), 0) : 0,
        sortie: source === "floraison administration" ? Math.max(parseInt(entreDechet), 0) : 0,
        source: source,
        destination: destination,
      };

      nlotDocument.dailydechet.push(newEntry);
    }

    // Calculate total entre and total sortie for dailydechet
    const totalEntres = nlotDocument.dailydechet.reduce((total, entry) => total + (entry.entre || 0), 0);
    const totalSorties = nlotDocument.dailydechet.reduce((total, entry) => total + (entry.sortie || 0), 0);

    // Update totalDechet, Stockfini, and other fields
    nlotDocument.totalDechet = totalEntres - totalSorties;

    await nlotDocument.save();

    // Update the corresponding Pfini document if it exists
    const pfiniDocument = await PfiniModel.findOne({ CodeArticle: nlotDocument.CodeArticle });

    if (pfiniDocument) {
      const nlotIndexInPfini = pfiniDocument.nlots.findIndex((nl) => nl.Nlot === nlotDocument.Nlot);

      if (nlotIndexInPfini !== -1) {
        pfiniDocument.nlots[nlotIndexInPfini] = nlotDocument;
        await pfiniDocument.save();
      }
    }

    res.status(200).json({ message: "Entries added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // Return the error message
  }
});


router.get("/allnlots", async (req, res) => {
  try {
    const all = []; // Initialize an empty array

    const nlots = await NlotModel.find({}); // Query the Nlot collection to get all Nlots

    nlots.forEach((nlot) => {
      all.push(nlot.Nlot);
    });

    res.status(200).json(all); // Return the 'all' array as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

;


// Define a new route with a different URL endpoint, for example, /bon2
// Route to get a specific daily entry
router.get('/bon', async (req, res, next) => {
  try {
    const { date, source, destination } = req.query;

    if (!date || !source || !destination) {
      return res.status(400).json({ error: 'Date, source, and destination are required.' });
    }

    // Query the NlotModel to find dailyEntries matching the date, source, and destination
    const dailyEntries = await NlotModel.find({
      'dailyEntries.date': new Date(date),
      'dailyEntries.source': source,
      'dailyEntries.destination': destination,
    }, {
      'dailyEntries.$': 1, // Projection to select only the matching dailyEntry
      Nlot: 1, // Select the Nlot field
      CodeArticle: 1, // Select the CodeArticle field
      Designation: 1, // Select the CodeArticle field
      Unite: 1, // Select the CodeArticle field

    });

    if (!dailyEntries || dailyEntries.length === 0) {
      return res.status(404).json({ error: 'No matching daily entries found.' });
    }

    // Send the dailyEntries as a response
    res.status(200).json(dailyEntries);

  } catch (error) {
    console.error('Error fetching daily entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get("/all", async (req, res) => {
  try {
    // Fetch all records from the NlotModel
    const result = await NlotModel.find({});
console.log(result)
    // Return the result as JSON response with a 200 status code
    res.status(200).json(result);
  } catch (error) {
    // Handle errors and return a 500 status code with an error message
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
router.post('/', async (req, res) => {
  try {
    const { Nlot, CodeArticle,Min, Category, NBL, Stockintiale, Fournisseur, Stockfini, DateFabricarion, DateExpiration, dailyEntries } = req.body;
console.log("Min = ", Min)
    // Check if required fields are provided
    if (!Nlot || !CodeArticle) {
      return res.status(400).json({ error: "Please provide required fields" });
    }

    const Pfinid = await PfiniModel.findOne({ CodeArticle });

    if (Pfinid) {
      const NlotFind = await NlotModel.findOne({ Nlot });

      if (!NlotFind) {
        const newNlot = new NlotModel({
          Nlot,
          CodeArticle, // Use the provided CodeArticle
          Category: Pfinid.Category,
          Designation: Pfinid.Designation,
          Unite: Pfinid.Unite,
          NBL,
          Stockintiale,
          Fournisseur,
          Stockfini,
          DateFabricarion,
          DateExpiration,
          dailyEntries,
          Min:Min, 
          itemId:Pfinid._id
        });

        // Save the new Nlot document to the database
        const savedNlot = await newNlot.save();

        // Add the newNlot to the PfiniModel's nlots array
        Pfinid.nlots.push(savedNlot);

        // Save the updated PfiniModel document
        await Pfinid.save();

        res.status(201).json(savedNlot);
      } else {
        res.status(400).json({ error: 'Nlot already exists' });
      }
    } else {
      res.status(404).json({ error: 'Pfini not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating Nlot' });
  }
});






router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id; // Store the parameter in a variable

    if (id !== "pfini" && id !== "mp" && id !== "ticket" && id !== "em") {
      const allPfiniItems = await NlotModel.findOne({ Nlot: id });
      console.log(allPfiniItems)
      res.status(200).json(allPfiniItems);
    } else {
      const allPfiniItems = await NlotModel.find({ Category: id });
      res.status(200).json(allPfiniItems);
      console.log(allPfiniItems)

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});



router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await NlotModel.findByIdAndRemove(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Find the corresponding Pfini documents that have this item in their nlots array
    const pfiniDocuments = await PfiniModel.find({ 'nlots._id': req.params.id });

    if (pfiniDocuments.length > 0) {
      // Remove the deleted item from the nlots array in each Pfini document
      for (const pfini of pfiniDocuments) {
        pfini.nlots = pfini.nlots.filter(item => item._id.toString() !== req.params.id);
        await pfini.save();
      }
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the item' });
  }
});


// Update an Nlot and the corresponding Pfini documents
router.put("/:id", async (req, res) => {
  const itemId = req.params.id;
  const { CodeArticle, Category, Min, Designation, DateFabricarion, DateExpiration, Fournisseur, NBL, Unite, Nlot, Stockintiale } = req.body;

  try {
    const existingItem = await NlotModel.findById(itemId);

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Store the original CodeArticle
    const originalCodeArticle = existingItem.CodeArticle;

    existingItem.Nlot = Nlot ? Nlot : existingItem.Nlot;
    existingItem.CodeArticle = CodeArticle ? CodeArticle : existingItem.CodeArticle;
    existingItem.Designation = Designation ? Designation : existingItem.Designation;
    existingItem.NBL = NBL ? NBL : existingItem.NBL;
    existingItem.Fournisseur = Fournisseur ? Fournisseur : existingItem.Fournisseur;
    existingItem.Unite = Unite ? Unite : existingItem.Unite;
    existingItem.Stockintiale = Stockintiale ? Stockintiale : existingItem.Stockintiale;
    existingItem.DateFabricarion = DateFabricarion ? DateFabricarion : existingItem.DateFabricarion;
    existingItem.DateExpiration = DateExpiration ? DateExpiration : existingItem.DateExpiration;

    existingItem.Min = Min ? Min : existingItem.Min;

    // Update the Nlot document
    const updatedItem = await existingItem.save();

    // Check if the CodeArticle has been changed
    if (originalCodeArticle !== CodeArticle) {
      // Find the corresponding Pfini document based on the updated CodeArticle
      const existingPfini = await PfiniModel.findOne({ CodeArticle: CodeArticle });
      const Nlot = await NlotModel.findOne({ CodeArticle: CodeArticle });
    

      if (existingPfini) {
        Nlot.itemId = existingPfini._id
        Nlot.CodeArticle = existingPfini.CodeArticle
        Nlot.Designation = existingPfini.Designation
        await Nlot.save()
        // Add the updated Nlot to the new Pfini's nlots array
        existingPfini.nlots.push(Nlot);
        await existingPfini.save();
      }

      // Find and remove the Nlot from the old Pfini's nlots array
      const originalPfini = await PfiniModel.findOne({ CodeArticle: originalCodeArticle });

      if (originalPfini) {
        const index = originalPfini.nlots.findIndex((item) => item._id.toString() === itemId);

        if (index !== -1) {
          originalPfini.nlots.splice(index, 1);
          await originalPfini.save();
        }
      }
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});







router.get("/all", async (req, res) => {
  try {
    const result = await NlotModel.find({})



    res.status(200).json(result);
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});



router.get("/get-daily-entries/:nlot", async (req, res) => {
  try {
    const { nlot } = req.params;

    // Find the Nlot document by its Nlot value
    const nlotDocument = await NlotModel.findOne({ Nlot: nlot });

    if (nlotDocument) {
      // Extract the dailyEntries array from the Nlot document
      const dailyEntries = nlotDocument.dailyEntries;

      res.status(200).json({ dailyEntries });
    } else {
      res.status(404).json({ message: "Nlot not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/get-daily-dechet/:nlot", async (req, res) => {
  try {
    const { nlot } = req.params;

    // Find the Nlot document by its Nlot value
    const nlotDocument = await NlotModel.findOne({ Nlot: nlot });

    if (nlotDocument) {
      // Extract the dailyEntries array from the Nlot document
      const dailyEntries = nlotDocument.dailydechet;
console.log(dailyEntries)
      res.status(200).json({ dailyEntries });
    } else {
      res.status(404).json({ message: "Nlot not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/", async (req, res) => {
  try {
    const currentDateTime = new Date();
    const formattedDateTime = currentDateTime.toLocaleString(); // Ad
    const { nlot, date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Please provide a date parameter" });
    }

    const selectedDate = new Date(date);

    if (nlot) {
      const nlotItem = await NlotModel.findOne({ Nlot: nlot });

      if (!nlotItem) {
        return res.status(404).json({ message: "Nlot not found" });
      }

      const entry = nlotItem.dailyEntries.find(
        (entry) => entry.date.toDateString() === selectedDate.toDateString()
      );

      if (!entry) {
        return res.status(404).json({ message: "No data found for the selected date" });
      }

      const selectedData = {
        Nlot: nlotItem.Nlot, // Add Nlot code
        article: nlotItem.CodeArticle, // Add article
        dateFabrication: nlotItem.DateFabricarion, // Add date of fabrication
        expedition: nlotItem.DateExpiration, // Add expedition
        entre: entry.entre,
        sortie: entry.sortie,
        source: entry.source,
        destination: entry.destination,
        DateNow: formattedDateTime,

      };
      res.status(200).json(selectedData);
    } else {
      const allNlots = await NlotModel.find({});
      const result = [];

      for (const nlotItem of allNlots) {
        const entry = nlotItem.dailyEntries.find(
          (entry) => entry.date.toDateString() === selectedDate.toDateString()
        );

        if (entry) {
          result.push({
            Nlot: nlotItem.Nlot,
            CodeArticle: nlotItem.CodeArticle,
            DateFabricarion: nlotItem.DateFabricarion,
            DateExpiration: nlotItem.DateExpiration,
            entre: entry.entre,
            sortie: entry.sortie,
            source: entry.source,
            destination: entry.destination,
            DateNow: formattedDateTime

          });
        }
      }

      res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


router.post("/add-entries", async (req, res) => {
  try {
    const { nlot, date, Quantity, source, destination, type } = req.body;


    if (!source || !destination || !type) {
      return res.status(400).json({ error: "Source, Destination, and Type are required" });
    }

    if (source !== "floraison administration" && destination !== "floraison administration") {
      return res.status(400).json({ error: "Floraison Administration Obligatoire Source or Destination" });
    }
    if (source === destination) {
      return res.status(400).json({ error: "Source/Destination Error" });
    }
    if (Quantity <= 0) {
      return res.status(400).json({ error: "Invalid Quantity" });
    }

    const nlotDocument = await NlotModel.findOne({ Nlot: nlot });

    if (!nlotDocument) {
      return res.status(404).json({ error: "Nlot not found" });
    }

    // Check if an entry with the same source and destination already exists for the given date
    const existingEntryIndex = nlotDocument.dailyEntries.findIndex(
      (entry) =>
        entry.date.toDateString() === new Date(date).toDateString() &&
        entry.source === source &&
        entry.destination === destination &&
        entry.type === type
    );

    const formattedDateTime = new Date().toISOString().split('T')[0];

    if (existingEntryIndex !== -1) {
      // Update the existing entry
      const existingEntry = nlotDocument.dailyEntries[existingEntryIndex];

      if (source === "floraison administration") {
        // If source is "floraison administration," update as sortie
        existingEntry.sortie = Quantity ? parseInt(Quantity) : 0;
      } else {
        // Otherwise, update as entre
        existingEntry.entre = Quantity ? parseInt(Quantity) : 0;
      }

      existingEntry.DateNow = formattedDateTime;
      const filteredDailyEntries = nlotDocument.iventoryDate
        ? nlotDocument.dailyEntries.filter((entry) => entry.date >= nlotDocument.iventoryDate)
        : nlotDocument.dailyEntries;

      // Calculate total entres and total sorties
      const totalEntres = filteredDailyEntries.reduce((total, entry) => total + (entry.entre || 0), 0);
      const totalSorties = filteredDailyEntries.reduce((total, entry) => total + (entry.sortie || 0), 0);

      // Update total entres and total sorties
      nlotDocument.totalEntres = totalEntres;
      nlotDocument.totalSorties = totalSorties;
      nlotDocument.Consommation = totalSorties;

      // Update StockfiniInitial
      nlotDocument.StockfiniInitial = nlotDocument.Stockintiale + nlotDocument.totalEntres - nlotDocument.totalSorties;
    } else {
      // Check if the date is under the iventoryDate
      const iventoryDate = nlotDocument.iventoryDate;
      const newEntryDate = new Date(date);

      if (!iventoryDate || newEntryDate >= iventoryDate) {
        // Create a new entry with a unique source and destination
        const newEntry = {
          date: date,
          DateNow: formattedDateTime,
          source: source,
          destination: destination,
          type: type
        };

        if (source === "floraison administration") {
          // If source is "floraison administration," add as sortie
          newEntry.sortie = Quantity ? parseInt(Quantity) : 0;
        } else {
          // Otherwise, add as entre
          newEntry.entre = Quantity ? parseInt(Quantity) : 0;
        }

        nlotDocument.dailyEntries.push(newEntry);
        nlotDocument.save()
        const filteredDailyEntries = nlotDocument.iventoryDate
          ? nlotDocument.dailyEntries.filter((entry) => entry.date >= nlotDocument.iventoryDate)
          : nlotDocument.dailyEntries;

        // Calculate total entres and total sorties
        const totalEntres = filteredDailyEntries.reduce((total, entry) => total + (entry.entre || 0), 0);
        const totalSorties = filteredDailyEntries.reduce((total, entry) => total + (entry.sortie || 0), 0);

        // Update total entres and total sorties
        nlotDocument.totalEntres = totalEntres;
        nlotDocument.totalSorties = totalSorties;
        nlotDocument.Consommation = totalSorties;

        // Update StockfiniInitial
        nlotDocument.StockfiniInitial = nlotDocument.Stockintiale + totalEntres - totalSorties;
      } else if (iventoryDate && newEntryDate <= iventoryDate) {
        // Create a new entry and update stock values
        const newEntry = {
          date: date,
          DateNow: formattedDateTime,
          source: source,
          destination: destination,
          type: type
        };

        if (source === "floraison administration") {
          // If source is "floraison administration," add as sortie
          newEntry.sortie = Quantity ? parseInt(Quantity) : 0;
        } else {
          // Otherwise, add as entre
          newEntry.entre = Quantity ? parseInt(Quantity) : 0;
        }

        nlotDocument.dailyEntries.push(newEntry);
        await nlotDocument.save()

        // Recalculate inventory
        const filteredDailyEntries = nlotDocument.iventoryDate
          ? nlotDocument.dailyEntries.filter((entry) => entry.date >= nlotDocument.iventoryDate)
          : nlotDocument.dailyEntries;

        // Calculate total entres and total sorties
        const totalEntres = filteredDailyEntries.reduce((total, entry) => total + (entry.entre || 0), 0);
        const totalSorties = filteredDailyEntries.reduce((total, entry) => total + (entry.sortie || 0), 0);
        var si = 0
        if (source === "floraison administration") {
          si = nlotDocument.Stockintiale - Quantity

        }
        else {
          si = nlotDocument.Stockintiale + Quantity

        }
        // Update total entres and total sorties
        nlotDocument.totalEntres = totalEntres;
        nlotDocument.totalSorties = totalSorties;
        nlotDocument.Consommation = totalSorties;
        nlotDocument.Stockintiale = si
        // Update StockfiniInitial
        nlotDocument.StockfiniInitial = si + totalEntres - totalSorties;
      } else {
        return res.status(400).json({ message: "Cannot add entry before inventory date" });
      }
    }

    await nlotDocument.save();

    // Update the corresponding Pfini document
    const pfiniDocument = await PfiniModel.findOne({ CodeArticle: nlotDocument.CodeArticle });

    if (pfiniDocument) {
      const nlotIndexInPfini = pfiniDocument.nlots.findIndex((nl) => nl.Nlot === nlotDocument.Nlot);

      if (nlotIndexInPfini !== -1) {
        pfiniDocument.nlots[nlotIndexInPfini] = nlotDocument;
        await pfiniDocument.save();
      }
    }

    res.status(200).json({ message: "Entries added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});






const updateInventoryMiddleware = async (req, res, next) => {
  try {
    const { id, date } = req.params;

    // Find the specific Nlot document by its ID and date
    const nlot = await NlotModel.findOne({ Nlot: id });

    if (!nlot) {
      return res.status(404).json({ message: "Nlot not found" });
    }

    // Update the Stockintiale by adding the current Stockfini value
    nlot.Stockintiale = nlot.Stockintiale + nlot.StockfiniInitial;
    nlot.iventoryDate = date ? new Date(date).toISOString().split('T')[0] : null;

    await nlot.save()
    const iventoryDate = nlot.iventoryDate;
    const filteredDailyEntries = iventoryDate
      ? nlot.dailyEntries.filter((entry) => entry.date >= iventoryDate)
      : nlot.dailyEntries; // Corrected this line

    const totalEntres = filteredDailyEntries.reduce(
      (total, entry) => total + (entry.entre || 0),
      0
    );
    const totalSorties = filteredDailyEntries.reduce(
      (total, entry) => total + (entry.sortie || 0),
      0
    );
    // Update totalEntres and totalSorties
    nlot.totalEntres = totalEntres;
    nlot.totalSorties = totalSorties;
    nlot.Consommation = totalSorties;
    nlot.StockfiniInitial = totalEntres - totalSorties;

    // Save the updated Nlot document
    await nlot.save();

    // Update the corresponding Pfini document
    const pfini = await PfiniModel.findOne({ CodeArticle: nlot.CodeArticle });

    if (pfini) {
      const nlotIndex = pfini.nlots.findIndex((nl) => nl.Nlot === nlot.Nlot);

      if (nlotIndex !== -1) {
        pfini.nlots[nlotIndex] = nlot;
        await pfini.save();
      }
    }

    res.status(200).json({ message: "Inventory updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the inventory" });
  }
};

// Use the middleware in your route handler
router.post("/inventory/:id/:date", updateInventoryMiddleware, (req, res) => {
  // This code will be executed after the middleware
  // You can add additional handling here if needed
});









module.exports = router;
