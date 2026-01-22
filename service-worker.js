const CACHE_NAME = 'sudoku-cache-v1';

// Using relative paths is safer for GitHub Pages
const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './icon-192x192.png',
  './icon-512x512.png',
  './manifest.json' // Make sure to include your manifest if you have one!
];

// If you need a base path variable for other logic:
const GHPATH = '/OfflineSudoku'; 

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all necessary files to the cache
        return cache.addAll(urlsToCache); // <-- This is where that line goes
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
