'use client'

import { useEffect, useState } from "react";
import { Box, Modal, Typography, Stack, TextField, Button, MenuItem, Select, InputLabel, FormControl, Paper } from "@mui/material";
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
  const [noItemsFound, setNoItemsFound] = useState(false);

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
    setNoItemsFound(filtered.length === 0);
  };

  const handleFilter = () => {
    const filtered = inventory.filter(item => 
      item.category === filterCategory || filterCategory === ""
    );
    setFilteredInventory(filtered);
    setNoItemsFound(filtered.length === 0);
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
      justifyContent="flex-start"
      alignItems="center"
      p={4}
      bgcolor="#8fd4cb"
    >
      <Typography variant="h3" color="white" mb={4}>
        Welcome to the AI Pantry Track App!
      </Typography>

      <Paper elevation={3} style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
        <Box mb={2}>
          <Typography variant="h4" color="primary" textAlign="center">
            Inventory Items
          </Typography>
        </Box>
        <Stack height="300px" spacing={2} overflow="auto">
          {noItemsFound ? (
            <Typography variant="h6" color="error" textAlign="center" width="100%">
              No items found. Maybe you typed it incorrectly?
            </Typography>
          ) : (
            filteredInventory.map(({ name, quantity, category, expiryDate }) => (
              <Paper elevation={1} key={name} style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" flexDirection="column" flex="1">
                  <Typography variant="h5" color="textPrimary">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Category: {category}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Expiry Date: {expiryDate || "N/A"}
                  </Typography>
                </Box>
                <Typography variant="h4" color="textPrimary" style={{ marginRight: '20px' }}>
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => addItem(name)}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => removeItem(name)}
                  >
                    Remove
                  </Button>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2} mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
        >
          Add New Item
        </Button>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
          >
            Search
          </Button>
          <TextField
            variant="outlined"
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFilter}
          >
            Filter
          </Button>
          <FormControl variant="outlined" size="small">
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
        </Stack>
      </Stack>

      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          borderRadius={2}
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="h6" color="textPrimary">Add Item</Typography>
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
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                label="Category"
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
              color="primary"
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
