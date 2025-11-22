// Polyfills and global utilities
if (!Math.clamp) {
  Math.clamp = (value, min, max) => Math.min(Math.max(value, min), max);
}

if (!Array.prototype.sample) {
  Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
  };
}

