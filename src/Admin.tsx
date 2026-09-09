import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Gift,
  Globe2,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
  WandSparkles,
  X,
  Radio,
  ShieldCheck,
  Star,
  Tags,
  UserCog,
  Bell,
} from "lucide-react";
import { rooms, today, dateLabel, type Booking, type Inquiry } from "./data";
import { addDays, nightsBetween, isAvailable } from "./availability.mjs";
import { useStore } from "./store";
import "./admin.css";

const money = (n: number) =>
  new Intl.NumberFormat("sr-Latn-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
const nav = [
  { id: "overview", label: "Pregled", icon: LayoutDashboard },
  { id: "calendar", label: "Kalendar", icon: CalendarDays },
  { id: "bookings", label: "Rezervacije", icon: BedDouble },
  { id: "guests", label: "Gosti", icon: Users },
  { id: "events", label: "Proslave", icon: Sparkles },
  { id: "housekeeping", label: "Održavanje", icon: WandSparkles },
  { id: "reports", label: "Izveštaji", icon: CircleDollarSign },
  { id: "pricing", label: "Cene i paketi", icon: Tags },
  { id: "channels", label: "Kanali prodaje", icon: Radio },
  { id: "messages", label: "Poruke gostima", icon: MessageSquareText },
  { id: "vouchers", label: "Vaučeri", icon: Gift },
  { id: "website", label: "Sadržaj sajta", icon: Globe2 },
  { id: "team", label: "Tim i uloge", icon: UserCog },
  { id: "settings", label: "Podešavanja", icon: Settings2 },
];
const statuses: Booking["status"][] = [
  "Potvrđena",
  "U hotelu",
  "Završena",
  "Otkazana",
];
const messageTemplates = [
  { id: "confirmation", title: "Potvrda rezervacije", timing: "Odmah nakon rezervacije", subject: "Vaš boravak u Crystal Lightu je potvrđen", copy: "Poštovani {{ime}}, radujemo se vašem dolasku {{dolazak}}. Vaša soba {{soba}} vas čeka." },
  { id: "arrival", title: "Podsetnik pred dolazak", timing: "2 dana pre dolaska", subject: "Još malo do vašeg Crystal Light trenutka", copy: "Sve je spremno za vas. Prijava je od 14:00, a naš tim vam je na raspolaganju za posebne želje." },
  { id: "review", title: "Zahvalnica i recenzija", timing: "Dan posle odlaska", subject: "Hvala što ste bili naši gosti", copy: "Nadamo se da nosite lepe uspomene. Vaš utisak nam pomaže da svaki sledeći boravak bude još bolji." },
  { id: "event", title: "Odgovor na upit za proslavu", timing: "Kada tim promeni status", subject: "Hajde da stvorimo nešto za pamćenje", copy: "Hvala na interesovanju za Crystal Light. Vaš datum je zabeležen i naš organizator će vam predstaviti sledeće korake." },
];
const teamMembers = [
  { name: "Ana Petrović", role: "Vlasnik", initials: "AP", access: "Sve funkcije i finansije", shift: "Danas · 08–16h" },
  { name: "Milica Stojanović", role: "Recepcioner", initials: "MS", access: "Rezervacije, gosti i proslave", shift: "Danas · 14–22h" },
  { name: "Nikola Ilić", role: "Recepcioner", initials: "NI", access: "Rezervacije, gosti i proslave", shift: "Sutra · 08–16h" },
  { name: "Jelena Ristić", role: "Domaćinstvo", initials: "JR", access: "Status i priprema soba", shift: "Danas · 07–15h" },
];
const websiteSections = [
  { title: "Naslovna i video", state: "Objavljeno", detail: "Hero video, glavna poruka i direktna rezervacija", icon: Globe2 },
  { title: "Sobe i dostupnost", state: "Objavljeno", detail: "3 sobe · fotografije · cene · posebni kalendari", icon: BedDouble },
  { title: "Proslave", state: "Objavljeno", detail: "Sala, javni kalendar dostupnosti i forma za upit", icon: Sparkles },
  { title: "Galerija i doživljaji", state: "Objavljeno", detail: "Restoran, igraonica i 6 fotografija", icon: FileText },
  { title: "SEO i AI podaci", state: "Spremno", detail: "Hotel, Room i Offer strukturirani podaci", icon: Star },
];
export default function Admin() {
  const s = useStore();
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Sve");
  const [week, setWeek] = useState(today);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [modal, setModal] = useState(false);
  const [block, setBlock] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const role = s.settings.role || "Vlasnik";
  const allowed = nav.filter(
    (n) =>
      role === "Vlasnik" ||
      (role === "Recepcioner"
        ? !["reports", "channels", "pricing", "team"].includes(n.id)
        : ["housekeeping", "settings"].includes(n.id)),
  );
  useEffect(() => {
    if (!allowed.some((n) => n.id === tab))
      setTab(role === "Domaćinstvo" ? "housekeeping" : "overview");
  }, [role, tab]);
  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);
  const paid = s.bookings.filter(
    (b) => !["Otkazana", "Blokirano"].includes(b.status),
  );
  const revenue = paid.reduce((a, b) => a + b.total, 0);
  const occupied = rooms.filter((r) =>
    paid.some((b) => b.roomId === r.id && b.start <= today && b.end > today),
  ).length;
  const coming = paid
    .filter((b) => b.start >= today && b.start <= addDays(today, 7))
    .sort((a, b) => a.start.localeCompare(b.start));
  const displayed = s.bookings
    .filter(
      (b) =>
        (filter === "Sve" || b.status === filter) &&
        `${b.name} ${b.id} ${b.email}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => b.start.localeCompare(a.start));
  function open(b: Booking | null = null, isBlock = false) {
    setEditing(b);
    setBlock(isBlock || b?.status === "Blokirano");
    setError("");
    setModal(true);
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const roomId = String(d.get("roomId"));
    const start = String(d.get("start"));
    const end = String(d.get("end"));
    const guests = Number(d.get("guests") || 0);
    const room = rooms.find((r) => r.id === roomId)!;
    if (start >= end) {
      setError("Datum odlaska mora biti posle datuma dolaska.");
      return;
    }
    if (!isAvailable(roomId, start, end, s.bookings, editing?.id)) {
      setError(
        "Soba je zauzeta u izabranom periodu. Promenite sobu ili datume.",
      );
      return;
    }
    if (!block && (guests < 1 || guests > room.capacity)) {
      setError(`Ova soba prima najviše ${room.capacity} gostiju.`);
      return;
    }
    const booking: Booking = {
      id: editing?.id || `CL-${Date.now().toString().slice(-7)}`,
      roomId,
      start,
      end,
      guests,
      name: block ? "Blokiran termin" : String(d.get("name")),
      email: String(d.get("email") || ""),
      phone: String(d.get("phone") || ""),
      note: String(d.get("note") || ""),
      status: block
        ? "Blokirano"
        : (String(d.get("status")) as Booking["status"]),
      channel: String(d.get("channel") || "Recepcija"),
      total: block
        ? 0
        : editing &&
            editing.roomId === roomId &&
            editing.start === start &&
            editing.end === end
          ? editing.total
          : nightsBetween(start, end) * room.price,
      extras: editing?.extras || [],
      payment: String(d.get("payment") || "Na recepciji"),
      own: editing?.own,
    };
    s.setBookings((prev) =>
      editing?.id
        ? prev.map((b) => (b.id === editing.id ? booking : b))
        : [...prev, booking],
    );
    setModal(false);
    s.toast(
      editing
        ? "Izmene rezervacije su sačuvane."
        : block
          ? "Termin je blokiran."
          : "Nova rezervacija je sačuvana.",
    );
  }
  function changeStatus(b: Booking, status: Booking["status"]) {
    if (
      status === "Otkazana" &&
      !window.confirm(
        b.status === "Blokirano"
          ? "Osloboditi ovaj termin?"
          : `Otkazati rezervaciju ${b.id}?`,
      )
    )
      return;
    if (status === "U hotelu" && (b.start > today || b.end <= today)) {
      s.toast("Check-in je dostupan tokom datuma boravka.");
      return;
    }
    s.setBookings((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, status } : x)),
    );
    if (status === "Završena")
      s.setHousekeeping({ ...s.housekeeping, [b.roomId]: "Za spremanje" });
    s.toast("Status je ažuriran.");
  }
  function exportCsv() {
    const rows = [
      [
        "Rezervacija",
        "Gost",
        "Soba",
        "Dolazak",
        "Odlazak",
        "Kanal",
        "Status",
        "Ukupno EUR",
      ],
      ...paid.map((b) => [
        b.id,
        b.name,
        rooms.find((r) => r.id === b.roomId)?.number || "",
        b.start,
        b.end,
        b.channel,
        b.status,
        String(b.total),
      ]),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((r) =>
          r
            .map(
              (v) =>
                '"' +
                String(v)
                  .replaceAll('"', '""')
                  .replace(/^[=+@-]/, "'$&") +
                '"',
            )
            .join(";"),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `crystal-izvestaj-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    s.toast("CSV izveštaj je preuzet.");
  }
  const timeline = (
    <section className="ad-panel ad-timeline">
      <div className="ad-panel-title">
        <div>
          <span className="ad-eyebrow">PLAN BORAVAKA</span>
          <h2>Svaka soba. Svaki trenutak.</h2>
        </div>
        <div className="ad-date-controls">
          <button
            aria-label="Prethodna nedelja"
            onClick={() => setWeek(addDays(week, -7))}
          >
            <ChevronLeft size={17} />
          </button>
          <span>
            {dateLabel(week)} – {dateLabel(addDays(week, 6))}
          </span>
          <button
            aria-label="Sledeća nedelja"
            onClick={() => setWeek(addDays(week, 7))}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="ad-timeline-scroll">
        <div className="ad-time-grid">
          <div className="ad-time-head">Soba / period</div>
          {Array.from({ length: 7 }, (_, i) => (
            <div
              className={`ad-time-head ${addDays(week, i) === today ? "is-today" : ""}`}
              key={i}
            >
              {new Date(addDays(week, i) + "T12:00:00").toLocaleDateString(
                "sr-Latn-RS",
                { weekday: "short" },
              )}
              <b>{new Date(addDays(week, i) + "T12:00:00").getDate()}</b>
            </div>
          ))}
          {rooms.map((r) => (
            <div className="ad-time-row" key={r.id}>
              <div className="ad-room-label">
                <BedDouble size={19} />
                <div>
                  <b>{r.number}</b>
                  <small>{r.name}</small>
                </div>
              </div>
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(week, i);
                const b = s.bookings.find(
                  (b) =>
                    b.roomId === r.id &&
                    b.status !== "Otkazana" &&
                    b.start <= day &&
                    b.end > day,
                );
                return (
                  <div className="ad-time-cell" key={day}>
                    {b ? (
                      <button
                        title={`${b.name}, ${dateLabel(b.start)} – ${dateLabel(b.end)}`}
                        className={`ad-stay ${b.status === "Blokirano" ? "blocked" : b.channel === "Direktno" ? "direct" : "channel"}`}
                        onClick={() => open(b)}
                      >
                        <span>
                          {b.status === "Blokirano"
                            ? "Blokirano"
                            : b.name.split(" ")[0]}
                        </span>
                        <small>
                          {b.status === "U hotelu" ? "U hotelu" : b.channel}
                        </small>
                      </button>
                    ) : (
                      <button
                        className="ad-empty-day"
                        aria-label={`Dodaj rezervaciju za sobu ${r.number}, ${dateLabel(day)}`}
                        onClick={() =>
                          open({
                            id: "",
                            roomId: r.id,
                            start: day,
                            end: addDays(day, 1),
                            name: "",
                            email: "",
                            phone: "",
                            guests: 1,
                            total: r.price,
                            status: "Potvrđena",
                            channel: "Recepcija",
                            extras: [],
                            note: "",
                            payment: "Na recepciji",
                          })
                        }
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="ad-legend">
        <span>
          <i />
          Direktna rezervacija
        </span>
        <span>
          <i />
          Ostali kanali
        </span>
        <span>
          <i />
          Blokiran termin
        </span>
        <small>
          * Prikazan period:{" "}
          {new Date(week + "T12:00:00").toLocaleDateString("sr-Latn-RS", {
            month: "long",
            year: "numeric",
          })}
        </small>
      </div>
    </section>
  );
  function bookingRows(list: Booking[]) {
    return (
      <div className="ad-booking-list">
        {list.length === 0 ? (
          <div className="ad-empty">Nema rezervacija za izabrane filtere.</div>
        ) : (
          list.map((b) => (
            <div className="ad-booking-row" key={b.id}>
              <div className="ad-avatar">
                {b.name
                  .split(" ")
                  .slice(0, 2)
                  .map((x) => x[0])
                  .join("")}
              </div>
              <div className="ad-guest-name">
                <button onClick={() => open(b)}>{b.name}</button>
                <small>
                  {b.id} · Soba {rooms.find((r) => r.id === b.roomId)?.number}
                </small>
              </div>
              <div className="ad-booking-dates">
                {dateLabel(b.start)} — {dateLabel(b.end)}
                <small>
                  {nightsBetween(b.start, b.end)} noći · {b.guests} gosta
                </small>
              </div>
              <span
                className={`ad-badge ${b.status === "U hotelu" || b.status === "Završena" ? "green" : b.status === "Otkazana" ? "gray" : ""}`}
              >
                {b.status}
              </span>
              {role === "Vlasnik" && (
                <b className="ad-total">{money(b.total)}</b>
              )}
              <div className="ad-row-actions">
                {b.status === "Potvrđena" && (
                  <button onClick={() => changeStatus(b, "U hotelu")}>
                    Check-in
                  </button>
                )}
                {b.status === "U hotelu" && (
                  <button onClick={() => changeStatus(b, "Završena")}>
                    Check-out
                  </button>
                )}
                <button
                  className="ad-icon"
                  aria-label={`Detalji ${b.name}`}
                  onClick={() => open(b)}
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
  return (
    <div className="admin-shell">
      <aside className="ad-sidebar">
        <Link to="/" className="ad-brand">
          <span>CL</span>
          <div>
            CRYSTAL LIGHT<small>HOTEL MANAGEMENT</small>
          </div>
        </Link>
        <div className="ad-workspace">
          <span className="ad-online" />
          Crystal Light Hotel<small>Demo radni prostor</small>
        </div>
        <nav aria-label="Administracija">
          {allowed.map((n) => (
            <button
              className={tab === n.id ? "active" : ""}
              key={n.id}
              onClick={() => { setTab(n.id); setMobileMenu(false); }}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.id === "events" && (
                <small>
                  {s.inquiries.filter((i) => i.status === "Novi upit").length}
                </small>
              )}
            </button>
          ))}
        </nav>
        <div className="ad-sidebar-bottom">
          <div className="ad-demo-note">
            <ShieldCheck size={20} />
            <p>
              Vaš hotel, povezan.
              <small>Interaktivni demo · simulirani podaci</small>
            </p>
          </div>
          <Link to="/">
            <ArrowLeft size={16} /> Nazad na sajt
          </Link>
        </div>
      </aside>
      <div className="ad-main">
        <header className="ad-topbar">
          <div>
            <span className="ad-mobile-brand">CRYSTAL LIGHT</span>
            <span className="ad-breadcrumb">
              Radni prostor <span>/</span>{" "}
              {nav.find((n) => n.id === tab)?.label}
            </span>
          </div>
          <div className="ad-top-actions">
            <button className="ad-notification" aria-label="Obaveštenja" onClick={() => { setTab("messages"); setMobileMenu(false); }}>
              <Bell size={17} /><small>{s.inquiries.filter((item) => item.status === "Novi upit").length + 2}</small>
            </button>
            <span className="ad-demo-pill">DEMO</span>
            <span className="ad-user-circle">
              {role === "Vlasnik" ? "VL" : role === "Recepcioner" ? "RE" : "DO"}
            </span>
            <button className="ad-mobile-menu-button" aria-label="Otvori meni administracije" aria-expanded={mobileMenu} onClick={() => setMobileMenu((value) => !value)}>
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
        {mobileMenu && (
          <div className="ad-mobile-menu">
            <div><span className="ad-eyebrow">ADMIN MENI</span><strong>Sve funkcije hotela</strong></div>
            <nav aria-label="Mobilni admin meni">
              {allowed.map((item) => (
                <button className={tab === item.id ? "active" : ""} key={item.id} onClick={() => { setTab(item.id); setMobileMenu(false); }}>
                  <item.icon size={18} /><span>{item.label}</span>
                  {item.id === "events" && <small>{s.inquiries.filter((entry) => entry.status === "Novi upit").length}</small>}
                </button>
              ))}
            </nav>
          </div>
        )}
        <main className="ad-content">
          <div className="ad-page-heading">
            <div>
              <span className="ad-eyebrow">
                {new Date(today + "T12:00:00").toLocaleDateString(
                  "sr-Latn-RS",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </span>
              <h1>
                {tab === "overview"
                  ? "Dobar dan. Dobro došli."
                  : nav.find((n) => n.id === tab)?.label}
              </h1>
              <p>
                {tab === "overview"
                  ? "Mali detalji stvaraju izuzetna iskustva. Vaš dan počinje ovde."
                  : "Sve što vam je potrebno za pažljivo vođen hotel."}
              </p>
            </div>
            {role !== "Domaćinstvo" && (
              <button className="ad-primary" onClick={() => open()}>
                <Plus size={18} /> Nova rezervacija
              </button>
            )}
          </div>
          {tab === "overview" && (
            <>
              <div className="ad-metrics">
                <article>
                  <div>
                    <span>Popunjenost danas</span>
                    <BedDouble size={20} />
                  </div>
                  <strong>
                    {Math.round((occupied / rooms.length) * 100)}
                    <small>%</small>
                  </strong>
                  <footer>
                    <span className="ad-dot green" />
                    {occupied} od {rooms.length} sobe zauzeto
                  </footer>
                  <div className="ad-meter">
                    <i
                      style={{ width: `${(occupied / rooms.length) * 100}%` }}
                    />
                  </div>
                </article>
                <article>
                  <div>
                    <span>Dolasci u 7 dana</span>
                    <Users size={20} />
                  </div>
                  <strong>{coming.length.toString().padStart(2, "0")}</strong>
                  <footer>
                    {coming.reduce((n, b) => n + b.guests, 0)} gostiju očekuje
                    vaš doček
                  </footer>
                  <div className="ad-mini-bars">
                    {Array.from({ length: 7 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          height:
                            10 +
                            paid.filter((b) => b.start === addDays(today, i))
                              .length *
                              14,
                        }}
                      />
                    ))}
                  </div>
                </article>
                {role === "Vlasnik" && (
                  <article>
                    <div>
                      <span>Vrednost rezervacija</span>
                      <CircleDollarSign size={20} />
                    </div>
                    <strong>{money(revenue)}</strong>
                    <footer>Sve aktivne i završene · demo</footer>
                    <small className="ad-metric-detail">
                      {paid.length} rezervacija ukupno
                    </small>
                  </article>
                )}
                <article className="ad-dark-metric">
                  <div>
                    <span>Proslave u pripremi</span>
                    <Sparkles size={20} />
                  </div>
                  <strong>
                    {s.inquiries
                      .filter((i) => i.status !== "Odbijeno")
                      .length.toString()
                      .padStart(2, "0")}
                  </strong>
                  <footer>
                    {s.inquiries.filter((i) => i.status === "Novi upit").length}{" "}
                    novih upita čeka odgovor
                  </footer>
                  <button onClick={() => setTab("events")}>
                    Pogledajte upite <ArrowUpRight size={16} />
                  </button>
                </article>
              </div>
              <section className="ad-command-bar">
                <div><span className="ad-eyebrow">BRZE AKCIJE</span><strong>Šta želite da uradite?</strong></div>
                <button onClick={() => open()}><Plus size={18} /><span>Nova rezervacija<small>Telefon ili recepcija</small></span></button>
                <button onClick={() => setTab("events")}><Sparkles size={18} /><span>Upiti za proslave<small>{s.inquiries.filter((item) => item.status === "Novi upit").length} nova upita</small></span></button>
                <button onClick={() => setTab("housekeeping")}><WandSparkles size={18} /><span>Status soba<small>{rooms.filter((room) => s.housekeeping[room.id] !== "Spremno").length} traže pažnju</small></span></button>
                <button onClick={() => setTab("messages")}><Mail size={18} /><span>Poruke gostima<small>Automatski tokovi</small></span></button>
              </section>
              {timeline}
              <div className="ad-bottom-grid">
                <section className="ad-panel">
                  <div className="ad-panel-title">
                    <div>
                      <span className="ad-eyebrow">SLEDEĆI DOČECI</span>
                      <h2>Gosti su u centru pažnje.</h2>
                    </div>
                    <button
                      className="ad-text-button"
                      onClick={() => setTab("bookings")}
                    >
                      Sve rezervacije <ArrowUpRight size={16} />
                    </button>
                  </div>
                  {bookingRows(coming.slice(0, 3))}
                </section>
                <section className="ad-panel ad-house-summary">
                  <span className="ad-eyebrow">SPREMNO ZA GOSTE</span>
                  <h2>Pažnja u svakom detalju.</h2>
                  {rooms.map((r) => (
                    <div key={r.id}>
                      <span>Soba {r.number}</span>
                      <span
                        className={`ad-badge ${s.housekeeping[r.id] === "Spremno" ? "green" : ""}`}
                      >
                        {s.housekeeping[r.id]}
                      </span>
                    </div>
                  ))}
                  <button
                    className="ad-text-button"
                    onClick={() => setTab("housekeeping")}
                  >
                    Otvori održavanje <ArrowUpRight size={16} />
                  </button>
                </section>
              </div>
            </>
          )}
          {tab === "calendar" && (
            <>
              <div className="ad-toolbar">
                <p>
                  Odaberite rezervaciju za izmenu ili slobodno polje za novi
                  boravak.
                </p>
                <button
                  className="ad-secondary"
                  onClick={() => open(null, true)}
                >
                  Blokiraj termin
                </button>
              </div>
              {timeline}
            </>
          )}
          {tab === "bookings" && (
            <section className="ad-panel">
              <div className="ad-filters">
                <label className="ad-search">
                  <Search size={18} />
                  <input
                    placeholder="Ime gosta, šifra ili email…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Status rezervacije"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {["Sve", ...statuses, "Blokirano"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <span>{displayed.length} rezervacija</span>
              </div>
              {bookingRows(displayed)}
            </section>
          )}
          {tab === "guests" && (
            <>
              <label className="ad-search ad-search-alone">
                <Search size={18} />
                <input
                  placeholder="Pretražite goste…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="ad-card-grid">
                {paid
                  .filter(
                    (b, i, a) => a.findIndex((x) => x.email === b.email) === i,
                  )
                  .filter((b) =>
                    `${b.name} ${b.email}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((b) => (
                    <article className="ad-panel ad-guest-card" key={b.id}>
                      <div className="ad-avatar">
                        {b.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")}
                      </div>
                      <h2>{b.name}</h2>
                      <p>
                        {b.email}
                        <br />
                        {b.phone}
                      </p>
                      <div className="ad-guest-note">
                        <span className="ad-eyebrow">BELEŠKA ZA TIM</span>
                        <p>{b.note || "Još nema posebnih napomena."}</p>
                      </div>
                      <button className="ad-secondary" onClick={() => open(b)}>
                        Detalji i beleške <ArrowUpRight size={16} />
                      </button>
                    </article>
                  ))}
              </div>
            </>
          )}
          {tab === "events" && (
            <>
              <div className="ad-info-strip">
                <Sparkles size={20} />
                <span>
                  Svaki upit je početak posebne priče. Izmene statusa su
                  vidljive i u demo kalendaru sale.
                </span>
              </div>
              <div className="ad-card-grid">
                {s.inquiries.map((i) => (
                  <article className="ad-panel ad-event-card" key={i.id}>
                    <div className="ad-event-top">
                      <span>{dateLabel(i.date)}</span>
                      <Sparkles size={25} />
                    </div>
                    <span className="ad-eyebrow">
                      {i.type} · {i.guests} gostiju
                    </span>
                    <h2>{i.name}</h2>
                    <p>{i.note}</p>
                    <div className="ad-event-contact">
                      {i.email}
                      <br />
                      {i.phone}
                    </div>
                    <label>
                      Status upita
                      <select
                        value={i.status}
                        onChange={(e) => {
                          const status = e.target.value as Inquiry["status"];
                          if (
                            status === "Potvrđeno" &&
                            s.inquiries.some(
                              (x) =>
                                x.id !== i.id &&
                                x.date === i.date &&
                                x.status === "Potvrđeno",
                            )
                          ) {
                            s.toast(
                              "Sala već ima potvrđen događaj tog datuma.",
                            );
                            return;
                          }
                          s.setInquiries((prev) =>
                            prev.map((x) =>
                              x.id === i.id ? { ...x, status } : x,
                            ),
                          );
                          s.toast("Status upita je sačuvan.");
                        }}
                      >
                        {[
                          "Novi upit",
                          "U razgovoru",
                          "Potvrđeno",
                          "Odbijeno",
                        ].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))}
              </div>
            </>
          )}
          {tab === "housekeeping" && (
            <>
              <div className="ad-info-strip">
                <WandSparkles size={20} />
                <span>
                  {
                    rooms.filter((r) => s.housekeeping[r.id] === "Spremno")
                      .length
                  }{" "}
                  od 3 sobe spremno za goste. Statusi se odmah čuvaju i dele sa
                  recepcijom.
                </span>
              </div>
              <div className="ad-card-grid">
                {rooms.map((r) => (
                  <article className="ad-panel ad-room-card" key={r.id}>
                    <img src={r.image} alt={r.name} />
                    <div>
                      <span className="ad-eyebrow">SOBA {r.number}</span>
                      <h2>{r.name}</h2>
                      <p>
                        {paid.some(
                          (b) =>
                            b.roomId === r.id &&
                            b.start <= today &&
                            b.end > today,
                        )
                          ? "Gost trenutno boravi u sobi"
                          : "Bez gostiju danas"}
                      </p>
                      <label>
                        Status sobe
                        <select
                          value={s.housekeeping[r.id]}
                          onChange={(e) => {
                            s.setHousekeeping({
                              ...s.housekeeping,
                              [r.id]: e.target.value,
                            });
                            s.toast(`Soba ${r.number}: ${e.target.value}.`);
                          }}
                        >
                          {[
                            "Za spremanje",
                            "U toku",
                            "Spremno",
                            "Održavanje",
                          ].map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                      {role !== "Domaćinstvo" && (
                        <button
                          className="ad-text-button"
                          onClick={() => open(null, true)}
                        >
                          Blokiraj termin <Plus size={15} />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          {tab === "reports" && (
            <>
              <div className="ad-toolbar">
                <p>
                  Pregled svih lokalnih demo rezervacija. Iznosi nisu fiskalni
                  izveštaj.
                </p>
                <button className="ad-primary" onClick={exportCsv}>
                  <ArrowDownToLine size={18} /> Preuzmi CSV
                </button>
              </div>
              <div className="ad-metrics ad-three">
                <article>
                  <span>Ukupna vrednost</span>
                  <strong>{money(revenue)}</strong>
                  <footer>{paid.length} boravaka</footer>
                </article>
                <article>
                  <span>Označeno kao plaćeno</span>
                  <strong>
                    {money(
                      paid
                        .filter((b) => b.payment === "Plaćeno")
                        .reduce((n, b) => n + b.total, 0),
                    )}
                  </strong>
                  <footer>Prema evidenciji recepcije</footer>
                </article>
                <article>
                  <span>Prosečna vrednost boravka</span>
                  <strong>
                    {money(paid.length ? revenue / paid.length : 0)}
                  </strong>
                  <footer>Bez otkazanih i blokiranih termina</footer>
                </article>
              </div>
              <section className="ad-panel ad-report">
                <span className="ad-eyebrow">STRUKTURA PRIHODA</span>
                <h2>Odakle dolaze vaši gosti?</h2>
                {Array.from(new Set(paid.map((b) => b.channel))).map(
                  (channel) => {
                    const value = paid
                      .filter((b) => b.channel === channel)
                      .reduce((n, b) => n + b.total, 0);
                    return (
                      <div className="ad-report-row" key={channel}>
                        <div>
                          <span>{channel}</span>
                          <b>{money(value)}</b>
                        </div>
                        <div className="ad-meter">
                          <i
                            style={{
                              width: `${revenue ? (value / revenue) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
                <p>
                  Potencijalna ušteda direktnih rezervacija:{" "}
                  <b>
                    {money(
                      paid
                        .filter((b) => b.channel === "Direktno")
                        .reduce((n, b) => n + b.total, 0) * 0.15,
                    )}
                  </b>{" "}
                  uz ilustrativnu proviziju od 15%.
                </p>
              </section>
            </>
          )}
          {tab === "channels" && (
            <>
              <div className="ad-info-strip">
                <Radio size={20} />
                <span>
                  Simulacija channel managera. Nijedan kanal nije povezan i cene
                  se ne šalju spoljnim servisima.
                </span>
              </div>
              <div className="ad-card-grid">
                {[
                  "Booking.com",
                  "Airbnb",
                  "Expedia",
                  "Hotels.com",
                  "Google Hotels",
                ].map((c) => (
                  <section className="ad-panel ad-channel-card" key={c}>
                    <Radio size={27} />
                    <h2>{c}</h2>
                    <span
                      className={`ad-badge ${s.settings["channel-" + c] === "on" ? "green" : "gray"}`}
                    >
                      {s.settings["channel-" + c] === "on"
                        ? "Demo veza aktivna"
                        : "Demo veza isključena"}
                    </span>
                    <p>
                      Poslednja demo sinhronizacija:
                      <br />
                      {s.settings["sync-" + c] || "Još nije pokrenuta"}
                    </p>
                    <button
                      className="ad-secondary"
                      onClick={() => {
                        s.setSettings({
                          ...s.settings,
                          ["channel-" + c]:
                            s.settings["channel-" + c] === "on" ? "off" : "on",
                        });
                        s.toast("Demo status kanala je promenjen.");
                      }}
                    >
                      {s.settings["channel-" + c] === "on"
                        ? "Isključi demo vezu"
                        : "Uključi demo vezu"}
                    </button>
                    <button
                      className="ad-text-button"
                      disabled={s.settings["channel-" + c] !== "on"}
                      onClick={() => {
                        s.setSettings({
                          ...s.settings,
                          ["sync-" + c]: new Date().toLocaleString(
                            "sr-Latn-RS",
                          ),
                        });
                        s.toast(
                          "Demo sinhronizacija završena. Nema slanja podataka.",
                        );
                      }}
                    >
                      Simuliraj sinhronizaciju <ArrowUpRight size={16} />
                    </button>
                  </section>
                ))}
              </div>
              <section className="ad-panel ad-settings-panel">
                <h2>Sezonske cene · simulacija</h2>
                <p>
                  Planski cenovnik za kanale; ne menja osnovne demo cene
                  rezervacije.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const d = new FormData(e.currentTarget);
                    s.setSettings({
                      ...s.settings,
                      ...(Object.fromEntries(d) as Record<string, string>),
                    });
                    s.toast("Planski cenovnik je sačuvan.");
                  }}
                >
                  <div className="ad-form-grid">
                    {rooms.map((r) => (
                      <label key={r.id}>
                        {r.name} · EUR / noć
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          name={"price-" + r.id}
                          defaultValue={s.settings["price-" + r.id] || r.price}
                          required
                        />
                      </label>
                    ))}
                  </div>
                  <button className="ad-primary">Sačuvaj cenovnik</button>
                </form>
              </section>
            </>
          )}
          {tab === "pricing" && (
            <>
              <div className="ad-info-strip"><Tags size={20} /><span>Promene u ovoj prezentaciji ostaju samo u demo okruženju. Moguće je voditi različite cene za sezonu, vikend i posebne datume.</span></div>
              <div className="ad-rate-grid">
                {rooms.map((room, index) => (
                  <article className="ad-panel ad-rate-card" key={room.id}>
                    <img src={room.image} alt={room.name} />
                    <div><span className="ad-eyebrow">SOBA {room.number}</span><h2>{room.name}</h2><p>Osnovna cena po noći</p><strong>{s.settings[`price-${room.id}`] || room.price} €</strong><span>Kapacitet do {room.capacity} gosta · {room.size} m²</span><button className="ad-text-button" onClick={() => s.toast(`Cenovnik za ${room.name} je otvoren u demo režimu.`)}>Uredi cenovnik <ArrowUpRight size={16} /></button></div>
                    <i style={{ width: `${72 + index * 9}%` }} />
                  </article>
                ))}
              </div>
              <section className="ad-panel ad-settings-panel">
                <span className="ad-eyebrow">SEZONE I PRAVILA</span><h2>Cena u pravom trenutku.</h2><p>Podesite period, minimalan broj noćenja i korekciju cene. Sistem može automatski primeniti pravilo na direktni sajt i povezane kanale.</p>
                <form onSubmit={(event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>; s.setSettings({ ...s.settings, ...values }); s.toast("Demo cenovnik i pravila su sačuvani."); }}>
                  <div className="ad-form-grid">
                    <label>Naziv perioda<input name="season-name" defaultValue={s.settings["season-name"] || "Praznični vikend"} /></label>
                    <label>Korekcija cene<select name="season-adjust" defaultValue={s.settings["season-adjust"] || "+20%"}><option>+10%</option><option>+20%</option><option>+30%</option><option>-10%</option></select></label>
                    <label>Od datuma<input type="date" name="season-start" defaultValue={s.settings["season-start"] || addDays(today, 30)} /></label>
                    <label>Do datuma<input type="date" name="season-end" defaultValue={s.settings["season-end"] || addDays(today, 35)} /></label>
                    <label>Minimalan boravak<select name="minimum-stay" defaultValue={s.settings["minimum-stay"] || "2 noći"}><option>1 noć</option><option>2 noći</option><option>3 noći</option></select></label>
                    <label>Popust za 5+ noći<select name="long-stay" defaultValue={s.settings["long-stay"] || "10%"}><option>Bez popusta</option><option>5%</option><option>10%</option><option>15%</option></select></label>
                  </div><button className="ad-primary"><Check size={17} /> Sačuvaj demo pravila</button>
                </form>
              </section>
              <div className="ad-card-grid ad-package-grid">
                {[{name:"Romantični vikend",copy:"2 noći · doručak · kasna odjava",price:"229 €"},{name:"Porodični predah",copy:"3 noći · dodatni ležaj · igraonica",price:"315 €"},{name:"Slavimo zajedno",copy:"Apartman · dekoracija · večera",price:"389 €"}].map((item) => <article className="ad-panel" key={item.name}><Gift size={23}/><span className="ad-eyebrow">PAKET PONUDA</span><h2>{item.name}</h2><p>{item.copy}</p><strong>{item.price}</strong><button className="ad-secondary" onClick={() => s.toast(`${item.name} je označen kao aktivna demo ponuda.`)}>Aktiviraj ponudu</button></article>)}
              </div>
            </>
          )}
          {tab === "messages" && (
            <>
              <div className="ad-metrics ad-three">
                <article><span>Poruke ovog meseca</span><strong>146</strong><footer>Potvrde, podsetnici i zahvalnice</footer></article>
                <article><span>Otvorene poruke</span><strong>82<small>%</small></strong><footer>Ilustrativna stopa otvaranja</footer></article>
                <article><span>Čeka odgovor</span><strong>04</strong><footer>2 gosta · 2 upita za proslavu</footer></article>
              </div>
              <div className="ad-message-layout">
                <div className="ad-template-list">{messageTemplates.map((template) => { const enabled = s.settings[`message-${template.id}`] !== "off"; return <article className="ad-panel ad-template-card" key={template.id}><div className="ad-template-icon"><Mail size={20}/></div><div><span className="ad-eyebrow">{template.timing}</span><h2>{template.title}</h2><p>{template.subject}</p><div className="ad-template-actions"><button className={`ad-switch ${enabled ? "on" : ""}`} aria-pressed={enabled} onClick={() => { s.setSettings({...s.settings,[`message-${template.id}`]:enabled?"off":"on"}); s.toast(enabled?"Automatska poruka je pauzirana.":"Automatska poruka je uključena."); }}><i/>{enabled?"Aktivno":"Pauzirano"}</button><button className="ad-text-button" onClick={() => s.toast("Test poruka je prikazana samo u demou.")}>Pošalji test <ArrowUpRight size={15}/></button></div></div></article>})}</div>
                <aside className="ad-phone-preview"><span className="ad-eyebrow">PREGLED PORUKE</span><div className="ad-phone"><header>Crystal Light <small>danas 10:42</small></header><div><p>Zdravo Ana,</p><p>{messageTemplates[1].copy}</p><span>Crystal Light tim ✦</span></div><footer>Automatska demo poruka</footer></div><p>Nema stvarnog slanja e-mail, SMS ili Viber poruka.</p></aside>
              </div>
            </>
          )}
          {tab === "vouchers" && (
            <>
              <div className="ad-toolbar"><p>Poklon vaučeri kupljeni preko sajta ili uneti na recepciji.</p><button className="ad-primary" onClick={() => { s.addVoucher({id:`GIFT-${Date.now().toString().slice(-4)}`,amount:200,name:"Novi gost"}); s.toast("Novi demo vaučer od 200 € je kreiran."); }}><Plus size={18}/> Novi vaučer</button></div>
              <div className="ad-metrics ad-three"><article><span>Aktivni vaučeri</span><strong>{String(s.vouchers.length).padStart(2,"0")}</strong><footer>Spremni za korišćenje</footer></article><article><span>Ukupna vrednost</span><strong>{money(s.vouchers.reduce((sum,item)=>sum+item.amount,0))}</strong><footer>Demonstracioni iznos</footer></article><article><span>Iskorišćeno ove godine</span><strong>08</strong><footer>1.240 € vrednosti boravaka</footer></article></div>
              <div className="ad-voucher-grid">{s.vouchers.map((voucher,index)=><article className="ad-voucher" key={voucher.id}><div><span>CRYSTAL LIGHT</span><Gift size={30}/></div><small>POKLON VAUČER</small><h2>{voucher.amount} €</h2><p>Za {voucher.name}</p><footer><span>{voucher.id}</span><span>Važi još {10-index} meseci</span></footer><button onClick={()=>s.toast(`Vaučer ${voucher.id} je označen za demo proveru.`)}>Proveri vaučer <ArrowUpRight size={16}/></button></article>)}</div>
            </>
          )}
          {tab === "website" && (
            <>
              <div className="ad-info-strip"><Globe2 size={20}/><span>Uredite šta gost vidi bez pozivanja programera. Ovaj ekran predstavlja budući CMS; izmene su samo vizuelna simulacija.</span></div>
              <div className="ad-website-layout"><section className="ad-panel ad-content-list"><div className="ad-panel-title"><div><span className="ad-eyebrow">JAVNI SAJT</span><h2>Sadržaj koji prodaje doživljaj.</h2></div><Link to="/" target="_blank" className="ad-secondary">Pogledaj sajt <ArrowUpRight size={16}/></Link></div>{websiteSections.map(({title,state,detail,icon:Icon})=><article key={title}><Icon size={21}/><div><strong>{title}</strong><p>{detail}</p></div><span className="ad-badge green">{state}</span><button aria-label={`Uredi ${title}`} onClick={()=>s.toast(`${title}: demo editor je spreman za prikaz.`)}><ArrowUpRight size={17}/></button></article>)}</section><aside className="ad-panel ad-site-score"><span className="ad-eyebrow">SPREMNOST SAJTA</span><strong>94<small>/100</small></strong><div className="ad-score-ring"><i/></div><ul><li><Check size={15}/> Mobilni prikaz</li><li><Check size={15}/> Direktna rezervacija</li><li><Check size={15}/> Kalendari dostupnosti</li><li><Check size={15}/> SEO struktura</li><li><Check size={15}/> AI čitljiv sadržaj</li></ul><button className="ad-secondary" onClick={()=>s.toast("Demo SEO provera: sve ključne stranice su spremne.")}>Pokreni SEO proveru</button></aside></div>
            </>
          )}
          {tab === "team" && (
            <>
              <div className="ad-toolbar"><p>Svako vidi samo ono što mu je potrebno za rad.</p><button className="ad-primary" onClick={()=>s.toast("Poziv za novog člana tima je kreiran u demou.")}><Plus size={18}/> Dodaj člana tima</button></div>
              <div className="ad-team-grid">{teamMembers.map((member)=><article className="ad-panel ad-team-card" key={member.name}><div className="ad-team-avatar">{member.initials}</div><div><span className="ad-badge green">{member.role}</span><h2>{member.name}</h2><p>{member.access}</p><small>{member.shift}</small></div><button onClick={()=>s.toast(`Otvorena su demo prava za: ${member.name}.`)}><Settings2 size={17}/></button></article>)}</div>
              <section className="ad-panel ad-permissions"><span className="ad-eyebrow">PRAVA PRISTUPA</span><h2>Jasne uloge. Mirna smena.</h2><div><span>Funkcija</span><b>Vlasnik</b><b>Recepcija</b><b>Domaćinstvo</b></div>{[["Rezervacije i gosti",1,1,0],["Cene i finansije",1,0,0],["Proslave i upiti",1,1,0],["Status pripreme soba",1,1,1],["Kanali i integracije",1,0,0]].map(([label,...values])=><div key={String(label)}><span>{label}</span>{values.map((value,index)=><b key={index}>{value?<Check size={15}/>:"—"}</b>)}</div>)}</section>
            </>
          )}
          {tab === "settings" && (
            <section className="ad-panel ad-settings-panel">
              <span className="ad-eyebrow">VAŠ RADNI PROSTOR</span>
              <h2>Sistem koji se prilagođava vama.</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  s.setSettings({
                    ...s.settings,
                    ...(Object.fromEntries(d) as Record<string, string>),
                  });
                  s.toast("Podešavanja su sačuvana.");
                }}
              >
                <div className="ad-form-grid">
                  <label>
                    Demo uloga
                    <select name="role" defaultValue={role}>
                      <option>Vlasnik</option>
                      <option>Recepcioner</option>
                      <option>Domaćinstvo</option>
                    </select>
                  </label>
                  {role === "Vlasnik" && (
                    <>
                      <label>
                        Naziv hotela
                        <input
                          name="hotel"
                          required
                          defaultValue={s.settings.hotel}
                        />
                      </label>
                      <label>
                        Doručak · EUR
                        <input
                          type="number"
                          min="0"
                          max="200"
                          name="breakfast"
                          defaultValue={s.settings.breakfast}
                        />
                      </label>
                      <label>
                        Kasni odlazak · EUR
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          name="late"
                          defaultValue={s.settings.late}
                        />
                      </label>
                      <label>
                        Parking · EUR
                        <input
                          type="number"
                          min="0"
                          max="200"
                          name="parking"
                          defaultValue={s.settings.parking}
                        />
                      </label>
                      <label>
                        Automatske poruke
                        <select
                          name="messages"
                          defaultValue={s.settings.messages || "Isključeno"}
                        >
                          <option>Isključeno</option>
                          <option>Demo pregled uključen</option>
                        </select>
                      </label>
                    </>
                  )}
                </div>
                <div className="ad-info-strip">
                  <ShieldCheck size={20} />
                  <span>
                    Uloge služe demonstraciji prikaza. Nema autentifikacije,
                    stvarnog slanja poruka ili povezivanja sa eTuristom.
                  </span>
                </div>
                {s.settings.messages === "Demo pregled uključen" && (
                  <p className="ad-guest-note">
                    Primer poruke: „Poštovani, radujemo se vašem dolasku u
                    Crystal Light. Vaša demo rezervacija je potvrđena.“
                  </p>
                )}
                {role === "Vlasnik" && (
                  <div className="ad-guest-note">
                    <h3>eTurista · demo prijava</h3>
                    <p>
                      Prikažite simulaciju prijave gostiju bez slanja podataka
                      državnom sistemu.
                    </p>
                    <button
                      type="button"
                      className="ad-secondary"
                      onClick={() => {
                        s.setSettings({
                          ...s.settings,
                          eturista: new Date().toLocaleString("sr-Latn-RS"),
                        });
                        s.toast(
                          "Demo prijava gostiju završena. Podaci nisu poslati eTuristi.",
                        );
                      }}
                    >
                      Simuliraj prijavu gostiju
                    </button>
                    {s.settings.eturista && (
                      <p>Poslednja demo prijava: {s.settings.eturista}</p>
                    )}
                  </div>
                )}
                <button className="ad-primary">
                  <Check size={17} /> Sačuvaj podešavanja
                </button>
              </form>
            </section>
          )}
          <footer className="ad-footer">
            <span>
              CRYSTAL LIGHT <i>hospitality, thoughtfully connected.</i>
            </span>
            <span>Demo okruženje · podaci ostaju na ovom uređaju</span>
          </footer>
        </main>
      </div>
      <dialog
        ref={dialog}
        className="ad-dialog"
        onCancel={() => setModal(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(false);
        }}
      >
        <div className="ad-modal-head">
          <div>
            <span className="ad-eyebrow">CRYSTAL LIGHT · RECEPCIJA</span>
            <h2>
              {block
                ? "Blokiranje termina"
                : editing?.id
                  ? "Detalji rezervacije"
                  : "Nova rezervacija"}
            </h2>
          </div>
          <button
            aria-label="Zatvori"
            className="ad-icon"
            onClick={() => setModal(false)}
          >
            <X size={22} />
          </button>
        </div>
        {modal && (
          <form onSubmit={save}>
            <div className="ad-form-grid">
              <label>
                Soba
                <select
                  name="roomId"
                  defaultValue={editing?.roomId || rooms[0].id}
                >
                  {rooms.map((r) => (
                    <option value={r.id} key={r.id}>
                      {r.number} · {r.name} · do {r.capacity} gosta
                    </option>
                  ))}
                </select>
              </label>
              {!block && (
                <label>
                  Broj gostiju
                  <input
                    type="number"
                    name="guests"
                    min="1"
                    max="4"
                    defaultValue={editing?.guests || 2}
                    required
                  />
                </label>
              )}
              <label>
                Dolazak / početak
                <input
                  type="date"
                  name="start"
                  defaultValue={editing?.start || today}
                  required
                />
              </label>
              <label>
                Odlazak / kraj
                <input
                  type="date"
                  name="end"
                  defaultValue={editing?.end || addDays(today, 1)}
                  required
                />
              </label>
              {!block && (
                <>
                  <label>
                    Ime i prezime
                    <input
                      name="name"
                      defaultValue={editing?.name}
                      required
                      minLength={3}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      defaultValue={editing?.email}
                      required
                    />
                  </label>
                  <label>
                    Telefon
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={editing?.phone}
                      required
                      minLength={6}
                    />
                  </label>
                  <label>
                    Kanal
                    <select
                      name="channel"
                      defaultValue={editing?.channel || "Recepcija"}
                    >
                      {[
                        "Recepcija",
                        "Direktno",
                        "Telefon",
                        "Booking.com",
                        "Airbnb",
                        "Expedia",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      name="status"
                      defaultValue={editing?.status || "Potvrđena"}
                    >
                      {statuses.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Plaćanje
                    <select
                      name="payment"
                      defaultValue={editing?.payment || "Na recepciji"}
                    >
                      {["Na recepciji", "Plaćeno", "Demo kartica"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>
            <label className="ad-full-label">
              {block ? "Razlog blokiranja" : "Beleška za tim"}
              <textarea
                name="note"
                rows={3}
                defaultValue={editing?.note}
                placeholder="Detalji koji čine razliku…"
              />
            </label>
            {!block && (
              <p className="ad-form-hint">
                Osnovna cena se računa prema sobi i broju noći. Pri promeni sobe
                ili datuma iznos se ponovo računa bez dodataka.
              </p>
            )}
            {error && (
              <p role="alert" className="ad-error">
                {error}
              </p>
            )}
            <div className="ad-modal-actions">
              {editing?.id && editing.status !== "Otkazana" && (
                <button
                  type="button"
                  className="ad-danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        block
                          ? "Osloboditi blokirani termin?"
                          : "Otkazati ovu rezervaciju?",
                      )
                    ) {
                      s.setBookings((prev) =>
                        prev.map((b) =>
                          b.id === editing.id
                            ? { ...b, status: "Otkazana" }
                            : b,
                        ),
                      );
                      setModal(false);
                      s.toast("Termin je oslobođen.");
                    }
                  }}
                >
                  {block ? "Oslobodi termin" : "Otkaži rezervaciju"}
                </button>
              )}
              <button
                type="button"
                className="ad-secondary"
                onClick={() => setModal(false)}
              >
                Zatvori
              </button>
              <button className="ad-primary">
                <Check size={17} /> Sačuvaj
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
