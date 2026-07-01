export const PRODUCTS = [
  { id: "20lb", name: "20lb Propane Tank", price: 35, description: "Standard grill & patio" },
  { id: "30lb", name: "30lb Propane Tank", price: 45, description: "RVs & larger setups" },
  { id: "40lb", name: "40lb Propane Tank", price: 55, description: "High-demand use" },
  { id: "patio", name: "Patio Heater Tank", price: 65, description: "Outdoor heating" },
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
