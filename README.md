# Project NOVA Platform — The Future of Science Education

A modern, responsive landing page for Nirupam Science Edge, a premium science coaching institute specializing in concept-based learning and visual understanding.

## 🎯 Overview

Project NOVA is a fully-designed educational platform website showcasing:

- **Hero Section** — Cinematic landing with animated orbital visuals
- **About** — Institute mission, vision, and key achievements
- **Courses** — Three core programs (Class 11, Class 12, Foundation)
- **Results** — Performance metrics with animated counters
- **Student Journey** — 4-step learning pathway timeline
- **Why Choose Us** — Key differentiators with hover animations
- **Testimonials** — Real student feedback
- **CTA Section** — Call-to-action with contact details
- **Footer** — Navigation and branding

## 📁 Project Structure

```
Project-Nova/
│
├── index.html               # Main landing page
│
├── assets/
│   ├── css/
│   │   ├── style.css        # Core styles and component rules
│   │   ├── animations.css   # Animation keyframes and effects
│   │   └── responsive.css   # Mobile and tablet breakpoints
│   │
│   ├── js/
│   │   ├── script.js        # Main JavaScript
│   │   ├── animations.js    # Scroll triggers and counters
│   │   └── particles.js     # Particle background effects
│   │
│   ├── images/              # Project images
│   ├── icons/               # Icon assets
│   └── fonts/               # Custom fonts
│
├── README.md                # Project documentation
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🎨 Design Features

- **Modern Glass-Morphism** — Frosted glass cards with backdrop filters
- **Gradient UI** — Primary (Indigo) and Secondary (Cyan) color palette
- **Smooth Animations** — Hover effects, scroll reveals, and count-up animations
- **Responsive Design** — Mobile-first approach with breakpoints at 1024px, 768px, 480px
- **Premium Interactions** — Light-sweep hover, smooth transitions, scale effects

## 🚀 Key Sections

### Hero
- Large title with gradient text
- Animated orbital visual (rotating rings + nucleus)
- Dual CTA buttons

### Results
- 4-card metric display
- IntersectionObserver-triggered count-up animations
- Hover elevations with glow effects

### Student Journey
- Horizontal timeline with gradient circles
- 4-step learning pathway
- Connecting line visualization

### Why Choose Us
- 4 feature cards with emoji icons
- Premium light-sweep hover animation
- Fixed height for card consistency

### Testimonials
- 3-card testimonial grid
- Apple-style minimalist design
- Hover elevation effects

## 🛠 Technologies

- **HTML5** — Semantic markup
- **CSS3** — Grid, Flexbox, Gradients, Filters
- **JavaScript (Vanilla)** — IntersectionObserver, DOM manipulation
- **Responsive CSS** — Mobile-first media queries

## 📱 Responsive Breakpoints

- **Desktop** — 1024px+
- **Tablet** — 768px - 1024px
- **Mobile** — 480px - 768px
- **Small Mobile** — Below 480px

## 💻 Getting Started

1. Open `index.html` in a modern web browser
2. All assets are locally referenced and no build tools are required
3. Customize colors in `assets/css/style.css` (CSS variables under `:root`)

### Backend server (Node.js + Express) for NOVA Mentor

The project includes a lightweight Node.js backend that serves the static site and provides the `/api/nli/explain` endpoint. If you provide an OpenAI API key it will forward requests to OpenAI; otherwise the server returns a mocked response for development.

1. Install dependencies:

```powershell
npm install
```

2. Create a `.env` file in the project root with your OpenAI key:

```
OPENAI_API_KEY=sk-...
```

3. Start the server:

```powershell
npm start
```

The app will be available at `http://localhost:3000`. To preview frontend-only without Node.js you can still use:

```powershell
python -m http.server 8000
```

## 🎨 Color Palette

```css
--primary: #4F46E5      /* Indigo */
--secondary: #06B6D4    /* Cyan */
--dark: #050816         /* Deep Dark */
--surface: #0B1120      /* Surface */
--text: #CBD5E1         /* Light Gray Text */
```

## 📊 Performance

- Fully static HTML (no dependencies)
- Optimized CSS with minimal repaints
- Vanilla JavaScript for lightweight interactions
- Lazy animations triggered by scroll

## 🔧 Customization

### Update Institute Details
- Edit footer contact info
- Update course descriptions
- Modify testimonial quotes and names
- Change color palette in `:root`

### Add New Sections
1. Create markup in `index.html`
2. Add styles to `assets/css/style.css`
3. Add responsive rules to `assets/css/responsive.css`
4. Add animations to `assets/css/animations.css` or `assets/js/animations.js`

## 📝 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

All rights reserved. © 2026 Nirupam Science Edge.

---

Built with care for the future of science education. 🚀
