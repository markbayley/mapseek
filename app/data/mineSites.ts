export interface MineSite {
  name: string;
  coordinates: [number, number];
  resources: string[];
  ownership: string;
  location: string;
  details: string;
}

export const mineSites: MineSite[] = [
  {
    name: "Bingham Canyon Mine",
    coordinates: [-112.1500, 40.5200],
    resources: ["copper", "gold", "silver", "molybdenum", "rare earth elements"],
    ownership: "Rio Tinto Group",
    location: "Southwest of Salt Lake City, Utah, USA",
    details: "Largest man-made excavation, primarily copper, also produces gold, silver, and molybdenum. Over 19 million tons of copper produced since 1906. Depth of 1,200 meters, employs ~2,500 people."
  },
  {
    name: "Grasberg Mine",
    coordinates: [137.1167, -4.0533],
    resources: ["gold", "copper", "silver"],
    ownership: "Freeport-McMoRan (48.76%), PT Mineral Industri Indonesia (51.24%)",
    location: "Papua, Indonesia",
    details: "World's largest gold mine and second-largest copper mine, with open-pit and underground operations. Produced ~1.861 million ounces of gold in 2024. Covers 27,400 acres, employs ~19,500 people."
  },
  {
    name: "Muruntau Mine",
    coordinates: [64.5833, 41.4667],
    resources: ["gold"],
    ownership: "Navoi Mining and Metallurgical Company",
    location: "Kyzylkum Desert, Navoiy Viloyati, Uzbekistan",
    details: "One of the largest open-pit gold mines, producing ~1.8 million ounces of gold in 2023. Estimated reserves of 4,500 metric tons of gold. Operations expected to continue into the 2030s."
  },
  {
    name: "Chuquicamata Mine",
    coordinates: [-68.9000, -22.3000],
    resources: ["copper"],
    ownership: "Codelco",
    location: "Northern Chile, near Calama",
    details: "Largest open-pit copper mine by volume, producing ~500,000 tonnes of copper annually. Second-deepest open-pit mine at 850 meters. Nationalized by Chile in the 1960s."
  },
  {
    name: "El Teniente Mine",
    coordinates: [-70.3833, -34.0833],
    resources: ["copper"],
    ownership: "Codelco",
    location: "Andes Mountains, 100 km southeast of Santiago, Chile",
    details: "World's largest underground copper mine, with over 3,000 km of tunnels. Produces ~500,000 tonnes of copper yearly."
  },
  {
    name: "Mirny Diamond Mine",
    coordinates: [113.9931, 62.5289],
    resources: ["diamonds"],
    ownership: "Mirny GOK (Alrosa)",
    location: "Eastern Siberia, Russia",
    details: "Massive open-pit diamond mine, now primarily underground. Measures 1.25 km wide, 525m deep, producing ~2,000 kg of diamonds annually."
  },
  {
    name: "Black Thunder Mine",
    coordinates: [-105.3167, 43.6667],
    resources: ["coal"],
    ownership: "Arch Resources",
    location: "Southern Powder River Basin, Wyoming, USA",
    details: "World's largest coal mine by production, yielding ~62.68 million tonnes in 2023. Produces low-sulfur sub-bituminous coal."
  },
  {
    name: "Gevra OC Mine",
    coordinates: [82.5500, 22.3333],
    resources: ["coal"],
    ownership: "South Eastern Coalfields Limited",
    location: "Korba district, Chhattisgarh, India",
    details: "India's largest coal mine, producing ~60 million tonnes in 2023. Operates as an open-cast mine."
  },
  {
    name: "North Antelope Rochelle Mine",
    coordinates: [-105.2000, 43.7167],
    resources: ["coal"],
    ownership: "Peabody Energy",
    location: "Campbell County, Wyoming, USA",
    details: "World's third-largest coal mine by production, with ~56.25 million tonnes in 2023. Known for low-sulfur sub-bituminous coal."
  },
  {
    name: "Olimpiada Gold Mine",
    coordinates: [93.5000, 64.0000],
    resources: ["gold"],
    ownership: "Polyus",
    location: "Krasnoyarsk Krai, Russia",
    details: "Russia's largest gold mine, producing ~1.441 million ounces in 2024. Holds ~26 million ounces in reserves."
  },
  {
    name: "Carajás Mine",
    coordinates: [-50.1667, -6.0667],
    resources: ["iron ore", "gold", "copper", "nickel"],
    ownership: "Vale",
    location: "Pará state, Brazil",
    details: "World's largest iron ore mine, producing ~150 million tonnes of iron ore annually. Also produces gold, copper, and nickel. Discovered in the 1960s, employs self-driving trucks."
  },
  {
    name: "Oyu Tolgoi Mine",
    coordinates: [106.8667, 43.0167],
    resources: ["copper", "gold"],
    ownership: "Rio Tinto (66%), Government of Mongolia (34%)",
    location: "South Gobi Desert, Mongolia",
    details: "Combined open-pit and underground mine, producing ~450,000 tonnes of copper and ~1.7 million ounces of gold to date. Discovered in 2001."
  },
  {
    name: "Kiruna Mine",
    coordinates: [20.2000, 67.8500],
    resources: ["iron ore"],
    ownership: "Luossavaara-Kiirunavaara AB (LKAB)",
    location: "Kiruna, Sweden",
    details: "Largest and most modern underground iron ore mine, producing ~27 million tonnes annually. Ore body is 4 km long, up to 2 km deep."
  },
  {
    name: "Garzweiler Mine",
    coordinates: [6.5000, 51.0500],
    resources: ["coal"],
    ownership: "RWE Power",
    location: "North Rhine-Westphalia, Germany",
    details: "One of Europe's largest open-pit lignite mines, producing ~35 million tonnes of coal annually. Covers ~48 square kilometers."
  },
  {
    name: "Batu Hijau Mine",
    coordinates: [116.9333, -8.9667],
    resources: ["copper", "gold"],
    ownership: "PT Amman Mineral Nusa Tenggara",
    location: "Sumbawa, Indonesia",
    details: "Produced ~1.009 million ounces of gold in 2024. Significant copper producer, employs advanced mining technology."
  },
  {
    name: "Kazzinc Consolidated",
    coordinates: [69.1000, 50.4000],
    resources: ["gold", "zinc", "lead", "silver"],
    ownership: "Kazzinc Ltd (Glencore 70%)",
    location: "East Kazakhstan",
    details: "Produced ~1 million ounces of gold in 2024. Major zinc and lead producer, with significant precious metals output."
  },
  {
    name: "Ahafo Mine",
    coordinates: [-2.3167, 7.3167],
    resources: ["gold"],
    ownership: "Newmont (90%), Government of Ghana (10%)",
    location: "Brong-Ahafo Region, Ghana",
    details: "Produced ~798,000 ounces of gold in 2024. Newmont's only operation in Africa, with both surface and underground mining."
  },
  {
    name: "Kibali Mine",
    coordinates: [29.6000, 3.1333],
    resources: ["gold"],
    ownership: "AngloGold Ashanti (45%), Barrick (45%), Societe Miniere de Kilo-Moto (10%)",
    location: "Haut-Uele Province, Democratic Republic of Congo",
    details: "Produced ~686,667 ounces of gold in 2024. Africa's largest bullion operation, with recent discoveries extending mine life."
  },
  {
    name: "Detour Lake Mine",
    coordinates: [-79.6667, 50.0167],
    resources: ["gold"],
    ownership: "Agnico Eagle Mines",
    location: "Ontario, Canada",
    details: "Produced ~671,950 ounces of gold in 2024. Investments aim to increase production to 1 million ounces annually, with mine life to 2054."
  },
  {
    name: "Canadian Malartic Mine",
    coordinates: [-78.1333, 48.1333],
    resources: ["gold"],
    ownership: "Agnico Eagle Mines",
    location: "Abitibi Region, Quebec, Canada",
    details: "Produced ~655,654 ounces of gold in 2024. Significant open-pit and underground operations, with exploration potential."
  },

  // Lithium
  {
    name: "Greenbushes Mine",
    coordinates: [115.9500, -33.8667],
    resources: ["lithium"],
    ownership: "Talison Lithium (Tianqi Lithium 51%, Albemarle 49%)",
    location: "Western Australia, Australia",
    details: "World's largest hard-rock lithium mine, producing ~1.95 million tonnes of lithium concentrate annually. Supplies ~40% of global lithium. Operational since 1983."
  },
  {
    name: "Salar del Hombre Muerto",
    coordinates: [-66.9167, -25.4167],
    resources: ["lithium"],
    ownership: "Arcadium Lithium",
    location: "Catamarca, Argentina",
    details: "Major lithium brine operation, producing ~25,000 tonnes of lithium carbonate equivalent (LCE) annually. Part of Rio Tinto's portfolio post-Arcadium acquisition."
  },
  {
    name: "Olaroz Mine",
    coordinates: [-66.7500, -23.4167],
    resources: ["lithium"],
    ownership: "Arcadium Lithium",
    location: "Jujuy, Argentina",
    details: "Produces ~17,500 tonnes of LCE annually. Part of Lithium Triangle, key for EV battery production. Expanding capacity to 42,500 tonnes by 2026."
  },
  {
    name: "Mount Holland Mine",
    coordinates: [119.7167, -32.1167],
    resources: ["lithium"],
    ownership: "SQM (50%), Wesfarmers (50%)",
    location: "Western Australia, Australia",
    details: "One of world's largest hard-rock lithium deposits, producing ~50,000 tonnes of spodumene concentrate annually. Began production in 2024."
  },
  {
    name: "Bikita Mine",
    coordinates: [31.9167, -20.0833],
    resources: ["lithium"],
    ownership: "Sinomine Resource Group",
    location: "Masvingo Province, Zimbabwe",
    details: "Africa's richest lithium reserve, targeting ~300,000 tonnes of spodumene concentrate annually post-2022 upgrade. Acquired by China's Sinomine for $180M."
  },

  // Cobalt
  {
    name: "Katanga Mine",
    coordinates: [27.2500, -11.6667],
    resources: ["cobalt", "copper"],
    ownership: "Glencore",
    location: "Katanga Province, Democratic Republic of Congo",
    details: "Major cobalt producer, yielding ~22,000 tonnes of cobalt in 2023. By-product of copper mining, significant for EV batteries."
  },
  {
    name: "Mutanda Mine",
    coordinates: [27.3333, -11.7333],
    resources: ["cobalt", "copper"],
    ownership: "Glencore",
    location: "Katanga Province, Democratic Republic of Congo",
    details: "Produced ~15,000 tonnes of cobalt in 2023. Temporarily closed in 2019 due to low prices, resumed in 2021. Key for global cobalt supply."
  },
  {
    name: "Murrin Murrin Mine",
    coordinates: [121.8833, -28.7167],
    resources: ["cobalt", "nickel"],
    ownership: "Glencore",
    location: "Western Australia, Australia",
    details: "Produces ~2,000 tonnes of cobalt annually as nickel by-product. Significant laterite deposit, operational since 1999."
  },
  {
    name: "Tenke Fungurume Mine",
    coordinates: [26.3167, -10.5667],
    resources: ["cobalt", "copper"],
    ownership: "China Molybdenum (80%), Gécamines (20%)",
    location: "Lualaba Province, Democratic Republic of Congo",
    details: "One of world's largest cobalt mines, producing ~10,000 tonnes annually. Major copper-cobalt operation."
  },

  // Manganese
  {
    name: "Kalahari Manganese Field (South 32)",
    coordinates: [24.8000, -27.1167],
    resources: ["manganese"],
    ownership: "South32",
    location: "Northern Cape, South Africa",
    details: "World's largest manganese deposit, producing ~3.5 million tonnes annually. Supplies 25% of global manganese for steel and batteries."
  },
  {
    name: "Moanda Mine",
    coordinates: [13.2000, -1.6667],
    resources: ["manganese"],
    ownership: "Comilog (Eramet)",
    location: "Haut-Ogooué Province, Gabon",
    details: "Produces ~4 million tonnes of manganese ore annually. One of Africa's largest manganese operations, key for battery-grade manganese."
  },
  {
    name: "Bootu Creek Mine",
    coordinates: [131.1667, -18.6667],
    resources: ["manganese"],
    ownership: "OM Holdings",
    location: "Northern Territory, Australia",
    details: "Produces ~800,000 tonnes of manganese ore annually. Supplies steel and battery industries, operational since 2005."
  },
  {
    name: "Bondoukou Mine",
    coordinates: [-2.8000, 8.0333],
    resources: ["manganese"],
    ownership: "Taurus Gold Limited",
    location: "Zanzan District, Côte d'Ivoire",
    details: "One of four operating manganese mines in Côte d'Ivoire, producing ~500,000 tonnes annually. Exports primarily to China."
  },

  // Uranium
  {
    name: "Cigar Lake Mine",
    coordinates: [-104.5333, 58.0667],
    resources: ["uranium"],
    ownership: "Cameco (50.02%), Orano (37.1%), Idemitsu (7.88%), TEPCO (5%)",
    location: "Saskatchewan, Canada",
    details: "World's highest-grade uranium mine, producing ~7,000 tonnes of uranium annually. Supplies ~10% of global uranium."
  },
  {
    name: "Husab Mine",
    coordinates: [15.0333, -22.9167],
    resources: ["uranium"],
    ownership: "Swakop Uranium (CGN 90%, Epangelo Mining 10%)",
    location: "Namib Desert, Namibia",
    details: "Produces ~3,500 tonnes of uranium annually. One of world's largest uranium mines, operational since 2016."
  },
  {
    name: "Olympic Dam Mine",
    coordinates: [136.8833, -30.4333],
    resources: ["uranium", "copper", "gold", "silver"],
    ownership: "BHP",
    location: "South Australia, Australia",
    details: "Produces ~3,500 tonnes of uranium annually as by-product of copper mining. World's largest known uranium deposit."
  },
  {
    name: "Karatau Mine",
    coordinates: [68.8333, 43.6333],
    resources: ["uranium"],
    ownership: "Kazatomprom",
    location: "South Kazakhstan",
    details: "Produces ~3,000 tonnes of uranium annually. Part of Kazakhstan's dominant uranium industry, supplying ~40% of global uranium."
  },

  // Nickel
  {
    name: "Norilsk Nickel Mines",
    coordinates: [88.2000, 69.3333],
    resources: ["nickel", "copper", "palladium", "platinum"],
    ownership: "Nornickel",
    location: "Krasnoyarsk Krai, Russia",
    details: "World's largest nickel producer, yielding ~200,000 tonnes annually. Also produces significant palladium and platinum."
  },
  {
    name: "Kambalda Nickel Operations",
    coordinates: [121.6667, -31.2000],
    resources: ["nickel"],
    ownership: "IGO Limited",
    location: "Western Australia, Australia",
    details: "Produces ~30,000 tonnes of nickel annually. Historic nickel belt, operational since the 1960s."
  },
  {
    name: "Sorowako Mine",
    coordinates: [121.3667, -2.5333],
    resources: ["nickel"],
    ownership: "PT Vale Indonesia",
    location: "South Sulawesi, Indonesia",
    details: "Produces ~75,000 tonnes of nickel annually. Major laterite deposit, key for EV battery supply."
  },
  {
    name: "Raglan Mine",
    coordinates: [-73.6667, 61.6667],
    resources: ["nickel", "cobalt"],
    ownership: "Glencore",
    location: "Nunavik, Quebec, Canada",
    details: "Produces ~40,000 tonnes of nickel annually. Underground operation in Arctic region, also yields cobalt."
  },

  // Zinc
  {
    name: "Rampura Agucha Mine",
    coordinates: [74.7333, 25.8333],
    resources: ["zinc", "lead"],
    ownership: "Hindustan Zinc Limited (Vedanta)",
    location: "Rajasthan, India",
    details: "World's largest zinc mine, producing ~650,000 tonnes of zinc annually. Operational since 1991, also significant lead producer."
  },
  {
    name: "Red Dog Mine",
    coordinates: [-162.8333, 68.0667],
    resources: ["zinc", "lead"],
    ownership: "Teck Resources",
    location: "Alaska, USA",
    details: "Produces ~600,000 tonnes of zinc annually. One of world's largest zinc mines, located in remote Arctic region."
  },
  {
    name: "McArthur River Mine",
    coordinates: [136.0833, -16.4333],
    resources: ["zinc", "lead", "silver"],
    ownership: "Glencore",
    location: "Northern Territory, Australia",
    details: "Produces ~250,000 tonnes of zinc annually. Major zinc-lead deposit, operational since 1995."
  },
  {
    name: "Antamina Mine",
    coordinates: [-77.3167, -9.5333],
    resources: ["zinc", "copper", "silver", "molybdenum", "rare earth elements"],
    ownership: "BHP (33.75%), Glencore (33.75%), Teck (22.5%), Mitsubishi (10%)",
    location: "Ancash Region, Peru",
    details: "Produces ~400,000 tonnes of zinc annually. One of world's largest copper-zinc mines."
  },

  // Rare Earths
  {
    name: "Bayan Obo Mine",
    coordinates: [109.9667, 41.7833],
    resources: ["rare earth elements"],
    ownership: "China Northern Rare Earth High-Tech",
    location: "Inner Mongolia, China",
    details: "World's largest rare earth mine, producing ~120,000 tonnes of rare earth oxides annually. Supplies ~50% of global rare earths."
  },
  {
    name: "Mountain Pass Mine",
    coordinates: [-115.5333, 35.4833],
    resources: ["rare earth elements"],
    ownership: "MP Materials",
    location: "California, USA",
    details: "Produces ~40,000 tonnes of rare earth oxides annually, focusing on neodymium and praseodymium. Restarted in 2018 after bankruptcy."
  },
  {
    name: "Mount Weld Mine",
    coordinates: [122.1333, -28.8667],
    resources: ["rare earth elements"],
    ownership: "Lynas Rare Earths",
    location: "Western Australia, Australia",
    details: "Produces ~22,000 tonnes of rare earth oxides annually. Key source of neodymium and praseodymium for magnets."
  },
  {
    name: "Kvanefjeld Project",
    coordinates: [-46.0333, 60.9667],
    resources: ["rare earth elements", "uranium"],
    ownership: "Greenland Minerals",
    location: "Southern Greenland",
    details: "Development-stage project with 10.2 million tonnes of rare earth oxides. Uranium by-product halted by Greenland's 2021 ban."
  },

  // Potash
  {
    name: "Nutrien Allan Mine",
    coordinates: [-106.0667, 51.9333],
    resources: ["potash"],
    ownership: "Nutrien",
    location: "Saskatchewan, Canada",
    details: "Produces ~3 million tonnes of potash annually. Part of Saskatchewan's vast potash basin, key for fertilizer production."
  },
  {
    name: "Uralkali Berezniki Mine",
    coordinates: [56.8333, 59.4167],
    resources: ["potash"],
    ownership: "Uralkali",
    location: "Perm Krai, Russia",
    details: "Produces ~2.5 million tonnes of potash annually. One of Russia's largest potash operations, supplying global fertilizer markets."
  },
  {
    name: "Mosaic Esterhazy Mine",
    coordinates: [-102.1833, 50.6667],
    resources: ["potash"],
    ownership: "Mosaic Company",
    location: "Saskatchewan, Canada",
    details: "World's largest potash mine, producing ~5.5 million tonnes annually. Operational since 1962, key for agricultural fertilizers."
  },

  // Lithium (Additional Mines)
  {
    name: "Goulamina Mine",
    coordinates: [-7.979150, 11.349153],
    resources: ["lithium"],
    ownership: "Ganfeng Lithium (50%), Firefinch Limited (50%)",
    location: "Bamako Region, Mali",
    details: "One of Africa's largest lithium projects, targeting ~400,000 tonnes of spodumene concentrate annually. Production started in 2024, key for EV battery supply."
  },
  {
    name: "Salar de Atacama",
    coordinates: [-68.2000, -23.7500],
    resources: ["lithium"],
    ownership: "SQM (50%), Albemarle (50%)",
    location: "Atacama Region, Chile",
    details: "World's largest lithium brine operation, producing ~70,000 tonnes of lithium carbonate equivalent annually. Supplies ~25% of global lithium."
  },
  {
    name: "Pilgangoora Mine",
    coordinates: [118.8833, -21.0333],
    resources: ["lithium"],
    ownership: "Pilbara Minerals",
    location: "Western Australia, Australia",
    details: "Produces ~300,000 tonnes of spodumene concentrate annually. One of Australia's largest hard-rock lithium mines, operational since 2018."
  },

  // Cobalt (Additional Mines)
  {
    name: "Kamoto Mine",
    coordinates: [25.3833, -10.7167],
    resources: ["cobalt", "copper"],
    ownership: "Katanga Mining (Glencore 75%, Gécamines 25%)",
    location: "Katanga Province, Democratic Republic of Congo",
    details: "Produces ~20,000 tonnes of cobalt annually. Major copper-cobalt operation, critical for EV battery supply."
  },
  {
    name: "Ambatovy Mine",
    coordinates: [48.3167, -18.8333],
    resources: ["cobalt", "nickel"],
    ownership: "Sherritt International (40%), Sumitomo (32.5%), Korea Resources (27.5%)",
    location: "Toamasina, Madagascar",
    details: "Produces ~5,000 tonnes of cobalt annually as a nickel by-product. One of Madagascar's largest mining operations."
  },

  // Manganese (Additional Mines)
  {
    name: "Nsuta Mine",
    coordinates: [-1.9667, 5.2833],
    resources: ["manganese"],
    ownership: "Consolidated Minerals (Tianjin Tewoo 90%, Ghana Manganese Company 10%)",
    location: "Western Region, Ghana",
    details: "Produces ~1.5 million tonnes of manganese ore annually. Operational since 1916, key for steel and battery industries."
  },
  {
    name: "Tshipi Borwa Mine",
    coordinates: [24.7667, -27.3667],
    resources: ["manganese"],
    ownership: "Tshipi é Ntle Manganese Mining (Jupiter Mines 49.9%, Ntsimbintle Mining 50.1%)",
    location: "Northern Cape, South Africa",
    details: "Produces ~3 million tonnes of manganese ore annually. One of South Africa's largest manganese exporters."
  },

  // Uranium (Additional Mines)
  {
    name: "McArthur River Mine",
    coordinates: [-105.0333, 57.7667],
    resources: ["uranium"],
    ownership: "Cameco (69.805%), Orano (30.195%)",
    location: "Saskatchewan, Canada",
    details: "World's largest high-grade uranium mine, producing ~6,800 tonnes annually. Temporarily suspended in 2018, resumed in 2022."
  },
  {
    name: "Rössing Mine",
    coordinates: [15.0333, -22.4833],
    resources: ["uranium"],
    ownership: "China National Uranium Corporation (68.62%), Rio Tinto (15.24%)",
    location: "Erongo Region, Namibia",
    details: "Produces ~2,500 tonnes of uranium annually. One of world's longest-running uranium mines, operational since 1976."
  },

  // Nickel (Additional Mines)
  {
    name: "Mincor Kambalda Operations",
    coordinates: [121.6667, -31.2000],
    resources: ["nickel"],
    ownership: "Wyloo Metals",
    location: "Western Australia, Australia",
    details: "Produces ~20,000 tonnes of nickel annually. Revived in 2021, key for EV battery supply."
  },
  {
    name: "Voisey's Bay Mine",
    coordinates: [-56.3167, 56.3333],
    resources: ["nickel", "copper", "cobalt"],
    ownership: "Vale",
    location: "Labrador, Canada",
    details: "Produces ~40,000 tonnes of nickel annually. Significant cobalt by-product, operational since 2005."
  },

  // Zinc (Additional Mines)
  {
    name: "Tara Mine",
    coordinates: [-6.7167, 53.5833],
    resources: ["zinc", "lead"],
    ownership: "Boliden",
    location: "County Meath, Ireland",
    details: "Produces ~200,000 tonnes of zinc annually. Europe's largest zinc mine, operational since 1977."
  },
  {
    name: "Cerro Lindo Mine",
    coordinates: [-76.1333, -14.5167],
    resources: ["zinc", "copper", "lead", "silver"],
    ownership: "Nexa Resources",
    location: "Ica Region, Peru",
    details: "Produces ~150,000 tonnes of zinc annually. Major polymetallic mine in Latin America."
  },

  // Rare Earths (Additional Mines)
  {
    name: "Wicheeda Project",
    coordinates: [-122.0667, 54.5000],
    resources: ["rare earth elements"],
    ownership: "Defense Metals Corp",
    location: "British Columbia, Canada",
    details: "Development-stage project with ~27 million tonnes of rare earth oxides. Focus on neodymium and praseodymium, potential start by 2028."
  },
  {
    name: "Halleck Creek Project",
    coordinates: [-105.6667, 41.3333],
    resources: ["rare earth elements"],
    ownership: "American Rare Earths",
    location: "Wyoming, USA",
    details: "Contains ~4.7 million tonnes of rare earth oxides. Low-thorium deposit, under exploration for future production."
  },

  // Potash (Additional Mines)
  {
    name: "Cory Mine",
    coordinates: [-104.3167, 52.0833],
    resources: ["potash"],
    ownership: "Nutrien",
    location: "Saskatchewan, Canada",
    details: "Produces ~3 million tonnes of potash annually. Part of Saskatchewan's potash belt, key for fertilizer production."
  },
  {
    name: "Belaruskali Soligorsk Mine",
    coordinates: [27.5667, 52.7833],
    resources: ["potash"],
    ownership: "Belaruskali",
    location: "Minsk Region, Belarus",
    details: "Produces ~7 million tonnes of potash annually. One of world's largest potash operations, supplying global fertilizer markets."
  },

  //Silver (Additional Mines)
  {
    name: "San Cristobal Mine",
    coordinates: [-69.6667, -17.4667],
    resources: ["silver"],
    ownership: "Pan American Silver",
    location: "Potosí, Bolivia",
    details: "Produces ~100 million ounces of silver annually. One of world's largest silver mines, operational since 1921."
  },
  {
    name: "Polkowice-Sieroszowice Mine",
    coordinates: [16.7667, 51.3667],
    resources: ["silver"],
    ownership: "KGHM",
    location: "Silesia, Poland",
    details: "The Polkowice-Sieroszowice Mine is a silver mine located in Silesia, Poland. Owned by KGHM, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of silver in 2023"
  },
  {
    name: "Peñasquito Mine",
    coordinates: [-101.716414, 24.657013],
    resources: ["silver"],
    ownership: "Newmont/Silver Standard Resources",
    location: "San Dimas, Mexico",
    details: "The Peñasquito Mine is a silver mine located in San Dimas, Mexico. Owned by Newmont/Silver Standard Resources, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of silver in 2023"
  },
  {
    name: "Cannington Mine",
    coordinates: [140.906505, -21.856488],
    resources: ["silver"],
    ownership: "Newmont",
    location: "Queensland, Australia",
    details: "The Cannington Mine is a gold mine located in Queensland, Australia. Owned by Newmont, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of gold in 2023"
  },
  {
    name: "Nevada Gold Mines",
    coordinates: [-115.783889, 40.829256],
    resources: ["gold"],
    ownership: "Newmont",
    location: "Nevada, USA",
    details: "The Nevada Gold Mines is a gold mine located in Nevada, USA. Owned by Newmont, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of gold in 2023"
  },
  {
    name: "Lihir Mine",
    coordinates: [152.638423, -3.125028],
    resources: ["gold"],
    ownership: "Newcrest",
    location: "Papua New Guinea",
    details: "The Lihir Mine is a gold mine located in Papua New Guinea. Owned by Newcrest, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of gold in 2023"
  },
  //Diamond mines
  {
    name: "Kao Mine",
    coordinates: [28.629570, -29.021307],
    resources: ["diamonds"],
    ownership: "Storm Mountain Diamonds",
    location: "Butha-Buthe, Lesotho",
    details: "The Kao Mine is a surface mine situated in Butha-Buthe, Lesotho. Owned by Namakwa Diamonds, the brownfield mine produced an estimated 13.31 million carats of diamond in 2023. The mine will operate until 2034"
  },
  {
    name: "Jwaneng Mine",
    coordinates: [24.695647, -24.532317],
    resources: ["diamonds"],
    ownership: "State of Botswana",
    location: "Botswana",
    details: "Located in Kgalagadi District, Botswana, the Jwaneng Mine is owned by Government of Botswana. The surface mine produced an estimated 11.86 million carats of diamond in 2023. The mine will operate until 2036"
  },
  //Africa mines
  {
    name: "Catoca Mine",
    coordinates: [20.300057, -9.407280],
    resources: ["diamonds"],
    ownership: "Endiama EP",
    location: "Angola",
    details: "The Catoca Mine is a surface mine situated in Lunda Sul, Angola. The greenfield mine produced an estimated 6.42 million carats of diamond in 2023. The expected mine closure date is 2037"
  },

  //Asia mines
  {
    name: "Green Mine",
    coordinates: [104.2667, 30.6667],
    resources: ["phosphate"],
    ownership: "China National Gold Group",
    location: "Sichuan, China",
    details: "The Green Mine is a phosphate mine owned by Sichuan Lomon. Located in Sichuan, China, the greenfield mine produced approximately 61.933Mt of ROM in 2023. It had an estimated production of 37.16 mtpa of phosphate in 2023"
  },

  {
    name: "Northern Shaanxi Mine",
    coordinates: [110.1667, 34.0667],
    resources: ["coal"],
    ownership: "Shaanxi Gold Mining",
    location: "Shaanxi, China",
    details: "The Northern Shaanxi Mine is a coal mine located in Shaanxi, China. Owned by Shaanxi Coal Industry Group, the greenfield project produced an estimated 10.000Mt of ROM in 2023. It had an estimated production of 1.5 million tonnes of coal in 2023"
  },
  {
    name: "Julong Copper Mine",
    coordinates: [91.090073, 29.636152],
    resources: ["copper"],
    ownership: "China National Gold Group",
    location: "Tibet, China",
    details: "The Julong Copper Mine is a copper mine located in Tibet, China. Owned by Zijin Mining Group, the greenfield project produced an estimated 43.566Mt of ROM in 2023."
  },
  {
    name: "Weda Bay Project",
    coordinates: [127.957318, 0.548746],
    resources: ["nickel"],
    ownership: "PT Vale Indonesia Tbk",
    location: "Sulawesi, Indonesia",
    details: "The Weda Bay Project is a nickel mining project in Maluku, Indonesia. The greenfield project is owned by Tsingshan Holding Group and is due to operate until 2069. The mine produced an estimated 39.709Mt of ROM in 2023. It had an estimated production of 516.7 thousand tonnes of nickel in 2023"
  },
  // Oil Operations
  {
    name: "Orinoco Belt",
    coordinates: [-64.826469, 7.699111],
    resources: ["petroleum"],
    ownership: "State Owned",
    location: "Venuezala",
    details: "The Orinoco Belt is a territory in the southern strip of the eastern Orinoco River Basin in Venezuela which overlies the world's largest deposits of petroleum."
  },
  {
    name: "Ghawar Field",
    coordinates: [49.9833, 25.4333],
    resources: ["petroleum"],
    ownership: "Saudi Aramco",
    location: "Eastern Province, Saudi Arabia",
    details: "World's largest oil field, producing ~3.8 million barrels per day (bpd). Discovered in 1948, holds ~70 billion barrels of reserves."
  },
  {
    name: "Burgan Field",
    coordinates: [47.9833, 29.0667],
    resources: ["petroleum"],
    ownership: "Kuwait Oil Company",
    location: "Kuwait",
    details: "Second-largest oil field globally, producing ~1.7 million bpd. Discovered in 1938, holds ~66 billion barrels of reserves."
  },
  {
    name: "Prudhoe Bay Oil Field",
    coordinates: [-148.3333, 70.3167],
    resources: ["petroleum", "natural gas"],
    ownership: "BP (26%), ExxonMobil (36%), ConocoPhillips (36%)",
    location: "North Slope, Alaska, USA",
    details: "Largest oil field in North America, producing ~500,000 bpd. Discovered in 1968, also produces natural gas."
  },
  {
    name: "Safaniya Field",
    coordinates: [49.3167, 28.1333],
    resources: ["petroleum"],
    ownership: "Saudi Aramco",
    location: "Persian Gulf, Saudi Arabia",
    details: "World's largest offshore oil field, producing ~1.2 million bpd. Discovered in 1951, holds ~37 billion barrels of reserves."
  },
  {
    name: "Rumaila Field",
    coordinates: [47.4167, 30.1667],
    resources: ["petroleum"],
    ownership: "Iraq National Oil Company, BP, CNPC",
    location: "Basra, Iraq",
    details: "Produces ~1.5 million bpd. One of Iraq's largest oil fields, operational since 1953, with ~17 billion barrels of reserves."
  },

  // Gas Operations
  {
    name: "South Pars/North Dome Field",
    coordinates: [52.5833, 26.2833],
    resources: ["natural gas", "petroleum"],
    ownership: "QatarEnergy (Qatar), NIOC (Iran)",
    location: "Persian Gulf, Qatar/Iran",
    details: "World's largest gas field, producing ~1.8 trillion cubic feet of gas annually. Shared between Qatar and Iran, holds ~1,800 trillion cubic feet of reserves."
  },
  {
    name: "Urengoy Field",
    coordinates: [74.5333, 65.9667],
    resources: ["natural gas", "petroleum"],
    ownership: "Gazprom",
    location: "Yamal-Nenets Region, Russia",
    details: "Produces ~250 billion cubic meters of gas annually. One of world's largest gas fields, operational since 1978."
  },
  {
    name: "Turkmenistan Galkynysh Field",
    coordinates: [53.8333, 37.6667],
    resources: ["natural gas"],
    ownership: "Türkmengaz",
    location: "Mary Province, Turkmenistan",
    details: "Produces ~80 billion cubic meters of gas annually. Second-largest gas field globally, with ~700 trillion cubic feet of reserves."
  },
  {
    name: "Troll Field",
    coordinates: [3.7167, 60.6667],
    resources: ["natural gas", "petroleum"],
    ownership: "Equinor (30.58%), Petoro (56%), Shell (8.1%)",
    location: "North Sea, Norway",
    details: "Produces ~40 billion cubic meters of gas annually. Europe's largest offshore gas field, operational since 1996."
  },
  {
    name: "Ichthys Field",
    coordinates: [123.6167, -12.6667],
    resources: ["natural gas", "condensate"],
    ownership: "INPEX (62.245%), TotalEnergies (30%)",
    location: "Timor Sea, Australia",
    details: "Produces ~8.9 million tonnes of LNG annually. Operational since 2018, with ~12 trillion cubic feet of gas reserves."
  }
]; 