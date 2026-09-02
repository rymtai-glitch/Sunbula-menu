// Real dish photos (id -> path). Missing ids fall back to branded placeholder.
window.PHOTOS = {
 1: "images/1.jpg", 2: "images/2.jpg", 3: "images/3.jpg", 4: "images/4.jpg",
 5: "images/5.jpg", 6: "images/6.jpg", 7: "images/7.jpg", 8: "images/8.jpg",
 9: "images/9.jpg", 10: "images/10.jpg", 11: "images/11.jpg", 12: "images/12.jpg",
 13: "images/13.jpg", 14: "images/14.jpg", 15: "images/15.jpg", 16: "images/16.jpg",
 17: "images/17.jpg", 18: "images/18.jpg", 19: "images/19.jpg", 20: "images/20.png",
 21: "images/21.png", 22: "images/22.png", 23: "images/23.jpg", 24: "images/24.png", 25: "images/25.jpg",
 26: "images/26.jpg", 27: "images/27.jpg", 28: "images/28.png", 29: "images/29.png",
 30: "images/30.png", 31: "images/31.png", 32: "images/32.jpg", 33: "images/33.jpg",
 34: "images/34.jpg", 35: "images/35.png", 36: "images/36.png", 38: "images/38.jpg", 39: "images/39.jpg",
 40: "images/40.jpg", 41: "images/41.jpg", 42: "images/42.jpg", 43: "images/43.jpg",
 44: "images/44.jpg", 45: "images/45.jpg", 46: "images/46.jpg", 47: "images/47.jpg",
 52: "images/52.jpg", 53: "images/53.jpg", 54: "images/54.jpg", 55: "images/55.jpg",
 57: "images/57.png", 58: "images/58.jpg", 59: "images/59.jpg", 60: "images/60.png",
 61: "images/61.png", 62: "images/62.png", 63: "images/63.jpg",
 64: "images/64.jpg", 65: "images/65.jpg", 66: "images/66.jpg", 67: "images/67.jpg", 68: "images/68.png",
 69: "images/69.jpg", 70: "images/70.jpg", 71: "images/71.jpg", 72: "images/72.jpg",
 73: "images/73.jpg", 74: "images/74.jpg", 75: "images/75.jpg", 76: "images/76.png",
 77: "images/s1-matcha-jasmin.png", 78: "images/s2-summer-shot.png", 79: "images/s3-irish-frappucino.png",
 88: "images/autumn-tea-moroccan.png", 89: "images/autumn-lemonade-seabuckthorn.png", 90: "images/autumn-hot-chocolate-strawberry.png",
 91: "images/lemonade-mohito-strawberry.png", 92: "images/tea-mango-passionfruit.png",
 80: "images/80.png",
 81: "images/set-sunset.png", 82: "images/set-daily.png", 83: "images/set-ginger.png",
 84: "images/set-urban.png", 85: "images/set-morning.png", 86: "images/set-protein.png",
 87: "images/set-english.png"
};
window.photoFor = function(id){ return window.PHOTOS[id] || null; };
