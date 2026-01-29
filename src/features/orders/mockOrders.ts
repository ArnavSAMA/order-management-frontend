import type { Order } from "./types";

const STAFF = ["Taro Tanaka", "Declan", "Hanako Yamada"] as const;
const CUSTOMERS = ["XX Shop", "ABC Mart", "LAWSON", "Fresh Farm", "XYZ Mart", "Food Plaza", "Green Basket", "Daily Needs"] as const;
const PRODUCTS = ["Radish 10kg", "Pineapple 10kg", "Apples 5kg", "Grapes 4kg", "Milk 1L", "Onion 20kg", "Tomato 10kg", "Banana 8kg"] as const;

const STATUSES: Order["status"][] = ["unchecked", "confirmed", "processing", "completed", "cancelled"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function ymdhms(year: number, month: number, day: number, hh: number, mm: number, ss: number) {
  return `${year}-${pad2(month)}-${pad2(day)} ${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

export const mockOrders: Order[] = Array.from({ length: 25 }).map((_, i) => {
  const id = String(i + 1);

  // Dates across Jan 2026
  const day = 5 + (i % 23); // 5..27
  const orderDate = ymd(2026, 1, day);

  const customer = CUSTOMERS[i % CUSTOMERS.length];
  const productName = PRODUCTS[(i * 2) % PRODUCTS.length];
  const quantity = 5 + ((i * 3) % 60); // 5..64
  const amount = 1200 + ((i * 137) % 90000); // varied
  const status = STATUSES[i % STATUSES.length];

  const assignedTo = STAFF[i % STAFF.length];
  const hasPdf = i % 3 !== 0;
  const pdfUrl = hasPdf ? `https://example.com/fax-${id}.pdf` : undefined;

  const createdBy = i % 4 === 0 ? "Demo Clerk" : "Hanako Yamada";
  const updatedBy = status === "processing" || status === "completed" ? assignedTo : createdBy;

  const createdAt = ymdhms(2026, 1, day, 9 + (i % 6), 10 + (i % 40), 0);
  const updatedAt = ymdhms(2026, 1, day, 10 + (i % 6), 15 + (i % 40), 0);

  return {
    id,
    orderDate,
    customer,
    productName,
    quantity,
    amount,
    status,
    assignedTo,
    pdfUrl,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
  };
});
