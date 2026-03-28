# Portal Ofert Pracy 💼

Nowoczesna aplikacja webowa do zarządzania ofertami pracy i aplikacjami kandydatów. Projekt został zbudowany z wykorzystaniem Next.js, React i Supabase.

## ✨ Główne Funkcjonalności

### 🔐 Autentykacja i Konta
- **Rejestracja** - Tworzenie nowych kont użytkownika
- **Logowanie** - Bezpieczne logowanie za pomocą Supabase Auth
- **System blokady** - Admin może zablokować użytkownika, uniemożliwiając mu logowanie

### 💼 Role Użytkowników

#### 👤 User (Kandydat)
- Przeglądanie dostępnych ofert pracy
- Filtrowanie ofert (lokalizacja, typ zatrudnienia, wynagrodzenie, praca zdalna)
- Aplikowanie na oferty pracy
- Śledzenie swoich aplikacji i ich statusu
- Przegląd aplikacji ze szczegółami ofert

#### 🏢 Employer (Pracodawca)
- **Panel pracodawcy** z dostępem do:
  - Dodawanie nowych ofert pracy
  - Edytowanie i usuwanie ofert
  - Publikowanie/wycofywanie ofert z publiczności
  - Zarządzanie aplikacjami kandydatów
  - Zmiana statusu aplikacji (oczekująca, zaakceptowana, odrzucona)
  - Przeglądanie CV kandidatów

#### 👨‍💼 Admin (Administrator)
- **Kompleksowy panel administracyjny** z trzema sekcjami:
  
  **📋 Zarządzanie Kontami:**
  - Przeglądanie wszystkich użytkowników
  - Zmiana roli użytkownika (user, employer, admin)
  - Blokowanie/odblokowywanie użytkowników
  - Usuwanie kont
  - Przeglądanie aplikacji konkretnego użytkownika
  
  **📢 Zarządzanie Ogłoszeniami:**
  - Przeglądanie wszystkich ogłoszeń w systemie
  - Publikowanie/wycofywanie ogłoszeń
  - Usuwanie ogłoszeń (z kaskadowym usunięciem powiązanych aplikacji)
  - Filtrowanie ogłoszeń (status, data)
  - Przeglądanie szczegółów każdego ogłoszenia
  
  **✅ Zarządzanie Statusami:**
  - Przeglądanie wszystkich aplikacji w systemie
  - Zmiana statusu aplikacji

### 🔍 Wyszukiwanie i Filtrowanie
- Filtrowanie ofert po:
  - Lokalizacji
  - Typie zatrudnienia (pełny etat, część etatu, staż, kontrakt)
  - Warunkach pracy (zdalna, hybrydowa, stacjonarna)
  - Wynagrodzeniu
- Wyszukiwanie po frazie w tytule oferty

### 📱 Responsywny Design
- W pełni responsywny interfejs
- Optymalizacja dla urządzeń mobilnych (ekrany do 640px)
- Tabele konwertowane na karty na małych ekranach
- Działania dostosowane do rozmiarów ekranu

### 🌐 Język
Cała aplikacja dostępna w **języku polskim** z odpowiednim formatowaniem dat i walut.

## 📊 Struktura Danych

### Tabele Supabase
- **auth.users** - Autentykacja użytkowników
- **profiles** - Profile użytkowników z rolami (user, employer, admin)
- **jobs** - Oferty pracy
- **applications** - Aplikacje kandydatów
- **statuses** - Możliwe statusy aplikacji

### Relacje
- Użytkownik → wiele aplikacji
- Pracodawca → wiele ogłoszeń
- Ogłoszenie → wiele aplikacji

## 🛠️ Technologia

- **Frontend:** Next.js 16.1.6, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Hosting:** Zoptymalizowane do wdrożenia na Vercel

## 🚀 Możliwości

- ✅ Pełny cykl rekrutacji
- ✅ Bezpieczna autentykacja
- ✅ Kontrola dostępu oparta na rolach (RBAC)
- ✅ Responsywny interfejs
- ✅ Zarządzanie aplikacjami kandydatów
- ✅ Panel admina z pełnym kontrolowaniem systemu
- ✅ Blokowanie/odblokowywanie użytkowników
- ✅ Kaskadowe usuwanie danych (aplikacje usuwane z ogłoszeniami)

## 👥 Zespół
- **Lera** - Autentykacja, baza danych, panel użytkownika
- **Michał** - Ogłoszenia pracy, panel pracodawcy
- **Yana** - Panel administratora, zarządzanie użytkownikami
