# Kaalix Cloud - Vercel Deployment & Google OAuth Guide

Yeh guide aapko Kaalix Cloud ko Vercel par 2 minute me deploy karne aur Google OAuth ko configure karne ka poora process batati hai.

---

## 1. Vercel Par Deploy Kaise Karein (Fast Method)

1. **Vercel Dashboard Kholein**: [vercel.com](https://vercel.com) par login karein.
2. **"Add New..." > "Project"** par click karein.
3. Apna GitHub repository `replitprivet-dotcom/google_drive` import karein.
4. **Build & Output Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build` (Auto-detected)
   - **Output Directory**: `dist` (Auto-detected)
5. **Environment Variables**:
   Add karein:
   - `VITE_GOOGLE_CLIENT_ID`: Apna Google Cloud OAuth Web Client ID (Optionally).
   - `GEMINI_API_KEY`: (Agar AI features use karne hon).
6. **"Deploy"** button par click karein!
   Aapko apna live URL mil jayega, jaise: `https://kaalix-cloud.vercel.app`.

---

## 2. Google OAuth: Dusre Accounts Login Kyun Block Hote Hain? (Error 403: access_denied)

Jab aap Google Cloud Console me naya OAuth Client banate hain, toh uska status default **"Testing"** mode me hota hai.
**Testing mode me Google sirf unhi emails ko login karne deta hai jo "Test users" list me added hon.**

Isliye jab aap kisi dusre account (jaise `ycharging6@gmail.com`) se login karte hain, toh Google yeh message dikhata hai:
> *"Access blocked: app has not completed the Google verification process... Error 403: access_denied"*

---

## 3. Is Error Ko Fix Karne Ke 2 Aasan Tarike:

### Tarika A (Sabse Aasan: Add Test User):
1. [console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent) par jayein.
2. Left menu me **APIs & Services** > **OAuth consent screen** par click karein.
3. Neeche scroll karein jahan **"Test users"** likha hai.
4. **"+ ADD USERS"** par click karein aur `ycharging6@gmail.com` likhein.
5. **Save** par click karein.
Ab `ycharging6@gmail.com` turant login ho jayega!

### Tarika B (Permanent: Publish App):
1. OAuth consent screen par upar **"PUBLISH APP"** button par click karein.
2. Confirm karein.
Iske baad duniya ka koi bhi Google account login kar payega!

---

## 4. Vercel Domain Ko Google Cloud Me Add Karna (Zaroori)

Jab aap Vercel par deploy karte hain, toh Google OAuth ko Vercel domain allow karna zaroori hota hai:
1. Google Cloud Console me **APIs & Services** > **Credentials** par jayein.
2. Apne OAuth 2.0 Web Client ID par click karein.
3. **Authorized JavaScript origins** me add karein:
   - `https://your-app-name.vercel.app`
4. **Save** par click karein.

Ab aapka Kaalix Cloud Vercel par 100% chalega!
