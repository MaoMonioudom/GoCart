// -----------------------------
// Category-specific specifications
// -----------------------------
const categorySpecs = {
  CategoryOne: { weight: "500g", expiry: "12/2026" }, // Food & Drinks
  CategoryTwo: { size: ["M", "L", "XL"], fabric: "Cotton" }, // Fashion
  CategoryThree: { material: "Leather", color: "Black" }, // Accessories
  CategoryFour: { volume: "100ml", skinType: "All skin types" }, // Skincare
  CategoryFive: { author: "Unknown Author", pages: 320, language: "English" }, // Books
  CategorySix: { warranty: "1 year", power: "220V" }, // Electronics
  CategorySeven: { material: "Plastic", dimension: "30 x 20 x 10 cm" } // Household
};

// -----------------------------
// Product generator
// -----------------------------
const makeProducts = (categoryFolder, count = 12) =>
  Array.from({ length: count }, (_, i) => {
    const hasPromotion = Math.random() < 0.4;
    const discount = hasPromotion ? [10, 15, 20, 30][Math.floor(Math.random() * 4)] : null;

    const basePrice = Math.random() * 100 + 10;
    const finalPrice = hasPromotion
      ? (basePrice * (1 - discount / 100)).toFixed(2)
      : basePrice.toFixed(2);

    return {
      id: `${categoryFolder}-${i + 1}`,
      name: `Product ${i + 1}`,
      brand: "GoCart",
      description:
        "This is a high-quality product designed for everyday use. Durable, reliable, and carefully selected by GoCart.",
      image: new URL(
        `../../../assets/images/${categoryFolder}/Pic${i + 1}.png`,
        import.meta.url
      ).href,
      price: finalPrice,
      originalPrice: hasPromotion ? basePrice.toFixed(2) : null,
      promotion: hasPromotion ? discount : null,
      specs: categorySpecs[categoryFolder] || {}
    };
  });

// -----------------------------
// Export by category
// -----------------------------
export const productsByCategory = {
  "Food and Drinks": makeProducts("CategoryOne"),
  "Fashion and Clothing": makeProducts("CategoryTwo"),
  "Accessory": makeProducts("CategoryThree"),
  "Skincare and Beauty": makeProducts("CategoryFour"),
  "Books": makeProducts("CategoryFive"),
  "Electronics": makeProducts("CategorySix"),
  "Household": makeProducts("CategorySeven")
};
