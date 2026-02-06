import iPad from "../../../assets/images/ipad.jpg";
import Banana from "../../../assets/images/banana.png";

export const mlPredictionItems = [
  {
    id: 1,
    name: "iPad",
    category: "Electronics",
    currentStock: 5,
    recommendedStock: 10,
    predictedDemand: 5,
    image: iPad,
    seasonality: "Normal Season",
    events: "None",
    salesTrend: "Stable",
    weatherImpact: "Neutral",
  },
  {
    id: 2,
    name: "Organic Banana Pack",
    category: "Food & Drink",
    currentStock: 5,
    recommendedStock: 10,
    predictedDemand: 5,
    image: Banana,
    seasonality: "High Season",
    events: "Festival",
    salesTrend: "Rising",
    weatherImpact: "Neutral",
  },
];
