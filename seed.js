// Run this once: node seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB...');

  // ── USERS ──────────────────────────────────────────────
  await User.deleteMany({
    email: { $in: ['customer@demo.com', 'owner@demo.com', 'delivery@demo.com', 'delivery2@demo.com'] }
  });
  console.log('🗑️  Cleared old demo users');

  // NOTE: Plain passwords here — the User model pre-save hook bcrypt-hashes them
  const customer = await User.create({
    name: 'Rahul Sharma',
    email: 'customer@demo.com',
    password: 'demo123',
    role: 'customer',
    phone: '+91 98765 43210',
    address: 'Flat 4B, Banjara Hills, Hyderabad - 500034'
  });

  const delivery = await User.create({
    name: 'Raju Kumar',
    email: 'delivery@demo.com',
    password: 'demo123',
    role: 'delivery',
    phone: '+91 91234 56789',
    isAvailable: true
  });

  const delivery2 = await User.create({
    name: 'Sita Devi',
    email: "delivery2@demo.com",
    password: 'demo123',
    role: 'delivery',
    phone: '+91 80001 22334',
    isAvailable: true
  });

  const owner = await User.create({
    name: 'Chef Priya',
    email: 'owner@demo.com',
    password: 'demo123',
    role: 'owner',
    phone: '+91 99887 76655'
  });

  console.log('👤 Demo users created');

  // ── RESTAURANTS ────────────────────────────────────────
  await Restaurant.deleteMany({});
  console.log('🗑️  Cleared old restaurants');

  const restaurants = [
    {
      name: "Spice Garden",
      cuisine: "Indian",
      description: "Authentic North Indian flavors with a modern twist. Rich curries, tandoori delights.",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
      rating: 4.7, deliveryTime: "25-35 min", minOrder: 150, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Butter Chicken", description: "Creamy tomato curry with tender chicken", price: 280, category: "Main Course", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300" },
        { name: "Paneer Tikka", description: "Grilled cottage cheese marinated in spices", price: 220, category: "Starters", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300" },
        { name: "Dal Makhani", description: "Slow cooked black lentils in creamy butter sauce", price: 180, category: "Main Course", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300" },
        { name: "Garlic Naan", description: "Soft leavened bread with garlic and butter", price: 60, category: "Breads", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300" },
        { name: "Gulab Jamun", description: "Sweet milk dumplings soaked in rose syrup", price: 80, category: "Desserts", image: "https://images.unsplash.com/photo-1666493555664-edf818b4eb4e?w=300" }
      ]
    },
    {
      name: "Pizza Palace",
      cuisine: "Italian",
      description: "Wood-fired authentic Italian pizzas and pasta. Made with imported ingredients since 1998.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
      rating: 4.5, deliveryTime: "20-30 min", minOrder: 200, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Margherita Pizza", description: "Classic tomato base, mozzarella, fresh basil", price: 320, category: "Pizzas", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300" },
        { name: "Pepperoni Pizza", description: "Loaded with premium spicy pepperoni slices", price: 380, category: "Pizzas", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300" },
        { name: "Pasta Carbonara", description: "Creamy egg sauce with bacon and parmesan", price: 290, category: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300" },
        { name: "Garlic Bread", description: "Toasted sourdough with garlic herb butter", price: 120, category: "Sides", image: "https://images.unsplash.com/photo-1619985632461-f33a22de676f?w=300" },
        { name: "Tiramisu", description: "Classic Italian coffee mascarpone dessert", price: 180, category: "Desserts", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300" }
      ]
    },
    {
      name: "Burger Barn",
      cuisine: "American",
      description: "Juicy smash burgers, crispy fries, and thick milkshakes. The American dream on a bun.",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
      rating: 4.6, deliveryTime: "15-25 min", minOrder: 120, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Classic Smash Burger", description: "Double smash patty, cheddar, special burger sauce", price: 250, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300" },
        { name: "Chicken Crispy Burger", description: "Crispy fried chicken thigh with coleslaw", price: 220, category: "Burgers", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=300" },
        { name: "BBQ Bacon Burger", description: "Beef patty, bacon, BBQ sauce, onion rings", price: 290, category: "Burgers", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300" },
        { name: "Loaded Fries", description: "Cheese sauce, jalapeños, crispy bacon bits", price: 160, category: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300" },
        { name: "Chocolate Milkshake", description: "Thick creamy hand-spun chocolate shake", price: 150, category: "Drinks", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300" }
      ]
    },
    {
      name: "Sushi Sakura",
      cuisine: "Japanese",
      description: "Premium fresh sushi, sashimi, and ramen bowls. A taste of Japan in your city.",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600",
      rating: 4.8, deliveryTime: "30-45 min", minOrder: 300, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Salmon Sushi Roll (8 pcs)", description: "Fresh salmon with cucumber and avocado", price: 380, category: "Sushi", image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300" },
        { name: "Dragon Roll", description: "Shrimp tempura topped with avocado slices", price: 420, category: "Sushi", image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300" },
        { name: "Tonkotsu Ramen", description: "Rich pork bone broth with noodles and egg", price: 350, category: "Ramen", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300" },
        { name: "Edamame", description: "Steamed and lightly salted soybeans", price: 120, category: "Starters", image: "https://images.unsplash.com/photo-1548940740-204726a19be3?w=300" },
        { name: "Mochi Ice Cream (3 pcs)", description: "Japanese rice cake with ice cream filling", price: 200, category: "Desserts", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300" }
      ]
    },
    {
      name: "Taco Fiesta",
      cuisine: "Mexican",
      description: "Street-style tacos, burritos, and nachos. Bold authentic flavors from Mexico City.",
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
      rating: 4.4, deliveryTime: "20-30 min", minOrder: 130, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Chicken Tacos (3 pcs)", description: "Grilled chicken, fresh salsa, guacamole, lime", price: 240, category: "Tacos", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300" },
        { name: "Beef Burrito", description: "Flour tortilla stuffed with seasoned beef and rice", price: 280, category: "Burritos", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300" },
        { name: "Loaded Nachos", description: "Tortilla chips, cheese, beans, jalapeños, sour cream", price: 200, category: "Snacks", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300" },
        { name: "Guacamole & Chips", description: "Fresh hand-mashed avocado dip with chips", price: 150, category: "Snacks", image: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=300" },
        { name: "Churros", description: "Crispy fried dough sticks with chocolate dip", price: 130, category: "Desserts", image: "https://images.unsplash.com/photo-1624371414361-e670edf4898f?w=300" }
      ]
    },
    {
      name: "Biryani House",
      cuisine: "Hyderabadi",
      description: "Legendary Hyderabadi dum biryani slow-cooked in sealed handi. Royal flavor of nawabs.",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
      rating: 4.9, deliveryTime: "35-50 min", minOrder: 200, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Chicken Dum Biryani", description: "Aromatic basmati layered with spiced chicken", price: 320, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300" },
        { name: "Mutton Biryani", description: "Tender mutton with saffron-infused long-grain rice", price: 420, category: "Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300" },
        { name: "Veg Dum Biryani", description: "Mixed vegetables cooked in fragrant rice", price: 220, category: "Biryani", image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=300" },
        { name: "Mirchi Ka Salan", description: "Traditional Hyderabadi green chili curry", price: 80, category: "Sides", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300" },
        { name: "Double Ka Meetha", description: "Hyderabadi bread pudding with dry fruits", price: 100, category: "Desserts", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300" }
      ]
    },
    {
      name: "Dragon Palace",
      cuisine: "Chinese",
      description: "Authentic Chinese cuisine from dim sum to Sichuan woks. A culinary voyage to Beijing.",
      image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600",
      rating: 4.3, deliveryTime: "25-40 min", minOrder: 180, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Kung Pao Chicken", description: "Spicy stir-fried chicken with peanuts and chili", price: 260, category: "Main Course", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300" },
        { name: "Dim Sum Platter", description: "Assorted steamed dumplings with dipping sauce", price: 220, category: "Starters", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300" },
        { name: "Hakka Noodles", description: "Stir-fried egg noodles with vegetables", price: 190, category: "Noodles", image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300" },
        { name: "Fried Rice", description: "Wok-tossed rice with egg and vegetables", price: 170, category: "Rice", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300" },
        { name: "Mango Pudding", description: "Silky smooth mango dessert pudding", price: 110, category: "Desserts", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300" }
      ]
    },
    {
      name: "The Waffle House",
      cuisine: "Cafe",
      description: "Gourmet waffles, pancakes, and all-day breakfast. Sweet or savory — we have it all.",
      image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600",
      rating: 4.6, deliveryTime: "15-25 min", minOrder: 100, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Classic Belgian Waffle", description: "Crispy waffle with maple syrup and butter", price: 180, category: "Waffles", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=300" },
        { name: "Nutella Berry Waffle", description: "Waffle topped with Nutella and fresh berries", price: 220, category: "Waffles", image: "https://images.unsplash.com/photo-1491217487049-724da9f4bdc9?w=300" },
        { name: "Eggs Benedict", description: "Poached eggs on English muffin with hollandaise", price: 250, category: "Breakfast", image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=300" },
        { name: "Avocado Toast", description: "Sourdough with smashed avocado and poached egg", price: 200, category: "Breakfast", image: "https://images.unsplash.com/photo-1603046891744-1f8152bb5f26?w=300" },
        { name: "Cappuccino", description: "Rich double espresso with velvety milk foam", price: 120, category: "Drinks", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300" }
      ]
    },
    {
      name: "Shawarma Street",
      cuisine: "Lebanese",
      description: "Authentic Middle Eastern shawarmas, falafel, and hummus wraps. Rolled fresh to order.",
      image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600",
      rating: 4.5, deliveryTime: "15-25 min", minOrder: 100, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Chicken Shawarma Wrap", description: "Rotisserie chicken with garlic sauce and veggies", price: 160, category: "Wraps", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300" },
        { name: "Falafel Wrap", description: "Crispy falafel with tahini, lettuce, tomato", price: 140, category: "Wraps", image: "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=300" },
        { name: "Hummus Platter", description: "Creamy hummus with pita bread and olives", price: 180, category: "Starters", image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=300" },
        { name: "Seekh Kebab (4 pcs)", description: "Spiced minced lamb grilled on skewers", price: 240, category: "Kebabs", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300" },
        { name: "Baklava", description: "Layers of filo pastry, honey, and pistachios", price: 120, category: "Desserts", image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=300" }
      ]
    },
    {
      name: "South Spice",
      cuisine: "South Indian",
      description: "Traditional South Indian breakfast and thali meals. Crispy dosas, fluffy idlis, fragrant sambar.",
      image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600",
      rating: 4.7, deliveryTime: "20-35 min", minOrder: 100, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling", price: 120, category: "Breakfast", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300" },
        { name: "Idli Sambar (4 pcs)", description: "Steamed rice cakes with lentil stew and chutneys", price: 90, category: "Breakfast", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300" },
        { name: "Chettinad Chicken Curry", description: "Fiery South Indian chicken with aromatic spices", price: 280, category: "Main Course", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300" },
        { name: "Rasam", description: "Tangy tamarind and pepper soup", price: 60, category: "Soups", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300" },
        { name: "Filter Coffee", description: "Traditional South Indian decoction coffee with milk", price: 60, category: "Drinks", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300" }
      ]
    },
    {
      name: "Thai Orchid",
      cuisine: "Thai",
      description: "Fragrant Thai curries, pad thai, and tom yum soups. Authentic recipes from Bangkok.",
      image: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600",
      rating: 4.5, deliveryTime: "30-45 min", minOrder: 200, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Green Thai Curry", description: "Aromatic green curry with coconut milk and veggies", price: 260, category: "Curries", image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=300" },
        { name: "Pad Thai", description: "Stir-fried rice noodles with tofu, peanuts, tamarind", price: 240, category: "Noodles", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300" },
        { name: "Tom Yum Soup", description: "Spicy lemongrass prawn soup", price: 200, category: "Soups", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300" },
        { name: "Spring Rolls (6 pcs)", description: "Crispy vegetable rolls with sweet chili dip", price: 160, category: "Starters", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300" },
        { name: "Mango Sticky Rice", description: "Sweet coconut sticky rice with fresh mango", price: 150, category: "Desserts", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300" }
      ]
    },
    {
      name: "Flame & Grill",
      cuisine: "BBQ",
      description: "Slow-smoked BBQ meats, tender ribs, and grilled platters. The ultimate carnivore paradise.",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
      rating: 4.6, deliveryTime: "30-45 min", minOrder: 300, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Smoky BBQ Ribs (Half)", description: "Slow-smoked pork ribs with house BBQ sauce", price: 580, category: "Grills", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300" },
        { name: "Grilled Chicken Platter", description: "Half chicken marinated in herb rub, grilled over flame", price: 380, category: "Grills", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300" },
        { name: "Lamb Chops (3 pcs)", description: "Rosemary-seasoned lamb chops with mint sauce", price: 480, category: "Grills", image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300" },
        { name: "Corn on the Cob", description: "Chargrilled sweet corn with spiced butter", price: 100, category: "Sides", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300" },
        { name: "Cheesecake Slice", description: "Classic New York style baked cheesecake", price: 180, category: "Desserts", image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=300" }
      ]
    },
    {
      name: "Noodle Box",
      cuisine: "Pan-Asian",
      description: "Big bowls of noodles, wonton soups, and fried rice from across Asia. Bold and slurpy.",
      image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600",
      rating: 4.4, deliveryTime: "20-30 min", minOrder: 150, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Singapore Noodles", description: "Thin rice noodles with curry powder and prawns", price: 240, category: "Noodles", image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=300" },
        { name: "Wonton Soup", description: "Pork wontons in clear aromatic broth", price: 200, category: "Soups", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300" },
        { name: "Pho Bo", description: "Vietnamese beef pho with rice noodles and herbs", price: 260, category: "Noodles", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300" },
        { name: "Gyoza (6 pcs)", description: "Pan-fried Japanese dumplings with ponzu sauce", price: 180, category: "Starters", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300" },
        { name: "Thai Iced Tea", description: "Sweet spiced iced tea with condensed milk", price: 90, category: "Drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300" }
      ]
    },
    {
      name: "The Dessert Lab",
      cuisine: "Desserts",
      description: "Artisan ice creams, gelato, crepes, and decadent desserts made fresh daily.",
      image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600",
      rating: 4.8, deliveryTime: "20-30 min", minOrder: 100, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Molten Lava Cake", description: "Warm chocolate cake with gooey center + ice cream", price: 180, category: "Cakes", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300" },
        { name: "Gelato Cup (2 scoops)", description: "Choice of 20 artisan gelato flavors", price: 150, category: "Ice Cream", image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300" },
        { name: "Nutella Crepe", description: "Thin French crepe filled with Nutella and banana", price: 160, category: "Crepes", image: "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=300" },
        { name: "Waffle Sundae", description: "Waffle with 3 scoops ice cream and toppings", price: 240, category: "Waffles", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=300" },
        { name: "Macaron Box (6)", description: "Assorted French macarons in seasonal flavors", price: 200, category: "Pastries", image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=300" }
      ]
    },
    {
      name: "Healthy Bowl Co.",
      cuisine: "Healthy",
      description: "Nutritious poke bowls, salads, smoothie bowls, and wraps. Eat good, feel amazing.",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
      rating: 4.6, deliveryTime: "15-25 min", minOrder: 150, isOpen: true,
      ownerId: owner._id,
      menu: [
        { name: "Salmon Poke Bowl", description: "Fresh salmon, brown rice, edamame, avocado, ponzu", price: 350, category: "Bowls", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300" },
        { name: "Quinoa Buddha Bowl", description: "Quinoa, roasted veggies, chickpeas, tahini dressing", price: 280, category: "Bowls", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300" },
        { name: "Acai Smoothie Bowl", description: "Thick acai blend topped with granola and fresh fruits", price: 220, category: "Smoothie Bowls", image: "https://images.unsplash.com/photo-1490323914169-4b7b66e90dc7?w=300" },
        { name: "Grilled Chicken Wrap", description: "Low-cal wrap with grilled chicken, greens, hummus", price: 240, category: "Wraps", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300" },
        { name: "Green Detox Juice", description: "Cold-pressed kale, cucumber, apple, ginger, lemon", price: 120, category: "Drinks", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300" }
      ]
    }
  ];

  await Restaurant.insertMany(restaurants);
  console.log(`🏪 ${restaurants.length} restaurants seeded`);

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║      ✅  SEED COMPLETE — YUMMY APP       ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  🛍️  Customer : customer@demo.com        ║');
  console.log('║  🏪  Owner    : owner@demo.com           ║');
  console.log('║  🛵  Delivery : delivery@demo.com        ║');
  console.log('║  🔑  Password : demo123 (all accounts)   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
