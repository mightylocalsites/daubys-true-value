/**
 * Curated marketing content for Dauby's True Value Hardware (Tell City, IN).
 * Homepage copy from https://daubyshardware.com/
 */

export type Department = {
  icon: string;
  name: string;
  body: string;
  brands: string[];
};

export const siteTagline =
  "Dedicated to Providing Quality Tools and Supplies for Your Project";

export const departmentsIntro =
  "Paint, electrical, plumbing, tools, and the everyday hardware Tell City counts on.";

/** Homepage highlight set — fast scanning, icon-led. */
export const homeDepartments: { icon: string; name: string }[] = [
  { icon: "fa-solid fa-fill-drip", name: "Paint & Supplies" },
  { icon: "fa-solid fa-bolt", name: "Electrical" },
  { icon: "fa-solid fa-faucet-drip", name: "Plumbing Supplies" },
  { icon: "fa-solid fa-screwdriver-wrench", name: "Tools" },
];

export const departments: Department[] = [
  {
    icon: "fa-solid fa-fill-drip",
    name: "Paint & Supplies",
    body: "Brushes, rollers, caulk, and quality paints for every project — plus color matching and mixing at the counter.",
    brands: ["Valspar", "Rust-Oleum", "Purdy", "3M"],
  },
  {
    icon: "fa-solid fa-bolt",
    name: "Electrical",
    body: "Wire, outlets, switches, bulbs, and the electrical supplies you need for home and shop work.",
    brands: ["Southwire", "Leviton", "GE"],
  },
  {
    icon: "fa-solid fa-faucet-drip",
    name: "Plumbing Supplies",
    body: "PVC and galvanized fittings, brass and copper, and everyday plumbing parts for repairs and upgrades.",
    brands: ["SharkBite", "Charlotte Pipe", "Oatey"],
  },
  {
    icon: "fa-solid fa-screwdriver-wrench",
    name: "Tools",
    body: "Hand tools, power tools, and specialty items for contractors and weekend DIYers.",
    brands: ["DEWALT", "Milwaukee", "Stanley", "Klein Tools"],
  },
];

export type Service = {
  icon: string;
  title: string;
  body: string;
};

export const services: Service[] = [
  {
    icon: "fa-solid fa-key",
    title: "Lock Rekeying",
    body: "Fast, accurate lock rekeying for house and automotive — get the security you need without replacing the whole lock.",
  },
  {
    icon: "fa-solid fa-clipboard-list",
    title: "Special Ordering",
    body: "Can't find it on the shelf? Tell us what you need and our team will locate it and have it ready as quickly as possible.",
  },
  {
    icon: "fa-solid fa-palette",
    title: "Paint Matching & Mixing",
    body: "Bring in a sample or color code and we'll mix the right paint for your project at the counter.",
  },
];
