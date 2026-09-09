# Crystal Light

Mobilni prezentacioni demo hotela i svečane sale. React, TypeScript, Vite i GSAP.

## Pokretanje

```sh
npm install
npm run dev
```

Produkcijski build: `npm run build`. Pregled builda: `npm run preview`.

## Ekrani

- `/` — landing sa video herojem, animiranim uvodom, sobama, javnim kalendarom sale, upitima, galerijom i vaučerima.
- `/sobe/deluxe`, `/sobe/superior`, `/sobe/suite` — detalji i poseban kalendar dostupnosti svake sobe.
- `/booking` — izbor jedne ili više soba, datumi, dodaci, promo kod `CRYSTAL10`, podaci gosta i demo potvrda.
- `/client` — rezervacije, izmene, otkazivanje, upiti za proslave, vaučeri i profil.
- `/admin` — pregled, kalendar, rezervacije, gosti, proslave, održavanje, izveštaji, CSV izvoz i simulacije integracija.

Plutajuća navigacija povezuje sve demo ekrane. Uvod se prikazuje jednom u sesiji; dugme u footeru ga ponavlja.

## Demo podaci

Podaci se čuvaju u localStorage na istom pregledaču i uređaju. Cene, kapaciteti, datumi, gosti i operativni uslovi su demonstracioni. Nema backend servisa, autentifikacije, naplate, slanja poruka niti stvarne veze sa kanalima ili eTuristom. Originalni mediji nalaze se u `images`, a javni mediji u `public/images`.

Za početno demo stanje obrisati ključeve `crystal-demo-v1`, `crystal-profile` iz localStorage. Za ponovni uvod ukloniti `crystal-intro` iz sessionStorage.

## Hosting

Vite build izlazi u `dist`. Uključen je `vercel.json` za SPA rute pri postavljanju na Vercel. GitHub repozitorijum sam po sebi nije javno hostovana aplikacija.

## Provere

Produkcijski build i šest testova dostupnosti prošli. Urađen početni pregled mobilnih ekrana na 390 × 844. Dalje testiranje prepušteno korisniku na njegov zahtev.
