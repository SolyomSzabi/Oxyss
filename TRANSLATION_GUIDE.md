# Translation Guide for Oxy's Barbershop

## Overview
This guide explains how to add Romanian and Hungarian translations to the customer-facing pages.

## Translation Files Location
- **English**: `/app/frontend/src/locales/en/translation.json` ✅ (Already filled)
- **Romanian**: `/app/frontend/src/locales/ro/translation.json` ⚠️ (Needs your content)
- **Hungarian**: `/app/frontend/src/locales/hu/translation.json` ⚠️ (Needs your content)

## Pages That Use Translations

### 1. Navigation (✅ Already Translated)
**File**: `/app/frontend/src/components/Navbar.jsx`

The navigation is already fully translated and working. You can see it uses:
```javascript
t('nav.home')
t('nav.services')
t('nav.gallery')
t('nav.about')
t('nav.contact')
t('nav.bookAppointment')
```

### 2. Home Page
**File**: `/app/frontend/src/pages/Home.jsx`
**Status**: ⚠️ Needs implementation

Translation keys that will be used:
- `home.hero.title`
- `home.hero.subtitle`
- `home.hero.bookNow`
- `home.hero.viewServices`
- `home.services.title`
- `home.services.viewAll`
- `home.whyChoose.title`
- `home.whyChoose.experience.title`
- `home.whyChoose.experience.desc`
- `home.whyChoose.quality.title`
- `home.whyChoose.quality.desc`
- `home.whyChoose.atmosphere.title`
- `home.whyChoose.atmosphere.desc`
- `home.cta.title`
- `home.cta.subtitle`
- `home.cta.button`

### 3. Services Page
**File**: `/app/frontend/src/pages/Services.jsx`
**Status**: ⚠️ Needs implementation

Translation keys:
- `services.title`
- `services.subtitle`
- `services.categories.men`
- `services.categories.women`
- `services.categories.kids`
- `services.duration`
- `services.startingFrom`
- `services.bookNow`

### 4. About Page
**File**: `/app/frontend/src/pages/About.jsx`
**Status**: ⚠️ Needs implementation

Translation keys:
- `about.title`
- `about.subtitle`
- `about.story.title`
- `about.story.text`
- `about.team.title`
- `about.team.subtitle`
- `about.values.title`
- `about.values.quality.title`
- `about.values.quality.desc`
- `about.values.customer.title`
- `about.values.customer.desc`
- `about.values.innovation.title`
- `about.values.innovation.desc`

### 5. Gallery Page
**File**: `/app/frontend/src/pages/Gallery.jsx`
**Status**: ⚠️ Needs implementation

Translation keys:
- `gallery.title`
- `gallery.subtitle`

### 6. Contact Page
**File**: `/app/frontend/src/pages/Contact.jsx`
**Status**: ⚠️ Needs implementation

Translation keys:
- `contact.title`
- `contact.subtitle`
- `contact.info.title`
- `contact.info.address`
- `contact.info.phone`
- `contact.info.email`
- `contact.info.hours`
- `contact.form.title`
- `contact.form.name`
- `contact.form.email`
- `contact.form.message`
- `contact.form.send`
- `contact.form.sending`
- `contact.form.success`
- `contact.form.error`
- `contact.schedule.weekdays`
- `contact.schedule.saturday`
- `contact.schedule.sunday`

### 7. Booking Page
**File**: `/app/frontend/src/pages/Booking.jsx`
**Status**: ⚠️ Needs implementation

Translation keys:
- `booking.title`
- `booking.subtitle`
- `booking.steps.barber`
- `booking.steps.service`
- `booking.steps.datetime`
- `booking.steps.details`
- `booking.selectBarber`
- `booking.selectService`
- `booking.selectDate`
- `booking.selectTime`
- `booking.availableSlots`
- `booking.noSlots`
- `booking.yourDetails`
- `booking.fullName`
- `booking.email`
- `booking.phone`
- `booking.bookingButton`
- `booking.booking`
- `booking.success`
- `booking.error`
- `booking.summary.title`
- `booking.summary.barber`
- `booking.summary.service`
- `booking.summary.date`
- `booking.summary.time`
- `booking.summary.duration`
- `booking.summary.price`

## Common Keys (Used Across All Pages)
- `common.loading`
- `common.error`
- `common.cancel`
- `common.confirm`
- `common.close`
- `common.save`
- `common.edit`
- `common.delete`
- `common.back`
- `common.next`
- `common.previous`
- `common.min`
- `common.currency`

## How to Add Translations

### Step 1: Edit Romanian Translations
Open `/app/frontend/src/locales/ro/translation.json` and fill in all the values with Romanian text.

**Example:**
```json
{
  "home": {
    "hero": {
      "title": "Experiență Premium de Frizerie",
      "subtitle": "Unde meșteșugul tradițional întâlnește stilul modern"
    }
  }
}
```

### Step 2: Edit Hungarian Translations
Open `/app/frontend/src/locales/hu/translation.json` and fill in all the values with Hungarian text.

**Example:**
```json
{
  "home": {
    "hero": {
      "title": "Prémium Borbély Élmény",
      "subtitle": "Ahol a hagyományos mesterség találkozik a modern stílussal"
    }
  }
}
```

## Testing Translations

1. Open the website
2. Click on the language switcher (globe icon) in the navigation
3. Select Romanian (🇷🇴 Română) or Hungarian (🇭🇺 Magyar)
4. Navigate through the pages to verify translations appear correctly

## Notes

- The English translation file is complete and can be used as reference
- Keep the structure (nested objects) exactly the same in all language files
- Translation keys must match exactly (case-sensitive)
- Dynamic content (like service names from database) won't be translated unless you add them to the database
- Staff pages (Barber Dashboard, Login, All Appointments) are NOT translated as requested

## Current Status

✅ **Completed:**
- i18n setup and configuration
- Language switcher component
- Navigation translations
- Translation file structure

⚠️ **Needs Your Input:**
- Romanian translations in all translation files
- Hungarian translations in all translation files

🔄 **Next Steps:**
1. Fill in Romanian translations
2. Fill in Hungarian translations
3. I will update the page components to use the translation keys
4. Test and verify all translations work correctly
