# Vlog & Article Platform (Next.js + TypeScript + Tailwind CSS)

මෙම වෙබ් අඩවිය Vlog (YouTube වීඩියෝ) සහ ලිපි (Articles) එකම තැනකින් පෙන්වීමට හැකි වන සේ Next.js 14 App Router සහ Tailwind CSS යොදා සකස් කරන ලද සම්පූර්ණ Project එකකි.

## 🚀 විශේෂාංග (Features)
- **Vlog & Article Support:** YouTube embed player සමඟ වීඩියෝ නැරඹීමේ පහසුකම සහ සවිස්තරාත්මක ලිපි කියවීමේ පහසුකම.
- **Smart Filtering & Search:** Category අනුව (All, Vlogs, Articles) සහ Search bar එකක් මඟින් posts සෙවීමේ හැකියාව.
- **Responsive & Modern Design:** ජංගම දුරකථන සහ පරිගණක සඳහා අලංකාර UI නිර්මාණය.
- **Dynamic Post Pages:** එක් එක් ලිපිය/vlog එක සඳහා වෙනම URL (`/posts/[slug]`).
- **Create Post UI:** අලුතින් ලිපි හෝ vlog එකතු කිරීමට Form පිටුවක් (`/create`).

## 🛠️ Run කරන්නේ කෙසේද? (How to run)

1. ZIP file එක Extract කර Folder එකට යන්න:
```bash
cd vlog-article-platform
```

2. Dependencies install කරගන්න:
```bash
npm install
```

3. Development server එක run කරන්න:
```bash
npm run dev
```

4. Browser එකෙන් බලන්න:
[http://localhost:3000](http://localhost:3000)

## 📦 Project Structure
- `app/page.tsx` - ප්‍රධාන පිටුව (Feed, Filtering, Search)
- `app/posts/[slug]/page.tsx` - එක් එක් Post එකේ විස්තර සහ වීඩියෝ player පිටුව
- `app/create/page.tsx` - අලුත් Vlog / Article එකක් දැමීමේ පිටුව
- `components/` - Navbar, PostCard වැනි Reusable Components
- `data/posts.ts` - ලිපි සහ Vlog දත්ත (Sample data)
- `types/post.ts` - TypeScript Data Models
