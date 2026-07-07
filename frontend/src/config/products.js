export const PRODUCTS = [
  { id: "20lb", name: "20lb Propane Tank", price: 25, description: "Standard grill & patio" },
  { id: "30lb", name: "30lb Propane Tank", price: 35, description: "RVs & larger setups" },
  { id: "40lb", name: "40lb Propane Tank", price: 45, description: "High-demand use" },
  { id: "forklift", name: "Forklift Tank", price: 40, description: "Commercial & warehouse" },
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function emptyCart() {
  return Object.fromEntries(PRODUCTS.map((p) => [p.id, 0]));
}
