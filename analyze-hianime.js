import axios from 'axios';
import { load } from 'cheerio';

const res = await axios.get('https://hianime.ws/home', {
  headers: { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

const $ = load(res.data);

console.log('=== Detailed Structure ===\n');

// Get all distinct section titles
console.log('DISTINCT SECTION TITLES:');
const titles = new Set();
$('h1, h2, h3').each((i, el) => {
  const text = $(el).text().trim();
  if (text && text.length < 50 && !text.includes('|')) {
    titles.add(text);
  }
});
Array.from(titles).slice(0, 30).forEach(t => console.log(`- ${t}`));

// Get first few flw-item details
console.log('\n\nFLW-ITEM Examples (first 3):');
$('.flw-item').slice(0, 3).each((i, el) => {
  const $item = $(el);
  const title = $item.find('[title]')?.first()?.attr('title') || $item.find('.film-name')?.text()?.trim();
  const href = $item.find('a[href*="/watch/"]')?.attr('href');
  const img = $item.find('img')?.attr('src') || $item.find('img')?.attr('data-src');
  console.log(`\n${i}: ${title}`);
  console.log(`   href: ${href}`);
  console.log(`   classes: ${$item.attr('class')}`);
  console.log(`   img: ${img ? img.substring(0, 50) : 'No'}`);
});

// Find all section containers
console.log('\n\nALL MAIN SECTIONS:');
$('section').each((i, el) => {
  const $section = $(el);
  const heading = $section.find('h1, h2, h3')?.first()?.text()?.trim();
  const itemCount = $section.find('.flw-item').length;
  console.log(`Section ${i}: "${heading}" - ${itemCount} items`);
});

// Inspect Trending section HTML
console.log('\n\nTRENDING SECTION HTML (trimmed):');
const trendingHeading = $('h1, h2, h3').filter((_, el) => $(el).text().trim() === 'Trending').first();
if (trendingHeading.length) {
  const trendingSection = trendingHeading.closest('section').length ? trendingHeading.closest('section') : trendingHeading.parent();
  console.log(trendingSection.html().substring(0, 1200));
} else {
  console.log('Trending heading not found');
}

// Check flw-item structure
console.log('\n\nFLW-ITEM HTML STRUCTURE:');
console.log($('.flw-item').first().html().substring(0, 500));

// Inspect Latest Updates section and tabs
console.log('\n\nLATEST UPDATES SECTION HTML (trimmed):');
const latestHeading = $('h1, h2, h3').filter((_, el) => $(el).text().trim() === 'Latest Updates').first();
if (latestHeading.length) {
  const latestSection = latestHeading.closest('section').length ? latestHeading.closest('section') : latestHeading.parent();
  console.log(latestSection.html().substring(0, 1200));
} else {
  console.log('Latest Updates heading not found');
}

// Inspect Most Viewed section and tabs
console.log('\n\nMOST VIEWED SECTION HTML (trimmed):');
const mostViewedHeading = $('h1, h2, h3').filter((_, el) => $(el).text().trim() === 'Most Viewed').first();
if (mostViewedHeading.length) {
  const mostViewedSection = mostViewedHeading.closest('section').length ? mostViewedHeading.closest('section') : mostViewedHeading.parent();
  console.log(mostViewedSection.html().substring(0, 1200));
} else {
  console.log('Most Viewed heading not found');
}

// Count items for Most Viewed tabs
console.log('\n\nMOST VIEWED TAB COUNTS:');
['day', 'week', 'month'].forEach((tabId) => {
  const pane = $(`.tab-pane[data-id="${tabId}"]`).first();
  const count = pane.find('.item-top, .item').length;
  console.log(`${tabId}: ${count}`);
});
