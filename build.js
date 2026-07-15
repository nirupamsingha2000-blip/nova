// build.js — assembles the static multi-page site from partials/ + content/.
// Node core only, no npm dependencies. Run with: node build.js
//
// Edit files under partials/ or content/, then re-run this script — never
// hand-edit the generated .html output files directly (see the banner comment
// at the top of each one).

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// Replace once the site has a real domain — used for sitemap.xml/canonical links.
const SITE_URL = 'https://REPLACE-ONCE-DOMAIN-KNOWN';

const read = (relPath) => fs.readFileSync(path.join(ROOT, relPath), 'utf8');
const write = (relPath, contents) => {
    const fullPath = path.join(ROOT, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, contents, 'utf8');
};

const partials = {
    loader: read('partials/loader.html'),
    nav: read('partials/nav.html'),
    footer: read('partials/footer.html'),
    floatingButtons: read('partials/floating-buttons.html'),
    scripts: read('partials/scripts.html'),
};

const PAGES = [
    {
        out: 'index.html',
        title: 'Project NOVA Platform | The Future of Science Education',
        description: 'Project NOVA by Nirupam Science Edge, Shillong — concept-first Physics, Chemistry & Maths coaching for Class 11, 12, Boards, CUET, JEE and NEET.',
        navKey: 'home',
        content: 'content/home.html',
        extraScripts: ['assets/js/concept-lab.js'],
    },
    {
        out: 'about.html',
        title: 'About Us | Project NOVA — Nirupam Science Edge, Shillong',
        description: 'Concept-first science coaching in Shillong. Our mission, vision, and what makes Project NOVA different for Class 11, 12, CUET, JEE and NEET students.',
        navKey: 'about',
        content: 'content/about.html',
    },
    {
        out: 'courses.html',
        title: 'Courses | Project NOVA — Class 11, Class 12 Boards & Foundation Program',
        description: "Explore Project NOVA's science coaching programs in Shillong: Class 11 Science, Class 12 Boards + CUET prep, and our Foundation Program for JEE/NEET readiness.",
        navKey: 'courses',
        content: 'content/courses.html',
    },
    {
        out: 'courses/class-11.html',
        title: 'Class 11 Science Course | Project NOVA',
        description: 'Concept-first Physics, Chemistry & Maths for Class 11 students in Shillong — weekly tests, notes included, doubt classes.',
        navKey: 'courses',
        content: 'content/courses/class-11.html',
    },
    {
        out: 'courses/class-12-boards.html',
        title: 'Class 12 Boards Course | Project NOVA',
        description: 'Complete Class 12 Boards, CUET and competitive exam preparation with PYQ practice, mock tests and personal mentoring.',
        navKey: 'courses',
        content: 'content/courses/class-12-boards.html',
    },
    {
        out: 'courses/foundation.html',
        title: 'Foundation Program | Project NOVA',
        description: 'Build strong fundamentals for future JEE & NEET preparation with concept building, problem solving and weekly assessment.',
        navKey: 'courses',
        content: 'content/courses/foundation.html',
    },
    {
        out: 'results.html',
        title: 'Results | Project NOVA — Student Success Stories',
        description: '500+ students mentored, 95% board success rate, 50+ top rank holders. See what students say about Project NOVA.',
        navKey: 'results',
        content: 'content/results.html',
    },
    {
        out: 'faq.html',
        title: 'FAQ | Project NOVA',
        description: 'Answers to common questions about boards covered, batch sizes, demo classes, progress tracking and more at Project NOVA.',
        navKey: 'faq',
        content: 'content/faq.html',
    },
    {
        out: 'contact.html',
        title: 'Contact & Book a Demo | Project NOVA',
        description: 'Book a free demo class or get in touch with Project NOVA in Shillong, Meghalaya. Phone, email, and location details.',
        navKey: 'contact',
        content: 'content/contact.html',
    },
    {
        out: 'privacy-policy.html',
        title: 'Privacy Policy | Project NOVA',
        description: 'How Project NOVA collects and uses your information.',
        navKey: null,
        content: 'content/privacy-policy.html',
    },
    {
        out: 'student-portal.html',
        title: 'Student Portal | Project NOVA',
        description: 'Preview of the Project NOVA student dashboard — attendance, homework, scores, notes and lectures.',
        navKey: null,
        content: 'content/student-portal.html',
        extraScripts: ['assets/js/portal.js'],
        noindex: true,
    },
    {
        out: 'teacher-portal.html',
        title: 'Teacher Portal | Project NOVA',
        description: 'Preview of the Project NOVA faculty dashboard — create tests, upload notes, mark attendance and more.',
        navKey: null,
        content: 'content/teacher-portal.html',
        extraScripts: ['assets/js/portal.js'],
        noindex: true,
    },
];

