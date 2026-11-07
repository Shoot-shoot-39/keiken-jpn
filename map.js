const map = L.map("map", {
    center: [35.5, 137.0],
    zoom: 5
});

const gsiLayer = L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    {
        attribution:
            '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>'
    }
);

gsiLayer.addTo(map);
