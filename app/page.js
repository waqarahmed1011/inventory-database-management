'use client'

import { useEffect, useState } from "react";
import { Box, Modal, Typography, Stack, TextField, Button, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, setDoc, deleteDoc, doc, getDocs, query, getDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemExpiryDate, setItemExpiryDate] = useState("");

  const categories = ["Fruits", "Vegetables", "Dairy", "Meat", "Beverages", "Snacks", "Other"];

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { 
        category: itemCategory, 
        quantity: quantity + itemQuantity, 
        expiryDate: itemExpiryDate 
      });
    } else {
      await setDoc(docRef, { 
        category: itemCategory, 
        quantity: itemQuantity, 
        expiryDate: itemExpiryDate 
      });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity <= itemQuantity) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { 
          category: itemCategory, 
          quantity: quantity - itemQuantity, 
          expiryDate: itemExpiryDate 
        });
      }
    }
    await updateInventory();
  };

  const handleSearch = () => {
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInventory(filtered);
  };

  const handleFilter = () => {
    const filtered = inventory.filter(item => 
      item.category === filterCategory || filterCategory === ""
    );
    setFilteredInventory(filtered);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Box border="1px solid #333" mb={2}>
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto" p={2}>
          {filteredInventory.map(({ name, quantity, category, expiryDate }) => (
            <Box
              key={name}
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              p={2}
            >
              <Box display="flex" flexDirection="column" flex="1">
                <Typography variant="h3" color="#333">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body1" color="#555">
                  Category: {category}
                </Typography>
                <Typography variant="body1" color="#555">
                  Expiry Date: {expiryDate || "N/A"}
                </Typography>
              </Box>
              <Typography variant="h3" color="#333" style={{ marginRight: '20px' }}>
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => addItem(name)}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} mt={2}>
        <Button
          variant="contained"
          onClick={handleOpen}
        >
          Add New Item
        </Button>
        
        <TextField
          variant="outlined"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
        >
          Search
        </Button>

        <FormControl variant="outlined">
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            label="Filter by Category"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleFilter}
        >
          Filter
        </Button>
      </Stack>

      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              variant="outlined"
              label="Item Name"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              variant="outlined"
              label="Quantity"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => {
                setItemQuantity(e.target.value);
              }}
            />
            <TextField
              variant="outlined"
              label="Expiry Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={itemExpiryDate}
              onChange={(e) => {
                setItemExpiryDate(e.target.value);
              }}
            />
            <Button
              variant="contained"
              onClick={() => addItem(itemName)}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
