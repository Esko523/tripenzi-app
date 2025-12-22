# 🌍 Tripenzi App

**Tripenzi** je moderní cestovní společník navržený jako **Progressive Web App (PWA)**. Umožňuje skupinám přátel plánovat itinerář, sledovat společné výdaje a spravedlivě se vyrovnat – to vše s podporou offline režimu.

![Status](https://img.shields.io/badge/Status-Development-blue)
![Tech](https://img.shields.io/badge/Built%20with-Next.js%2016%20%2B%20Supabase-black)

## ✨ Hlavní funkce

### 💸 Sdílený rozpočet & Výdaje
- **Komplexní správa dluhů:** Automatický výpočet "kdo komu dluží" (podobně jako Splitwise).
- **Podpora více měn:** Automatický přepočet kurzů (např. platba v EUR se přepočte na základní měnu tripu, např. CZK) pomocí API.
- **Flexibilní dělení:**
  - Rovným dílem.
  - Přesnou částkou.
  - Podle podílů.
- **Integrovaná kalkulačka:** Rychlé zadávání částek přímo v aplikaci.
- **Grafy a statistiky:** Přehled útraty podle kategorií (jídlo, doprava, ubytování...) a jednotlivých osob.

### 📅 Itinerář a Plánování
- Denní harmonogram cesty.
- Integrace s **Google Maps** pro lokace.
- Barevné štítkování událostí.
- Možnost úpravy času a data aktivit.

### 🚀 Offline First & PWA
- **Plná funkčnost bez internetu:** Data se ukládají lokálně (`localStorage`) a synchronizují se se serverem (Supabase), jakmile jste online.
- **Instalace do mobilu:** Aplikace se chová jako nativní appka (díky manifestu a service workerům).
- Rychlé načítání a cachování dat.

### 👥 Správa a Sdílení
- Snadné připojení k tripu pomocí **6místného kódu**.
- Vlastní uživatelské profily a avatary.
- Filtrování cest (Budoucí, Probíhající, Minulé).

## 🛠 Použité technologie

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **PWA:** `@ducanh2912/next-pwa`
- **Ikony:** Vlastní SVG set + Lucide React style
- **Data Fetching:** Real-time subscriptions přes Supabase kanály.

## ⚙️ Instalace a spuštění

Pro spuštění projektu lokálně postupujte následovně:

1. **Naklonujte repozitář:**
   ```bash
   git clone [https://github.com/tvoje-jmeno/tripenzi-app.git](https://github.com/tvoje-jmeno/tripenzi-app.git)
   cd tripenzi-app