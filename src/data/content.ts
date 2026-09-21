/**
 * Marketing content for Dauby's True Value Hardware (Tell City, IN).
 * Copy from https://daubyshardware.com/
 */
import type { MarketingImageKey } from "./images";

export const siteTagline =
  "Dedicated to Providing Quality Tools and Supplies for Your Project";

export const departmentsIntro =
  "Hardware, electrical, tools, paint, plumbing, sporting goods, and seasonal supplies for Tell City and Perry County.";

export const servicesIntro =
  "Quotes and estimates, key cutting, lock rekeying, paint matching, and special ordering from a team that knows the store.";

export const aboutIntro =
  "Your hometown True Value hardware store in Tell City, Indiana — quality tools, supplies, and helpful service for every project.";

export type PageDepartment = {
  icon: string;
  title: string;
  body: string;
  bullets?: string[];
  /** Homepage image tile only — interior pages use icons. */
  homepageImage?: MarketingImageKey;
};

export const departments: PageDepartment[] = [
  {
    icon: "fa-solid fa-store",
    title: "Hardware",
    body: "Our hardware department specializes in various hardware products and tools, including items such as power tools, hand tools, building materials, fasteners, plumbing supplies, electrical components, and gardening equipment. Our Hardware Department also offer services such as key cutting, lock rekeying, and hardware installation assistance. You can find a wide range of items needed for home improvement projects, construction work, maintenance tasks, and DIY projects.",
  },
  {
    icon: "fa-solid fa-bolt",
    title: "Electrical",
    homepageImage: "deptElectrical",
    body: "Stop wasting time searching for the right plug or colored switch online. Dauby's True Value Hardware has what you need, and our friendly, experienced staff members will help you find what you're looking for. A visit to our store is the quickest way to find the parts you need in an emergency. We carry all the most common household electrical products, so you can repair or replace any electrical system easily.",
    bullets: ["Breakers", "Electrical Boxes", "Outside Boxes", "Lightbulbs", "Wiring"],
  },
  {
    icon: "fa-solid fa-screwdriver-wrench",
    title: "Tools",
    homepageImage: "deptTools",
    body: "Dauby's power tool department is a bustling hub of innovation and utility, offering a wide array of tools designed to make tasks easier and more efficient. From cordless drills and impact drivers to circular saws and sanders, the Power Tool department is a haven for DIY enthusiasts, contractors, and professionals alike. With top brands like DeWalt, Milwaukee, Black & Decker, and an array of accessories lining the shelves, customers can find high-quality tools that deliver power, precision, and durability for a variety of projects. Knowledgeable staff members are on hand to provide guidance and expertise, ensuring customers find the right tool for the job every time!",
  },
  {
    icon: "fa-solid fa-fill-drip",
    title: "Paint & Supplies",
    homepageImage: "deptPaint",
    body: "Interior or exterior, gloss, matte or washable, we've got all your painting needs covered. From choosing the best color for your project to selecting the right type of paint to having the proper brushes, rollers, drop cloths, thinners and other tools and equipment to get the job done, we can help you be prepped to paint. Whether it's a small color-matching job or a large, intense project, the right paint can bring new life and brilliant color to walls, furniture, fences and more.",
  },
  {
    icon: "fa-solid fa-faucet-drip",
    title: "Plumbing",
    homepageImage: "deptPlumbing",
    body: "Plumbing jobs can be a challenge, but we can help you make it easier with the right supplies and tools for any size plumbing job. Whether you're fixing a dripping faucet, quieting a leaky toilet, swapping out a showerhead, updating a sink or adding an entire new bathroom to your home, we can help be sure you have everything you need for a successful result. From fixtures to caulks to all the tools to get the job done, we can help meet all your plumbing needs.",
  },
  {
    icon: "fa-solid fa-person-hiking",
    title: "Sporting Goods",
    body: "We are your ultimate adventure companion, offering a diverse range of sporting goods for outdoor enthusiasts. Explore our extensive collection of camping gear, hunting equipment, fishing tackle, and more. From rugged tents to precision firearms, we provide top-notch gear for all your wilderness pursuits. Step into our store and gear up for your next great outdoor expedition!",
  },
  {
    icon: "fa-solid fa-gifts",
    title: "Seasonal & Holiday",
    body: "At the heart of the retail store lies its seasonal and holiday department, a vibrant hub that transforms with the changing seasons and festivities. Bursting with color and creativity, this department orchestrates a symphony of themed displays, from whimsical Halloween decorations to glittering Christmas ornaments. Here, customers are immersed in a sensory journey, where every aisle holds the promise of seasonal delights. Whether it's decking the halls for winter festivities or preparing for summer cookouts, the Seasonal & Holiday Department is a beacon of joy, offering an ever-changing array of products to celebrate life's special moments throughout the year.",
  },
];