function renderNav(navHtml, activeKey) {
    let out = navHtml;
    if (activeKey) {
        out = out.replace(`<a data-nav-key="${activeKey}"`, `<a data-nav-key="${activeKey}" class="active"`);
    }
    return out.replace(/\s*data-nav-key="[^"]*"/g, '');
}

function resolveIncludes(contentHtml) {
    return contentHtml.replace(/<!--#include partial="([\w-]+)"\s*-->/g, (match, name) => {
        const partialPath = `partials/${name}.html`;
        if (!fs.existsSync(path.join(ROOT, partialPath))) {
            throw new Error(`Unknown partial include: ${name} (expected ${partialPath})`);
        }
        return read(partialPath);
    });
}

function headMeta(page) {
    return `    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>${page.title}</title>

    <meta name="description" content="${page.description}">
    <meta name="theme-color" content="#050816">
    ${page.noindex ? '<meta name="robots" content="noindex, nofollow">' : '<!-- Add <link rel="canonical" href="' + SITE_URL + '/' + page.out.replace(/index\\.html$/, '') + '"> once the site has a live domain -->'}

    <meta property="og:type" content="website">
    <meta property="og:title" content="${page.title}">
    <meta property="og:description" content="${page.description}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${page.title}">
    <meta name="twitter:description" content="${page.description}">

    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%234F46E5'/%3E%3Cstop offset='1' stop-color='%2306B6D4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='%23050816'/%3E%3Ccircle cx='32' cy='32' r='23' fill='none' stroke='url(%23g)' stroke-width='4'/%3E%3Ccircle cx='32' cy='32' r='7' fill='url(%23g)'/%3E%3C/svg%3E">

    <link rel="preconnect"
          href="https://fonts.googleapis.com">

    <link rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet">

    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="stylesheet" href="/assets/css/animations.css">
    <link rel="stylesheet" href="/assets/css/responsive.css">
`;
}

function renderPage(page) {
    const rawContent = read(page.content);
    const content = resolveIncludes(rawContent);
    const extraScripts = (page.extraScripts || [])
        .map((src) => `    <script src="/${src}"></script>`)
        .join('\n');

    return `<!DOCTYPE html>
<!-- AUTO-GENERATED by build.js — do not edit this file directly.
     Edit partials/*.html or ${page.content}, then run: node build.js -->
<html lang="en">

<head>

${headMeta(page)}
</head>

<body>

${partials.loader}
${renderNav(partials.nav, page.navKey)}
    <main>

${content}
    </main>

${partials.footer}
${partials.floatingButtons}
${partials.scripts}
${extraScripts}

</body>

</html>
`;
}

function generateSitemap(pages) {
    const urls = pages
        .filter((p) => !p.noindex)
        .map((p) => {
            const urlPath = p.out === 'index.html' ? '/' : `/${p.out}`;
            return `  <url><loc>${SITE_URL}${urlPath}</loc></url>`;
        })
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function generateRobotsTxt() {
    return `User-agent: *
Disallow: /student-portal.html
Disallow: /teacher-portal.html
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

for (const page of PAGES) {
    write(page.out, renderPage(page));
    console.log(`built ${page.out}`);
}

write('sitemap.xml', generateSitemap(PAGES));
write('robots.txt', generateRobotsTxt());
console.log('built sitemap.xml, robots.txt');
