// dynamically generate products from assets folders
const makeProducts = (categoryFolder, count = 12) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${categoryFolder}-${i + 1}`,
    image: new URL(`../assets/images/${categoryFolder}/Pic${i + 1}.png`, import.meta.url).href,
    name: `Product ${i + 1}`,
    brand: "GoCart",
    price: (Math.random() * 100 + 10).toFixed(2)
  }));

export const productsByCategory = {
  "Food and Drinks": makeProducts("CategoryOne"),
  "Fashion and Clothing": makeProducts("CategoryTwo"),
  "Accessory": makeProducts("CategoryThree"),
  "Skincare and Beauty": makeProducts("CategoryFour"),
  "Books": makeProducts("CategoryFive"),
  "Electronics": makeProducts("CategorySix"),
  "Household": makeProducts("CategorySeven")
};