/** Homepage featured department tiles (subset of live homepage). */
export const homeDepartments = departments.filter((d) => d.homepageImage);

export type Service = {
  icon: string;
  title: string;
  body: string;
  /** Homepage image tile only — interior pages use icons. */
  homepageImage?: MarketingImageKey;
};

export const services: Service[] = [
  {
    icon: "fa-solid fa-file-invoice-dollar",
    title: "Quotes & Estimates",
    body: "Looking to start a big home renovation project but not sure how much it's going to cost? Our quote and estimate service is here to help! Our experienced professionals will work with you to understand your project needs and provide you with a detailed, accurate quote so you can budget and plan accordingly. Whether you're looking to build a deck, remodel your kitchen, or add a new room, we're here to help. So, why wait? Come see us today and get your free quote and estimate!",
  },
  {
    icon: "fa-solid fa-key",
    title: "Key Cutting",
    body: "Need a spare key for your home, car, or office? Dauby's True Value Hardware has got you covered. With years of experience and state-of-the-art equipment, our skilled technicians can quickly and accurately duplicate any type of key, including high-security and electronic keys. Whether you need a new set of keys for your family members, employees, or just for peace of mind, we've got the tools and expertise to get the job done right. Plus, with our competitive pricing and friendly customer service, you can trust that you're getting the best value for your money. Stop by or give us a call today to take advantage of our key cutting service for a quick and hassle-free solution to your key duplication needs.",
  },
  {
    icon: "fa-solid fa-lock",
    title: "Lock Rekeying",
    homepageImage: "svcLockRekeying",
    body: "Here at Dauby's True Value Hardware we understand the importance of feeling safe and secure in your home. That's why we offer a lock rekeying service that is perfect for those who need to change their locks between ownership, break ins, or anything in between. Our service is not only convenient but also cost-effective, as rekeying is often cheaper than replacing an entire lock. Our team of experts can quickly and efficiently rekey your locks to ensure that you or your tenants are the only ones with access to your property. We also provide a range of high-quality locks and keys if you need them. So, whether you are a homeowner or a tenant, don't hesitate to contact us for all your lock rekeying needs. We have a friendly and knowledgeable staff happy to assist you.",
  },
  {
    icon: "fa-solid fa-palette",
    title: "Paint Matching & Mixing",
    body: "Our paint matching and mixing service can be a valuable resource for those who are looking to find the perfect color for their projects! Whether you need a simple pre-mixed color or something specific, look no further. We can use our specialized equipment and software to match a sample of a desired color, such as a swatch or chip, and then create a custom paint formula to match that very color. We can't wait to help you achieve the exact paint color you are looking for. Stop by or give us a call to see how our staff can lend a hand!",
  },
  {
    icon: "fa-solid fa-box",
    title: "Special Ordering",
    homepageImage: "svcSpecialOrdering",
    body: "Looking for a specific item that you can't seem to find in-store? Look no further! We understand that not every item is readily available on our shelves, which is why we offer the option for our customers to place a special order. Simply speak with one of our knowledgeable associates, provide them with the details of the product you're looking for, and we'll take care of the rest. Our special ordering service allows us to access a wider range of supplies, ensuring that you get exactly what you need. Plus, our fast and efficient service means that you won't have to wait long before your item arrives. Don't waste time driving from store to store in search of that elusive item - place a special order with us and let us do the work for you!",
  },
];

/** Homepage featured service tiles (matches live homepage). */
export const homeServices = services.filter((s) => s.homepageImage);
