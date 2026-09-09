# Crystal Light — demo za prodajni sastanak

## Dizajn
Preporučeni pravac: filmski hotel editorial. Originalni crno-zlatni identitet, tamna #14130f, šampanjac #d6b990, svetle sekcije #f5f2eb. Veliki serifni naslovi, jednostavan sans-serif za interfejs, tanke linije, prostrane kompozicije. Alternativa: pretežno svetli boutique hotel (mirniji utisak); alternativa: dramatičan event-first dizajn (proslave dominantne u odnosu na smeštaj).

Hero koristi dostavljeni video, bez zvuka, automatski, playsInline, sa posterom i kontrolom pauziranja. Naslov: „Neki trenuci ostaju zauvek.“ Podnaslov: „Vaš predah. Vaša proslava. Naš svet pažnje.“ Preloader koristi originalni znak, animaciju iscrtavanja prstena, svetlosni prelaz i otvaranje zavesa. Kratko trajanje, opcija preskakanja i reduced-motion varijanta.

## Javni sajt
1. Hero, navigacija i direktna pretraga soba po datumima i broju gostiju.
2. Editorial predstavljanje hotela sa originalnim fotografijama.
3. Tri tipa soba: galerija, kapacitet, oprema, demo cene i rezervacija.
4. Svečana sala: filmska fotografija, vrste proslava, javni mesečni kalendar i upit za termin.
5. Restoran i igraonica, kontakt i galerija. Wellness se prikazuje samo kao demonstraciona usluga ako nije potvrđen stvarnim materijalom.
6. Poklon vaučeri, pogodnosti za stalne goste, česta pitanja, kontakt.
7. Dostupni ulazi u rezervaciju, korisnički nalog i administraciju kroz plutajuću demo navigaciju inspirisanu Vitom.

## Booking i korisnički nalog
Datumi → izbor jedne ili više soba → dodaci i promo kod → podaci gosta i način plaćanja → potvrda. Demo cene i rezervacije jasno označene; bez stvarnog naplaćivanja ili slanja poruka. Validacija datuma, broja gostiju i kontakt podataka. Nalog prikazuje rezervacije, promenu datuma, otkazivanje uz potvrdu, dodatke, vaučere i pogodnosti. Podaci ostaju u localStorage i vidljivi su administraciji na istom uređaju.

## Administracija
Pregled dana i pokazatelja, zajednički kalendar soba, ručni unos rezervacije, kartice gostiju, check-in/out, statusi održavanja i blokiranje soba. Poseban pregled proslava i upita. Izveštaji o prihodima, popunjenosti, kanalima i uštedi, izvoz CSV za Excel. Demo postavke sezonskih cena, kanala, automatskih poruka, uloga i eTuriste. Integracije se predstavljaju kao simulacije, bez tvrdnje da su povezane.

## Tehnički plan
React + Vite + TypeScript, komponentno razdvojeni landing, booking, dashboard, admin, zajednički demo store i interfejs elementi. GSAP/ScrollTrigger za skrolovane sekvence, CSS za lake animacije. Originalni lokalni mediji; responsive prikaz, dostupna tastatura, fokus, kontrast i reduced-motion. Zajedničke cene i kalendar sprečavaju neslaganje između ekrana u demonstraciji.

## Provera i isporuka
Produkcijski build, desktop i mobilna vizuelna provera, rezervacija od pretrage do potvrde, izmena/otkazivanje, slanje demo upita za salu, check-in, filtriranje i izvoz. GitHub repozitorijum: https://github.com/mldjordje/crystal-light.git (proveren; trenutno nema objavljenih referenci). Push tek nakon implementacije i provera, kako je korisnik zatražio.

## Nepotvrđeni poslovni podaci
Cene, kapaciteti, stvarna raspoloživost, telefon/adresa i uslovi nisu navedeni u dostavljenom dokumentu. Ne izmišljati ih kao potvrđene činjenice; operativne podatke koristiti jasno kao demo. Dokument je predlog sistema, ne izvor stvarnih sadržaja hotela.
