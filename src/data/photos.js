// Real dish photos (id -> path). Missing ids fall back to branded placeholder.
window.PHOTOS = {
 1: "images/1.jpg", 2: "images/2.jpg", 3: "images/3.jpg", 4: "images/4.jpg",
 5: "images/5.jpg", 6: "images/6.jpg", 7: "images/7.jpg", 8: "images/8.jpg",
 9: "images/9.jpg", 10: "images/10.jpg", 11: "images/11.jpg", 12: "images/12.jpg",
 13: "images/13.jpg", 14: "images/14.jpg", 15: "images/15.jpg", 16: "images/16.jpg",
 17: "images/17.jpg", 18: "images/18.jpg", 19: "images/19.jpg", 20: "images/20.jpg",
 21: "images/21.jpg", 23: "images/23.jpg", 24: "images/24.jpg", 25: "images/25.jpg",
 26: "images/26.jpg", 27: "images/27.jpg", 28: "images/28.jpg", 29: "images/29.jpg",
 30: "images/30.jpg", 31: "images/31.jpg", 32: "images/32.jpg", 33: "images/33.jpg",
 34: "images/34.jpg", 35: "images/35.jpg", 38: "images/38.jpg", 39: "images/39.jpg",
 40: "images/40.jpg", 41: "images/41.jpg", 42: "images/42.jpg", 43: "images/43.jpg",
 44: "images/44.jpg", 45: "images/45.jpg", 46: "images/46.jpg", 47: "images/47.jpg",
 52: "images/52.jpg", 53: "images/53.jpg", 54: "images/54.jpg", 55: "images/55.jpg",
 57: "images/57.jpg", 58: "images/58.jpg", 59: "images/59.jpg", 63: "images/63.jpg",
 64: "images/64.jpg", 65: "images/65.jpg", 66: "images/66.jpg", 67: "images/67.jpg",
 69: "images/69.jpg", 70: "images/70.jpg", 71: "images/71.jpg", 72: "images/72.jpg",
 73: "images/73.jpg", 74: "images/74.jpg", 75: "images/75.jpg"
};
window.photoFor = function(id){ return window.PHOTOS[id] || null; };
