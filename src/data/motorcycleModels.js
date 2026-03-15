// src/data/motorcycleModels.js

export const MOTORCYCLE_MODELS = {
    "Honda": [
        "Wave 110 S",
        "Wave 110",
        "Navi 110",
        "CB 125 F",
        "CBF 125 Twister",
        "CG 150 Titan",
        "GLH 150",
        "Elite 125",
        "XR 150 L",
        "XR 190 L",
        "XR 250 Tornado",
        "XR 300 Tornado",
        "CB 190 R",
        "CB 250 Twister",
        "CB 300 F Twister",
        "CB350 H'ness",
        "PCX 160",
        "NX500",
        "CB750 Hornet",
        "NC 750X",
        "CRF1100L Africa Twin"
    ],
    "Yamaha": [
        "Crypton 110",
        "FZ FI",
        "FZ-S FI",
        "FZ V4",
        "FZ X",
        "FZ 25",
        "YBR 125",
        "YBR 125 Z",
        "XTZ 125",
        "XTZ 250",
        "Fascino 125",
        "Ray Z 125",
        "NMax 155",
        "MT-03",
        "R3",
        "MT-07",
        "MT-09",
        "Ténéré 700",
        "Tracer 700"
    ],
    "Bajaj": [
        "Boxer 150",
        "Rouser LS 125",
        "Rouser NS 125",
        "Rouser NS 160",
        "Rouser NS 200",
        "Rouser N250",
        "Dominar 250",
        "Dominar 400"
    ],
    "Royal Enfield": [
        "Hunter 350",
        "Meteor 350",
        "Classic 350",
        "Scram 411",
        "Himalayan 411",
        "Himalayan 450",
        "Interceptor 650",
        "Continental GT 650",
        "Super Meteor 650",
        "Shotgun 650",
        "Bear 650"
    ],
    "Kawasaki": [
        "Z400",
        "Z500",
        "Ninja 400",
        "Ninja 500",
        "Versys 300",
        "Versys 650",
        "KLR 650",
        "Vulcan S",
        "Z650",
        "Z900",
        "ZX-6R",
        "ZX-10R"
    ],
    "KTM": [
        "Duke 200",
        "Duke 250",
        "Duke 390",
        "RC 200",
        "RC 390",
        "Adventure 250",
        "Adventure 390",
        "Adventure 790",
        "Adventure 890"
    ],
    "Husqvarna": [
        "Svartpilen 200",
        "Svartpilen 401",
        "Vitpilen 401",
        "Norden 901"
    ],
    "Benelli": [
        "TNT 15",
        "180S",
        "TNT 25",
        "302S",
        "Imperiale 400",
        "TRK 251",
        "TRK 502",
        "TRK 502 X",
        "Leoncino 250",
        "Leoncino 500"
    ],
    "Motomel": [
        "B110",
        "Blitz 110",
        "S2 150",
        "CX 150",
        "Skua 150",
        "Skua 250"
    ],
    "Gilera": [
        "Smash 110",
        "VC 150",
        "Sahel 150"
    ],
    "Corven": [
        "Energy 110",
        "Hunter 150",
        "Triax 150",
        "Triax 250"
    ],
    "Zanella": [
        "ZB 110",
        "RX 150",
        "ZR 150",
        "ZR 250"
    ],
    "Keller": [
        "KN110-8",
        "Crono Classic 110",
        "Miracle 150",
        "Excellence 150"
    ],
    "Voge": [
        "300 DS",
        "300 AC",
        "300 Rally",
        "500 DS",
        "500 DSX",
        "650 DS"
    ],
    "CFMoto": [
        "250 NK",
        "300 NK",
        "400 NK",
        "650 MT",
        "650 GT",
        "800 MT"
    ]
};

// Define standard brands to match keys regardless of case
export const getAvailableModels = (brandInput) => {
    if (!brandInput) return [];
    
    // Attempt relaxed matching (case-insensitive, trim)
    const normalizedInput = brandInput.trim().toLowerCase();
    
    const matchedBrand = Object.keys(MOTORCYCLE_MODELS).find(
        key => key.toLowerCase() === normalizedInput
    );
    
    return matchedBrand ? MOTORCYCLE_MODELS[matchedBrand] : [];
};
