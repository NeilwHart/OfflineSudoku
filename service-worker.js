const CACHE_NAME = 'sudoku-cache-v1';
// List all your game files here
const urlsToCache = [
  'https://neilwhart.github.io/OfflineSudoku',
  'https://neilwhart.github.io/OfflineSudoku/index.html',
  'https://neilwhart.github.io/OfflineSudoku/script.js',
  'https://neilwhart.github.io/OfflineSudoku/service-worker.js',
  'https://neilwhart.github.io/OfflineSudoku/style.css', 
  'https://neilwhart.github.io/OfflineSudoku/icon-192x192.png',
  'https://neilwhart.github.io/OfflineSudoku/icon-512x512.png'
];

// Replace /YOUR_REPOSITORY_NAME/ with your actual repo name here too
const GHPATH = 
  'https://neilwhart.github.io/OfflineSudoku',
  'https://neilwhart.github.io/OfflineSudoku/index.html',
  'https://neilwhart.github.io/OfflineSudoku/script.js',
  'https://neilwhart.github.io/OfflineSudoku/service-worker.js',
  'https://neilwhart.github.io/OfflineSudoku/style.css', 
  'https://neilwhart.github.io/OfflineSudoku/icon-192x192.png',
  'https://neilwhart.github.io/OfflineSudoku/icon-512x512.png';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all necessary files to the cache
        return cache.addAll(urlsToCache.map(url => new URL(url, location.href).pathname));
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached file if found
        if (response) {
          return response;
        }
        // Otherwise, try fetching from the network
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          console.log('Deleting old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});
