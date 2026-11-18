/**
 * Complete 56-Dish Culinary Catalog (Indian Currency ₹ INR)
 * Categories: Breakfast, Lunch, Dinner, Starters, Juices, Milkshakes, Desserts
 */
const MENU_CATALOG = [
  // ==================== 1. BREAKFAST (8 Dishes) ====================
  {
    id: "m-1",
    food_item: "Mysore Masala Dosa & Filter Coffee",
    category: "Breakfast",
    price: 240,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "12m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-2",
    food_item: "Ghee Podi Idli & Medu Vada Platter",
    category: "Breakfast",
    price: 190,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "10m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-3",
    food_item: "Amritsari Chole Bhature Royal",
    category: "Breakfast",
    price: 260,
    diet_type: "Veg",
    priority: "High",
    prep_time: "15m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-4",
    food_item: "Tandoori Aloo Paratha with White Butter & Curd",
    category: "Breakfast",
    price: 210,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "12m",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-5",
    food_item: "Indori Poha & Hot Crispy Jalebi Combo",
    category: "Breakfast",
    price: 170,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "8m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-6",
    food_item: "Rava Onion Green Chilli Uttapam",
    category: "Breakfast",
    price: 220,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "14m",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-7",
    food_item: "Smashed Avocado & Poached Egg Sourdough",
    category: "Breakfast",
    price: 320,
    diet_type: "Non-Veg",
    priority: "Normal",
    prep_time: "12m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-8",
    food_item: "Classic Masala Omelette & Butter Brioche",
    category: "Breakfast",
    price: 195,
    diet_type: "Non-Veg",
    priority: "Low",
    prep_time: "10m",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80",
  },

  // ==================== 2. LUNCH & THALIS (10 Dishes) ====================
  {
    id: "m-9",
    food_item: "Hyderabadi Chicken Dum Biryani",
    category: "Lunch",
    price: 380,
    diet_type: "Non-Veg",
    priority: "High",
    prep_time: "20m",
    rating: 5.0,
    image_url:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-10",
    food_item: "Royal Maharaja Veg Thali (12 Items)",
    category: "Lunch",
    price: 460,
    diet_type: "Veg",
    priority: "High",
    prep_time: "18m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-11",
    food_item: "Lucknowi Mutton Galouti Biryani",
    category: "Lunch",
    price: 490,
    diet_type: "Non-Veg",
    priority: "High",
    prep_time: "22m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-12",
    food_item: "Paneer Tikka Masala & Laccha Paratha",
    category: "Lunch",
    price: 340,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "16m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-13",
    food_item: "24-Hour Slow Cooked Dal Makhani & Jeera Rice",
    category: "Lunch",
    price: 310,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "14m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-14",
    food_item: "Punjabi Rajma Chawal & Amritsari Papad Bowl",
    category: "Lunch",
    price: 250,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "12m",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-15",
    food_item: "Goan Coconut Fish Curry & Steamed Rice",
    category: "Lunch",
    price: 430,
    diet_type: "Non-Veg",
    priority: "Normal",
    prep_time: "18m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-16",
    food_item: "Subz Nizami Handi Veg Dum Biryani",
    category: "Lunch",
    price: 330,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "16m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-17",
    food_item: "South Indian Banana Leaf Sadhya Meal",
    category: "Lunch",
    price: 390,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "15m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-18",
    food_item: "Kadai Chicken & Butter Roti Meal",
    category: "Lunch",
    price: 370,
    diet_type: "Non-Veg",
    priority: "Normal",
    prep_time: "18m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
  },

  // ==================== 3. DINNER & GRILL (10 Dishes) ====================
  {
    id: "m-19",
    food_item: "Butter Chicken & Garlic Naan Combo",
    category: "Dinner",
    price: 420,
    diet_type: "Non-Veg",
    priority: "High",
    prep_time: "18m",
    rating: 5.0,
    image_url:
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-20",
    food_item: "Royal Tandoori Kebab Platter",
    category: "Dinner",
    price: 680,
    diet_type: "Non-Veg",
    priority: "High",
    prep_time: "22m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-21",
    food_item: "Coastal Prawn Malai Curry & Appam",
    category: "Dinner",
    price: 560,
    diet_type: "Non-Veg",
    priority: "High",
    prep_time: "20m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-22",
    food_item: "Truffle Mushroom Risotto",
    category: "Dinner",
    price: 490,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "20m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-23",
    food_item: "Margherita Wood-Fired Pizza",
    category: "Dinner",
    price: 360,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "15m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-24",
    food_item: "Kashmiri Mutton Rogan Josh & Sheermal",
    category: "Dinner",
    price: 540,
    diet_type: "Non-Veg",
    priority: "High",
    prep_time: "24m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-25",
    food_item: "Malai Kofta Shahi & Butter Naan",
    category: "Dinner",
    price: 360,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "17m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-26",
    food_item: "Smoked BBQ Peri-Peri Chicken Pizza",
    category: "Dinner",
    price: 440,
    diet_type: "Non-Veg",
    priority: "Normal",
    prep_time: "16m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-27",
    food_item: "Sizzling Schezwan Hakka Noodles & Manchurian",
    category: "Dinner",
    price: 320,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "14m",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-28",
    food_item: "Grilled Herb Norwegian Salmon Steak",
    category: "Dinner",
    price: 640,
    diet_type: "Non-Veg",
    priority: "High",
    prep_time: "20m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80",
  },

  // ==================== 4. STARTERS & SNACKS (8 Dishes) ====================
  {
    id: "m-29",
    food_item: "Angara Paneer Tikka Sizzler",
    category: "Starters",
    price: 310,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "14m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-30",
    food_item: "Hyderabadi Crispy Chicken 65",
    category: "Starters",
    price: 330,
    diet_type: "Non-Veg",
    priority: "Normal",
    prep_time: "14m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-31",
    food_item: "Bombay Dahi Puri & Sev Batata Chaat",
    category: "Starters",
    price: 180,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "8m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-32",
    food_item: "Crispy Honey Chilli Lotus Stem",
    category: "Starters",
    price: 290,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "12m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-33",
    food_item: "Tandoori Malai Broccoli Florets",
    category: "Starters",
    price: 280,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "13m",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-34",
    food_item: "Artisan Smash Burger & Peri-Peri Fries",
    category: "Starters",
    price: 350,
    diet_type: "Non-Veg",
    priority: "Normal",
    prep_time: "15m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-35",
    food_item: "Hara Bhara Kebab & Mint Dip",
    category: "Starters",
    price: 240,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "12m",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-36",
    food_item: "Jalapeno Cheese Corn Poppers",
    category: "Starters",
    price: 230,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "10m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
  },

  // ==================== 5. FRESH JUICES & MOCKTAILS (7 Dishes) ====================
  {
    id: "m-37",
    food_item: "Ratnagiri Alphonso Mango Fresh Pulp Juice",
    category: "Juices",
    price: 180,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "5m",
    rating: 5.0,
    image_url:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-38",
    food_item: "Chilled Watermelon & Himalayan Mint Cooler",
    category: "Juices",
    price: 150,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "5m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-39",
    food_item: "Cold-Pressed Ruby Pomegranate (Anar) Juice",
    category: "Juices",
    price: 190,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "6m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-40",
    food_item: "Virgin Kala Khatta & Gondhoraj Lime Mojito",
    category: "Juices",
    price: 175,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "5m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-41",
    food_item: "Fresh Valencia Orange & Sweet Lime Mosambi",
    category: "Juices",
    price: 160,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "5m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-42",
    food_item: "Tropical Pineapple Ginger Detox Press",
    category: "Juices",
    price: 165,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "6m",
    rating: 4.7,
    image_url:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-43",
    food_item: "Blue Curacao Citrus Lagoon Sparkler",
    category: "Juices",
    price: 185,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "5m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
  },

  // ==================== 6. MILKSHAKES & COLD BREWS (7 Dishes) ====================
  {
    id: "m-44",
    food_item: "Belgian Dark Chocolate Hazelnut Thickshake",
    category: "Milkshakes",
    price: 240,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "6m",
    rating: 5.0,
    image_url:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-45",
    food_item: "Royal Kesar Badam Pista Thandai Milkshake",
    category: "Milkshakes",
    price: 230,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "6m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-46",
    food_item: "Oreo & KitKat Brownie Mud Freakshake",
    category: "Milkshakes",
    price: 260,
    diet_type: "Veg",
    priority: "High",
    prep_time: "7m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-47",
    food_item: "Mahabaleshwar Strawberry Cheesecake Shake",
    category: "Milkshakes",
    price: 235,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "6m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-48",
    food_item: "Fresh Sitaphal (Custard Apple) Cream Shake",
    category: "Milkshakes",
    price: 245,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "6m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-49",
    food_item: "Chikmagalur Iced Cold Filter Coffee Frappe",
    category: "Milkshakes",
    price: 210,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "5m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-50",
    food_item: "Lotus Biscoff Caramel Gelato Shake",
    category: "Milkshakes",
    price: 270,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "7m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
  },

  // ==================== 7. DESSERTS & SWEETS (6 Dishes) ====================
  {
    id: "m-51",
    food_item: "Saffron Rasmalai & Pistachio Kulfi",
    category: "Desserts",
    price: 220,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "5m",
    rating: 5.0,
    image_url:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-52",
    food_item: "Hot Baked Gulab Jamun with Malai Rabri",
    category: "Desserts",
    price: 190,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "6m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-53",
    food_item: "Sizzling Walnut Fudge Brownie & Vanilla Bean",
    category: "Desserts",
    price: 260,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "8m",
    rating: 4.9,
    image_url:
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-54",
    food_item: "Shahi Gajar Ka Halwa with Cashew Crunch",
    category: "Desserts",
    price: 210,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "6m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-55",
    food_item: "Classic Mascarpone Espresso Tiramisu",
    category: "Desserts",
    price: 280,
    diet_type: "Veg",
    priority: "Normal",
    prep_time: "5m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-56",
    food_item: "Rose Petal & Almond Matka Phirni",
    category: "Desserts",
    price: 185,
    diet_type: "Veg",
    priority: "Low",
    prep_time: "5m",
    rating: 4.8,
    image_url:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
  },
];

