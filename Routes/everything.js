 /*router.post('/', async (req, res) => {
    try {
      const {
        Nlot,
        CodeArticle,
        Designation,
        Category,
        Stockintiale,
        Unite,
        entre,
        sortie,
        DateFabricarion,
        DateExpiration,
      } = req.body;
  
      // Calculate Consommation based on items with the same Nlot
      
  
      const newPfini = new Pfini({
        Nlot,
        CodeArticle,
        Designation,
        Category,
        Unite,
        entre,
        sortie,
        DateFabricarion,
        DateExpiration,
        Stockintiale:Stockintiale , // You might need to adjust this logic based on your use case
        Stockfini: entre - sortie, // Adjust this as well
      });
  
      await newPfini.save();
      const itemsWithSameNlot = await Pfini.find({ Nlot });
      const consommation = itemsWithSameNlot.reduce((sum, item) => sum + item.sortie, 0);
      // Update Consommation for existing items with the same Nlot
      await Pfini.updateMany({ Nlot }, { $set: { Consommation: consommation } });
  
      res.status(201).json({ message: 'Pfini item created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the Pfini item' });
    }
  });
  */

  router.post("/:itemId", async (req, res) => {
    try {
      const itemId = req.params.itemId;
      const pfiniData = req.body;
  
      // Fetch the existing item by its ID
      const existingPfini = await Pfini.findById(itemId);
  
      // Find other entries with the same Nlot
      const entriesWithSameNlot = await Pfini.find({ Nlot: existingPfini.Nlot });
  
      // Calculate the change in entre values
      const entreChange = pfiniData.sortie - existingPfini.sortie;
  
      // Update the existing item's fields
      existingPfini.Nlot = pfiniData.Nlot || existingPfini.Nlot;
      existingPfini.CodeArticle = pfiniData.CodeArticle || existingPfini.CodeArticle;
      // ... Update other fields similarly ...
      existingPfini.DateExpiration = pfiniData.DateExpiration || existingPfini.DateExpiration;
  
      // Calculate the new Stockfini based on entre changes
      existingPfini.Stockfini += entreChange;
  
      // Update the entre field with the new value
      existingPfini.sortie = pfiniData.sortie;
  
      // Update the Consommation field of the item
      existingPfini.Consommation += entreChange;
  
      // Save the updated item
      await existingPfini.save();
  
      // Update the Consommation values of other entries with the same Nlot
      const updatePromises = entriesWithSameNlot.map(async (entry) => {
        entry.Consommation += entreChange;
        await entry.save();
      });
      await Promise.all(updatePromises);
  
      res.status(200).json(existingPfini);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  

      
   /* router.post("/", async (req, res) => {
      try {
        const pfiniData = req.body;
        const newPfini = await updatePfiniEntries(pfiniData);
        res.status(201).json(newPfini);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });*/
    



    router.get("/", async (req, res) => {
        try {
          const activePfini = await Pfini.find({ status: { $ne: "archive" } });
          res.json(activePfini);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    });





    router.get("/sayeb", async (req, res) => {
        try {
          const activePfini = await Pfini.find({ status: "accepted"  });
          res.json(activePfini);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
    });




    router.put("/archive/:pfiniid", async (req, res) => {
        try {
          const pfiniid = req.params.pfiniid;
          const pfini = await Pfini.findById(pfiniid);
      
          if (!pfini) {
            return res.status(404).json({ message: "Pfini not found." });
          }
      
          pfini.status = "archive"; // Update Pfini status to "archive"
          await pfini.save();
      
          res.status(200).json({ message: "Pfini status has been archived." });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal Server Error" });
        }
    });