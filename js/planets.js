/* =========================================================
   Orrery page – interactive planet info
   Pick a planet in the dropdown to show its facts and animation.
   To change a fact: edit the PLANETS list below.
   ========================================================= */

const PLANET_IMAGE_PATH = "../assets/projecten/hardware/orry/planeten/";
const DEFAULT_PLANET = "aarde";

const PLANETS = {
    mercurius: {
        name: "Mercurius",
        image: "Rotating_mercury.gif",
        gewicht: "3,3011 × 10²³ kg",
        diameter: "4.879 km",
        temperatuur: "-173 tot 427 °C",
        afstand: "57,91 miljoen km",
        zonrotatie: "88 dagen",
        asrotatie: "1407,6 uur",
        oppervlakte: "Rotsachtig",
        zwaartekracht: "3,7 m/s²",
        atmosfeer: "Zuurstof, natrium, waterstof, helium, …",
        manen: "Geen maan",
        weetje: "Mercurius is de kleinste planeet in ons zonnestelsel en de dichtstbijzijnde planeet bij de zon."
    },
    venus: {
        name: "Venus",
        image: "Rotating_venus.gif",
        gewicht: "4,8675 × 10²⁴ kg",
        diameter: "12.104 km",
        temperatuur: "462 °C",
        afstand: "108,2 miljoen km",
        zonrotatie: "225 dagen",
        asrotatie: "5832,5 uur",
        oppervlakte: "Rotsachtig",
        zwaartekracht: "8,87 m/s²",
        atmosfeer: "Koolstofdioxide, stikstof, zwaveldioxide, …",
        manen: "Geen maan",
        weetje: "Venus is na de maan het helderste natuurlijke object aan de nachthemel."
    },
    aarde: {
        name: "Aarde",
        image: "Rotating_earth.gif",
        gewicht: "5,97237 × 10²⁴ kg",
        diameter: "12.742 km",
        temperatuur: "-88 tot 58 °C",
        afstand: "149,6 miljoen km",
        zonrotatie: "365,24 dagen",
        asrotatie: "24 uur",
        oppervlakte: "Water en land",
        zwaartekracht: "9,807 m/s²",
        atmosfeer: "Stikstof, zuurstof, argon, …",
        manen: "1 maan",
        weetje: "De aarde is de enige planeet in ons zonnestelsel waarvan we zeker weten dat er leven is."
    },
    mars: {
        name: "Mars",
        image: "Rotating_Mars.gif",
        gewicht: "6,4171 × 10²³ kg",
        diameter: "6.779 km",
        temperatuur: "-153 tot 20 °C",
        afstand: "227,9 miljoen km",
        zonrotatie: "687 dagen",
        asrotatie: "24,6 uur",
        oppervlakte: "Rotsachtig",
        zwaartekracht: "3,72076 m/s²",
        atmosfeer: "Koolstofdioxide, stikstof, argon, …",
        manen: "2 manen",
        weetje: "Op Mars staat de hoogste berg van het zonnestelsel: Olympus Mons."
    },
    jupiter: {
        name: "Jupiter",
        image: "Rotating_jupiter.gif",
        gewicht: "1,8982 × 10²⁷ kg",
        diameter: "139.820 km",
        temperatuur: "-145 °C",
        afstand: "778,5 miljoen km",
        zonrotatie: "4331 dagen",
        asrotatie: "9,9 uur",
        oppervlakte: "Gas",
        zwaartekracht: "24,79 m/s²",
        atmosfeer: "Waterstof, helium, methaan, ammoniak, …",
        manen: "79 manen",
        weetje: "Jupiter is de grootste planeet in ons zonnestelsel."
    },
    saturnus: {
        name: "Saturnus",
        image: "Rotating_saturnus.gif",
        gewicht: "5,6834 × 10²⁶ kg",
        diameter: "116.460 km",
        temperatuur: "-178 °C",
        afstand: "1,429 miljard km",
        zonrotatie: "10.747 dagen",
        asrotatie: "10,7 uur",
        oppervlakte: "Gas",
        zwaartekracht: "10,44 m/s²",
        atmosfeer: "Waterstof, helium, methaan, ammoniak, …",
        manen: "82 manen",
        weetje: "De ringen van Saturnus zijn gemaakt van manen die tegen elkaar gebotst zijn. De brokstukken vliegen nu rond de planeet."
    },
    uranus: {
        name: "Uranus",
        image: "Rotating_uranus.gif",
        gewicht: "8,6810 × 10²⁵ kg",
        diameter: "50.724 km",
        temperatuur: "-224 °C",
        afstand: "2,871 miljard km",
        zonrotatie: "30.589 dagen",
        asrotatie: "17,2 uur",
        oppervlakte: "IJs",
        zwaartekracht: "8,87 m/s²",
        atmosfeer: "Waterstof, helium, methaan, …",
        manen: "27 manen",
        weetje: "Uranus draait op zijn zij, wat waarschijnlijk het resultaat is van een grote botsing lang geleden."
    },
    neptunus: {
        name: "Neptunus",
        image: "Rotating_neptune.gif",
        gewicht: "1,02413 × 10²⁶ kg",
        diameter: "49.244 km",
        temperatuur: "-201 °C",
        afstand: "4,498 miljard km",
        zonrotatie: "59.800 dagen",
        asrotatie: "16,1 uur",
        oppervlakte: "IJs",
        zwaartekracht: "11,15 m/s²",
        atmosfeer: "Waterstof, helium, methaan, …",
        manen: "14 manen",
        weetje: "Neptunus is de verste planeet van de zon in ons zonnestelsel."
    },
    pluto: {
        name: "Pluto",
        image: "Rotating_pluto.gif",
        gewicht: "1,303 × 10²² kg",
        diameter: "2.377 km",
        temperatuur: "-229 tot -198 °C",
        afstand: "5,906 miljard km",
        zonrotatie: "90.560 dagen",
        asrotatie: "153,3 uur",
        oppervlakte: "IJs en rots",
        zwaartekracht: "0,62 m/s²",
        atmosfeer: "Stikstof, methaan, koolstofmonoxide, …",
        manen: "5 manen",
        weetje: "Pluto is geclassificeerd als een dwergplaneet."
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const explorer = document.querySelector(".planet-explorer");
    if (!explorer) return;

    const select = explorer.querySelector(".planet-select");
    const image = explorer.querySelector(".planet-image");

    // Fill the dropdown from the data so the two never get out of sync
    Object.entries(PLANETS).forEach(([key, planet]) => {
        select.add(new Option(planet.name, key));
    });

    // Preload every animation so switching planets is instant
    Object.values(PLANETS).forEach((planet) => {
        new Image().src = PLANET_IMAGE_PATH + planet.image;
    });

    function showPlanet(key) {
        const planet = PLANETS[key];
        explorer.querySelectorAll("[data-field]").forEach((element) => {
            element.textContent = planet[element.dataset.field];
        });
        image.src = PLANET_IMAGE_PATH + planet.image;
        image.alt = `Draaiende ${planet.name}`;
    }

    select.addEventListener("change", () => showPlanet(select.value));

    select.value = DEFAULT_PLANET;
    showPlanet(DEFAULT_PLANET);
});