function findMenuMetadata(foodItem = "") {
  const q = String(foodItem).trim().toLowerCase();
  const exact = MENU_CATALOG.find(
    (m) => m.food_item.toLowerCase() === q
  );
  if (exact) return exact;

  const partial = MENU_CATALOG.find(
    (m) =>
      m.food_item.toLowerCase().includes(q) ||
      q.includes(m.food_item.toLowerCase())
  );
  if (partial) return partial;

  return {
    category: "Dinner",
    price: 320,
    diet_type: "Veg",
    image_url:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
  };
}

/**
 * Sample / Mock Restaurant Orders for QA Testing & Demo (Indian Currency - INR ₹)
 * Covers every status stage: Pending -> Preparing -> Ready -> Completed / Cancelled
 */
const INITIAL_ORDERS = [
  {
    customer_name: "Aarav Sharma",
    food_item: "Hyderabadi Chicken Dum Biryani",
    quantity: 2,
    status: "Pending",
    table_number: "T-04",
    priority: "High",
    price: 380,
    category: "Lunch",
    diet_type: "Non-Veg",
    image_url:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    notes: "Extra mirchi ka salan, raita, and caramelized onions",
  },
  {
    customer_name: "Priya Nair",
    food_item: "Belgian Dark Chocolate Hazelnut Thickshake",
    quantity: 2,
    status: "Pending",
    table_number: "T-07",
    priority: "Normal",
    price: 240,
    category: "Milkshakes",
    diet_type: "Veg",
    image_url:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    notes: "Top with roasted hazelnuts, less ice",
  },
  {
    customer_name: "Rohan Verma",
    food_item: "Butter Chicken & Garlic Naan Combo",
    quantity: 3,
    status: "Preparing",
    table_number: "T-12",
    priority: "High",
    price: 420,
    category: "Dinner",
    diet_type: "Non-Veg",
    image_url:
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    notes: "Medium spice level, extra butter on garlic naan",
  },
  {
    customer_name: "Sneha Iyer",
    food_item: "Ratnagiri Alphonso Mango Fresh Pulp Juice",
    quantity: 3,
    status: "Preparing",
    table_number: "T-02",
    priority: "Normal",
    price: 180,
    category: "Juices",
    diet_type: "Veg",
    image_url:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80",
    notes: "No added sugar, serve chilled",
  },
  {
    customer_name: "Vikramaditya Rao",
    food_item: "Royal Maharaja Veg Thali (12 Items)",
    quantity: 2,
    status: "Ready",
    table_number: "T-09",
    priority: "High",
    price: 460,
    category: "Lunch",
    diet_type: "Veg",
    image_url:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    notes: "Include hot phulkas and sweet lassi",
  },
  {
    customer_name: "Ananya Deshmukh",
    food_item: "Mysore Masala Dosa & Filter Coffee",
    quantity: 2,
    status: "Ready",
    table_number: "Takeaway",
    priority: "High",
    price: 240,
    category: "Breakfast",
    diet_type: "Veg",
    image_url:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
    notes: "Pack coconut chutney and sambar in separate containers",
  },
  {
    customer_name: "Karthik Subramanian",
    food_item: "Royal Tandoori Kebab Platter",
    quantity: 1,
    status: "Completed",
    table_number: "T-05",
    priority: "Normal",
    price: 680,
    category: "Dinner",
    diet_type: "Non-Veg",
    image_url:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80",
    notes: "Served with roomali roti and smoky mint dip",
  },
  {
    customer_name: "Meera Krishnan",
    food_item: "Saffron Rasmalai & Pistachio Kulfi",
    quantity: 2,
    status: "Completed",
    table_number: "T-01",
    priority: "Low",
    price: 220,
    category: "Desserts",
    diet_type: "Veg",
    image_url:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    notes: "Dessert course, serve chilled",
  },
  {
    customer_name: "Siddharth Malhotra",
    food_item: "Coastal Prawn Malai Curry & Appam",
    quantity: 1,
    status: "Cancelled",
    table_number: "T-11",
    priority: "Normal",
    price: 560,
    category: "Dinner",
    diet_type: "Non-Veg",
    image_url:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    notes: "Customer cancelled due to shellfish allergy",
  },
];

module.exports = {
  MENU_CATALOG,
  INITIAL_ORDERS,
  findMenuMetadata,
};
