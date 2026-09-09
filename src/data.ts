import { addDays, iso } from "./availability.mjs";
export const today = iso(new Date());
export const dateLabel = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "short",
  });
export type Room = {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  price: number;
  capacity: number;
  size: number;
  image: string;
  description: string;
  amenities: string[];
};
export const rooms: Room[] = [
  {
    id: "deluxe",
    number: "101",
    name: "Deluxe soba",
    subtitle: "Mali rituali. Veliki odmor.",
    price: 85,
    capacity: 2,
    size: 28,
    image: "/images/soba1.png",
    description:
      "Meka posteljina, topli tonovi i mir koji vam je nedostajao. Promišljen prostor za jutra bez žurbe i večeri posvećene samo vama.",
    amenities: [
      "King size krevet",
      "Privatno kupatilo",
      "Klima uređaj",
      "Besplatan Wi-Fi",
      "Smart TV",
      "Doručak po izboru",
    ],
  },
  {
    id: "superior",
    number: "201",
    name: "Superior soba",
    subtitle: "Više prostora za vas.",
    price: 110,
    capacity: 3,
    size: 36,
    image: "/images/soba2.png",
    description:
      "Udobnost koja poziva da ostanete još jednu noć. Prostrana soba za vaš vikend udvoje ili dragocene porodične trenutke.",
    amenities: [
      "Bračni krevet",
      "Dodatni ležaj",
      "Privatno kupatilo",
      "Besplatan Wi-Fi",
      "Smart TV",
      "Klima uređaj",
    ],
  },
  {
    id: "suite",
    number: "301",
    name: "Crystal apartman",
    subtitle: "Boravak koji se pamti.",
    price: 155,
    capacity: 4,
    size: 52,
    image: "/images/soba3.png",
    description:
      "Vaš mali svet, daleko od svakodnevice. Najprostraniji smeštaj za posebne prilike, duže boravke i uživanje bez kompromisa.",
    amenities: [
      "King size krevet",
      "Prostor za odmor",
      "Sofa na razvlačenje",
      "Privatno kupatilo",
      "Besplatan Wi-Fi",
      "Smart TV",
    ],
  },
];
export type Booking = {
  id: string;
  roomId: string;
  name: string;
  email: string;
  phone: string;
  start: string;
  end: string;
  guests: number;
  total: number;
  status: "Potvrđena" | "U hotelu" | "Završena" | "Otkazana" | "Blokirano";
  channel: string;
  extras: string[];
  note: string;
  payment: string;
  own?: boolean;
};
export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  type: string;
  guests: number;
  note: string;
  status: "Novi upit" | "U razgovoru" | "Potvrđeno" | "Odbijeno";
  own?: boolean;
};
export const seedBookings: Booking[] = [
  {
    id: "CL-2601",
    roomId: "deluxe",
    name: "Milica Jovanović",
    email: "milica@example.com",
    phone: "+381 60 000 0101",
    start: today,
    end: addDays(today, 2),
    guests: 2,
    total: 170,
    status: "U hotelu",
    channel: "Direktno",
    extras: [],
    note: "Tiša soba, ako je moguće.",
    payment: "Na recepciji",
  },
  {
    id: "CL-2602",
    roomId: "superior",
    name: "Nikola Petrović",
    email: "nikola@example.com",
    phone: "+381 60 000 0202",
    start: addDays(today, 1),
    end: addDays(today, 4),
    guests: 2,
    total: 330,
    status: "Potvrđena",
    channel: "Booking.com",
    extras: ["Doručak"],
    note: "Dolazak posle 18h.",
    payment: "Plaćeno",
  },
  {
    id: "CL-2603",
    roomId: "suite",
    name: "Ana Marković",
    email: "ana@example.com",
    phone: "+381 60 000 0303",
    start: addDays(today, 4),
    end: addDays(today, 7),
    guests: 3,
    total: 465,
    status: "Potvrđena",
    channel: "Direktno",
    extras: [],
    note: "Porodični vikend.",
    payment: "Na recepciji",
    own: true,
  },
  {
    id: "CL-2604",
    roomId: "deluxe",
    name: "Stefan Ilić",
    email: "stefan@example.com",
    phone: "+381 60 000 0404",
    start: addDays(today, 6),
    end: addDays(today, 9),
    guests: 2,
    total: 255,
    status: "Potvrđena",
    channel: "Airbnb",
    extras: [],
    note: "",
    payment: "Plaćeno",
  },
  {
    id: "CL-2605",
    roomId: "superior",
    name: "Marko Savić",
    email: "marko@example.com",
    phone: "+381 60 000 0505",
    start: addDays(today, 10),
    end: addDays(today, 12),
    guests: 2,
    total: 220,
    status: "Potvrđena",
    channel: "Telefon",
    extras: [],
    note: "",
    payment: "Na recepciji",
  },
  {
    id: "CL-2606",
    roomId: "suite",
    name: "Jelena Nikolić",
    email: "jelena@example.com",
    phone: "+381 60 000 0606",
    start: addDays(today, -3),
    end: today,
    guests: 2,
    total: 465,
    status: "Završena",
    channel: "Direktno",
    extras: [],
    note: "Stalna gošća.",
    payment: "Plaćeno",
  },
  {
    id: "CL-2607", roomId: "deluxe", name: "Sofija Milošević", email: "sofija@example.com", phone: "+381 64 222 1030",
    start: addDays(today, -9), end: addDays(today, -7), guests: 2, total: 170, status: "Završena", channel: "Google Hotels", extras: ["Doručak"], note: "Godišnjica braka — pripremiti malu pažnju.", payment: "Plaćeno",
  },
  {
    id: "CL-2608", roomId: "superior", name: "Vladimir Stanković", email: "vladimir@example.com", phone: "+381 63 441 820",
    start: addDays(today, -6), end: addDays(today, -3), guests: 3, total: 330, status: "Završena", channel: "Expedia", extras: ["Parking"], note: "Porodični boravak.", payment: "Plaćeno",
  },
  {
    id: "CL-2609", roomId: "suite", name: "Maja i Filip Kostić", email: "maja@example.com", phone: "+381 65 811 2200",
    start: today, end: addDays(today, 3), guests: 2, total: 465, status: "U hotelu", channel: "Direktno", extras: ["Doručak", "Kasna odjava"], note: "Medeni mesec. Šampanjac bez alkohola.", payment: "Plaćeno",
  },
  {
    id: "CL-2610", roomId: "superior", name: "Ivana Đukić", email: "ivana@example.com", phone: "+381 60 313 990",
    start: addDays(today, 5), end: addDays(today, 8), guests: 2, total: 330, status: "Potvrđena", channel: "Direktno", extras: ["Transfer"], note: "Transfer sa aerodroma u 17:30.", payment: "Akontacija 30%",
  },
  {
    id: "CL-2611", roomId: "suite", name: "Aleksandar Pavlović", email: "aleksandar@example.com", phone: "+381 62 773 119",
    start: addDays(today, 9), end: addDays(today, 12), guests: 4, total: 465, status: "Potvrđena", channel: "Booking.com", extras: ["Parking", "Doručak"], note: "Dvoje dece, potreban dodatni set peškira.", payment: "Plaćeno",
  },
  {
    id: "CL-2612", roomId: "deluxe", name: "Emma Wilson", email: "emma@example.com", phone: "+44 7700 900112",
    start: addDays(today, 10), end: addDays(today, 13), guests: 2, total: 255, status: "Potvrđena", channel: "Hotels.com", extras: ["Doručak"], note: "English speaking guest. Late arrival around 21:00.", payment: "Plaćeno",
  },
  {
    id: "CL-2613", roomId: "superior", name: "Petar Ristić", email: "petar@example.com", phone: "+381 69 521 663",
    start: addDays(today, 14), end: addDays(today, 17), guests: 2, total: 330, status: "Potvrđena", channel: "Telefon", extras: [], note: "Poslovni boravak, potreban račun.", payment: "Na recepciji",
  },
  {
    id: "CL-2614", roomId: "suite", name: "Lena Petrović", email: "lena@example.com", phone: "+381 64 404 122",
    start: addDays(today, 14), end: addDays(today, 18), guests: 2, total: 620, status: "Potvrđena", channel: "Direktno", extras: ["Kasna odjava"], note: "Rođendanski vikend.", payment: "Akontacija 30%",
  },
];
export const seedInquiries: Inquiry[] = [
  {
    id: "EV-101",
    name: "Tamara & Luka",
    email: "tamara@example.com",
    phone: "+381 60 000 0707",
    date: addDays(today, 7),
    type: "Venčanje",
    guests: 120,
    note: "Interesuje nas dekoracija u belim i zelenim tonovima.",
    status: "Potvrđeno",
  },
  {
    id: "EV-102",
    name: "Mina Đorđević",
    email: "mina@example.com",
    phone: "+381 60 000 0808",
    date: addDays(today, 12),
    type: "Rođendan",
    guests: 60,
    note: "Proslava 30. rođendana.",
    status: "Novi upit",
  },
  {
    id: "EV-103",
    name: "Studio Forma",
    email: "forma@example.com",
    phone: "+381 60 000 0909",
    date: addDays(today, 18),
    type: "Poslovni događaj",
    guests: 40,
    note: "Večera za tim.",
    status: "Potvrđeno",
  },
  { id: "EV-104", name: "Jovana & Marko", email: "jovana@example.com", phone: "+381 64 902 118", date: addDays(today, 25), type: "Venčanje", guests: 180, note: "Letnje venčanje, interesuje nas kompletna dekoracija i meni.", status: "U razgovoru" },
  { id: "EV-105", name: "Kompanija Nova", email: "events@nova.rs", phone: "+381 11 444 200", date: addDays(today, 32), type: "Poslovni događaj", guests: 85, note: "Godišnja večera kompanije, potreban projektor i ozvučenje.", status: "Novi upit" },
  { id: "EV-106", name: "Mila Nikolić", email: "mila@example.com", phone: "+381 63 550 887", date: addDays(today, 40), type: "Krštenje", guests: 70, note: "Porodični ručak uz dečiji kutak.", status: "U razgovoru" },
  { id: "EV-107", name: "Teodora Savić", email: "teodora@example.com", phone: "+381 60 332 191", date: addDays(today, 47), type: "Rođendan", guests: 110, note: "Proslava punoletstva, DJ i light show.", status: "Novi upit" },
  { id: "EV-108", name: "Studio Atlas", email: "hello@atlas.rs", phone: "+381 18 223 100", date: addDays(today, 55), type: "Poslovni događaj", guests: 45, note: "Prezentacija proizvoda i koktel večera.", status: "Potvrđeno" },
];
