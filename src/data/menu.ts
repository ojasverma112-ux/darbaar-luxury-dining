import butterChicken from "@/assets/dish-butter-chicken.jpg";
import biryani from "@/assets/food-biryani.jpg";
import lambBhuna from "@/assets/dish-lamb-bhuna.jpg";
import paneerTikka from "@/assets/dish-paneer-tikka.jpg";
import naan from "@/assets/food-naan.jpg";
import gulabJamun from "@/assets/food-gulab-jamun.jpg";
import fishCurry from "@/assets/dish-fish-curry.jpg";
import tandoori from "@/assets/food-tandoori.jpg";
import tikkaMasala from "@/assets/food-tikka-masala.jpg";
import seekhKebab from "@/assets/food-seekh-kebab.jpg";
import broccoli from "@/assets/food-broccoli.jpg";
import buffet from "@/assets/food-buffet.jpg";
import currytable from "@/assets/food-curry-table.jpg";

export type SpiceLevel = 0 | 1 | 2 | 3;
export type DietTag = "veg" | "vegan" | "halal" | "chef";

export interface MenuItem {
  id: string;
  name: { nl: string; en: string };
  desc: { nl: string; en: string };
  price: number;
  category: CategoryId;
  image?: string;
  spice?: SpiceLevel;
  tags?: DietTag[];
}

export type CategoryId =
  | "specials"
  | "soups"
  | "chaat"
  | "starters-veg"
  | "starters-nonveg"
  | "tandoori"
  | "mains-nonveg"
  | "mains-veg"
  | "indo-chinese"
  | "afghani"
  | "biryani"
  | "breads"
  | "extras"
  | "desserts"
  | "drinks";

export const categories: { id: CategoryId; nl: string; en: string }[] = [
  { id: "specials",        nl: "Darbaar Specials",       en: "Darbaar Specials" },
  { id: "soups",           nl: "Soepen",                 en: "Soups" },
  { id: "chaat",           nl: "Chaat / Streetfood",     en: "Chaat / Street Food" },
  { id: "starters-veg",    nl: "Vegetarische voorgerechten", en: "Vegetarian Starters" },
  { id: "starters-nonveg", nl: "Niet-vegetarische voorgerechten", en: "Non-Veg Starters" },
  { id: "tandoori",        nl: "Tandoori hoofdgerechten", en: "Tandoori Mains" },
  { id: "mains-nonveg",    nl: "Niet-vegetarische hoofdgerechten", en: "Non-Veg Mains" },
  { id: "mains-veg",       nl: "Vegetarische hoofdgerechten", en: "Vegetarian Mains" },
  { id: "indo-chinese",    nl: "Indo-Chinees",           en: "Indo-Chinese" },
  { id: "afghani",         nl: "Afghaanse gerechten",    en: "Afghani Dishes" },
  { id: "biryani",         nl: "Biryani",                en: "Biryani" },
  { id: "breads",          nl: "Indiaas brood",          en: "Indian Breads" },
  { id: "extras",          nl: "Bijgerechten",           en: "Extras" },
  { id: "desserts",        nl: "Desserts",               en: "Desserts" },
  { id: "drinks",          nl: "Dranken",                en: "Drinks" },
];

const m = (
  id: string,
  nameNl: string, nameEn: string,
  descNl: string, descEn: string,
  price: number,
  category: CategoryId,
  opts: { image?: string; spice?: SpiceLevel; tags?: DietTag[] } = {}
): MenuItem => ({
  id, name: { nl: nameNl, en: nameEn }, desc: { nl: descNl, en: descEn },
  price, category, ...opts,
});

export const menu: MenuItem[] = [
  // Specials
  m("sp1", "Drie-gangen verrassingsmenu (1 persoon)", "Three-course surprise menu (1 person)",
    "Drie gangen samengesteld door de chef.", "Three courses curated by the chef.",
    27.5, "specials", { tags: ["chef"] }),
  m("sp2", "Vegetarisch deluxe menu (2 personen)", "Vegetarian Deluxe Menu (2 people)",
    "Voorgerechten, twee curry's, naan, rijst & dessert.", "Starters, two curries, naan, rice & dessert.",
    49.0, "specials", { tags: ["veg", "chef"] }),
  m("sp3", "Tandoori deluxe menu (2 personen)", "Tandoori Deluxe Menu (2 people)",
    "Mixed grill, butter chicken, naan, rijst, dessert.", "Mixed grill, butter chicken, naan, rice, dessert.",
    59.0, "specials", { tags: ["chef", "halal"] }),
  m("sp4", "Seafood menu (2 personen)", "Seafood Menu (2 people)",
    "Garnalen pakora, vis curry, garnalen biryani, naan.", "Prawn pakora, fish curry, prawn biryani, naan.",
    65.0, "specials"),
  m("sp5", "Royal menu (4 personen)", "Royal Menu (4 people)",
    "Een koninklijk feest van zes gangen.", "A royal six-course feast.",
    119.0, "specials", { tags: ["chef"] }),

  // Soups
  m("so1", "Indiase tomatensoep", "Indian tomato soup", "Pittige tomatensoep met kruiden.", "Spiced tomato with herbs.", 5.5, "soups", { spice: 1, tags: ["veg"] }),
  m("so2", "Linzensoep", "Lentil soup", "Romige dahl soep.", "Creamy dahl soup.", 5.5, "soups", { tags: ["vegan", "veg"] }),
  m("so3", "Kippensoep", "Chicken soup", "Klassieke kruidige kippensoep.", "Classic spiced chicken soup.", 6.0, "soups", { spice: 1, tags: ["halal"] }),

  // Chaat
  m("ch1", "Pani Puri", "Pani Puri", "Krokante bolletjes met kruidig water.", "Crispy puris with spiced tangy water.", 6.5, "chaat", { spice: 2, tags: ["veg", "vegan"] }),
  m("ch2", "Samosa Chaat", "Samosa Chaat", "Samosa met yoghurt en chutneys.", "Samosa with yoghurt and chutneys.", 7.5, "chaat", { spice: 1, tags: ["veg"] }),
  m("ch3", "Papdi Chaat", "Papdi Chaat", "Knapperige chips met yoghurt en tamarinde.", "Crispy chips with yoghurt and tamarind.", 7.0, "chaat", { tags: ["veg"] }),
  m("ch4", "Aloo Tikki Chaat", "Aloo Tikki Chaat", "Aardappel patties met chutneys.", "Potato patties with chutneys.", 7.0, "chaat", { spice: 1, tags: ["veg", "vegan"] }),

  // Veg Starters
  m("vs1", "Onion Bhaji", "Onion Bhaji", "Knapperige uienringen in kikkererwtenbeslag.", "Crispy onion fritters in chickpea batter.", 5.5, "starters-veg", { tags: ["veg", "vegan"] }),
  m("vs2", "Paneer Pakora", "Paneer Pakora", "Verse kaas in krokant beslag.", "Fresh cheese in crisp batter.", 7.0, "starters-veg", { tags: ["veg"] }),
  m("vs3", "Veg Samosa", "Veg Samosa", "Driehoekjes gevuld met aardappel en erwten.", "Pastries filled with potato and peas.", 4.5, "starters-veg", { tags: ["veg", "vegan"] }),
  m("vs4", "Gobi Manchurian", "Gobi Manchurian", "Gefrituurde bloemkool in pittige saus.", "Fried cauliflower in spicy sauce.", 7.5, "starters-veg", { spice: 2, tags: ["veg"] }),
  m("vs5", "Aloo Tikki", "Aloo Tikki", "Krokante aardappelkoekjes.", "Crisp potato cakes.", 5.5, "starters-veg", { tags: ["veg", "vegan"] }),
  m("vs6", "Veg platter", "Veg platter", "Selectie van vegetarische voorgerechten.", "Selection of vegetarian starters.", 11.5, "starters-veg", { tags: ["veg", "chef"] }),

  // Non-Veg Starters
  m("ns1", "Chicken 65", "Chicken 65", "Pittige Zuid-Indiase kip.", "Spicy South-Indian chicken.", 9.0, "starters-nonveg", { spice: 3, tags: ["halal"] }),
  m("ns2", "Chicken Tikka", "Chicken Tikka", "Gemarineerde tandoori kipstukjes.", "Marinated tandoori chicken pieces.", 9.5, "starters-nonveg", { image: tikkaMasala, spice: 1, tags: ["halal", "chef"] }),
  m("ns3", "Lamb Samosa", "Lamb Samosa", "Driehoekjes gevuld met gekruid lam.", "Pastries filled with spiced lamb.", 6.0, "starters-nonveg", { tags: ["halal"] }),
  m("ns4", "Fish Pakora", "Fish Pakora", "Krokante visstukjes met chaat masala.", "Crisp fish pieces with chaat masala.", 9.0, "starters-nonveg", { spice: 1 }),
  m("ns5", "Prawn Pakora", "Prawn Pakora", "Garnalen in krokant beslag.", "Prawns in crispy batter.", 10.5, "starters-nonveg"),
  m("ns6", "Hot Wings", "Hot Wings", "Vurige Indiase kippenvleugels.", "Fiery Indian chicken wings.", 8.5, "starters-nonveg", { spice: 3, tags: ["halal"] }),

  // Tandoori
  m("t1", "Tandoori Chicken (half/whole)", "Tandoori Chicken (half/whole)", "Hele kip uit de tandoor.", "Whole chicken from the tandoor.", 14.5, "tandoori", { spice: 1, tags: ["halal", "chef"] }),
  m("t2", "Chicken Garlic Tikka", "Chicken Garlic Tikka", "Knoflook gemarineerde tikka.", "Garlic-marinated tikka.", 13.5, "tandoori", { spice: 1, tags: ["halal"] }),
  m("t3", "Fish Tandoori", "Fish Tandoori", "Vis gegrild in de tandoor.", "Fish grilled in the tandoor.", 16.5, "tandoori", { spice: 1 }),
  m("t4", "Lamb Chops", "Lamb Chops", "Gekruide lamskoteletten.", "Spiced lamb chops.", 19.5, "tandoori", { image: seekhKebab, spice: 1, tags: ["halal", "chef"] }),
  m("t5", "Mixed Grill", "Mixed Grill", "Tandoori platter met assortiment.", "Tandoori assortment platter.", 21.5, "tandoori", { image: tandoori, spice: 1, tags: ["halal", "chef"] }),

  // Non-Veg Mains
  m("mn1", "Butter Chicken", "Butter Chicken", "Romige tomatensaus, gerookte tikka.", "Creamy tomato gravy, smoky tikka.", 14.5, "mains-nonveg", { image: butterChicken, spice: 1, tags: ["halal", "chef"] }),
  m("mn2", "Chicken Vindaloo", "Chicken Vindaloo", "Vurige Goa-stijl curry.", "Fiery Goan-style curry.", 14.5, "mains-nonveg", { spice: 3, tags: ["halal"] }),
  m("mn3", "Chicken Madras", "Chicken Madras", "Pittige Zuid-Indiase curry.", "Spicy South-Indian curry.", 13.5, "mains-nonveg", { image: currytable, spice: 2, tags: ["halal"] }),
  m("mn4", "Lamb Bhuna", "Lamb Bhuna", "Diepe geroosterde lamcurry.", "Deeply roasted lamb curry.", 16.5, "mains-nonveg", { image: lambBhuna, spice: 2, tags: ["halal", "chef"] }),
  m("mn5", "Rogan Josh", "Rogan Josh", "Klassieke Kashmir lamcurry.", "Classic Kashmiri lamb curry.", 16.5, "mains-nonveg", { spice: 1, tags: ["halal"] }),
  m("mn6", "Chicken Curry", "Chicken Curry", "Huisrecept kip curry.", "House recipe chicken curry.", 13.5, "mains-nonveg", { spice: 1, tags: ["halal"] }),
  m("mn7", "Prawn Curry", "Prawn Curry", "Garnalen in tomaat-kokos curry.", "Prawns in tomato-coconut curry.", 17.5, "mains-nonveg", { spice: 2 }),
  m("mn8", "Fish Curry", "Fish Curry", "Vis in kokosgele curry.", "Fish in golden coconut curry.", 16.5, "mains-nonveg", { image: fishCurry, spice: 1 }),

  // Veg Mains
  m("mv1", "Dal Makhni", "Dal Makhni", "Romige zwarte linzen, langzaam gekookt.", "Creamy black lentils, slow cooked.", 11.5, "mains-veg", { tags: ["veg", "chef"] }),
  m("mv2", "Palak Paneer", "Palak Paneer", "Spinazie met verse kaas.", "Spinach with fresh cheese.", 12.5, "mains-veg", { tags: ["veg"] }),
  m("mv3", "Chana Masala", "Chana Masala", "Kikkererwten in pittige tomatensaus.", "Chickpeas in spiced tomato sauce.", 11.0, "mains-veg", { spice: 1, tags: ["vegan", "veg"] }),
  m("mv4", "Mixed Vegetables", "Mixed Vegetables", "Seizoensgroenten in masala.", "Seasonal vegetables in masala.", 11.0, "mains-veg", { image: broccoli, tags: ["vegan", "veg"] }),
  m("mv5", "Paneer Butter Masala", "Paneer Butter Masala", "Verse kaas in romige tomatensaus.", "Fresh cheese in creamy tomato sauce.", 12.5, "mains-veg", { image: paneerTikka, tags: ["veg", "chef"] }),
  m("mv6", "Aloo Gobi", "Aloo Gobi", "Aardappel en bloemkool curry.", "Potato and cauliflower curry.", 11.0, "mains-veg", { tags: ["vegan", "veg"] }),

  // Indo Chinese
  m("ic1", "Schezwan Noodles", "Schezwan Noodles", "Pittige Indo-Chinese noedels.", "Spicy Indo-Chinese noodles.", 10.5, "indo-chinese", { spice: 2, tags: ["veg"] }),
  m("ic2", "Fried Rice", "Fried Rice", "Wok-gebakken rijst met groenten.", "Wok-fried rice with vegetables.", 9.0, "indo-chinese", { tags: ["veg"] }),
  m("ic3", "Chilli Chicken", "Chilli Chicken", "Pittige kip met paprika.", "Spicy chicken with peppers.", 12.5, "indo-chinese", { spice: 2, tags: ["halal"] }),
  m("ic4", "Gobi Manchurian (main)", "Gobi Manchurian (main)", "Bloemkool in Manchurian saus.", "Cauliflower in Manchurian sauce.", 10.5, "indo-chinese", { spice: 1, tags: ["veg"] }),
  m("ic5", "Veg Noodles", "Veg Noodles", "Wok-noedels met groenten.", "Wok noodles with vegetables.", 9.5, "indo-chinese", { tags: ["veg", "vegan"] }),

  // Afghani
  m("af1", "Afghani Chicken", "Afghani Chicken", "Romige geroosterde kip op Afghaanse wijze.", "Creamy grilled chicken Afghani style.", 15.5, "afghani", { tags: ["halal", "chef"] }),

  // Biryani
  m("b1", "Chicken Biryani", "Chicken Biryani", "Saffraan basmati rijst met kip.", "Saffron basmati rice with chicken.", 14.0, "biryani", { image: biryani, spice: 1, tags: ["halal", "chef"] }),
  m("b2", "Lamb Biryani", "Lamb Biryani", "Aromatische rijst met mals lam.", "Aromatic rice with tender lamb.", 16.5, "biryani", { spice: 1, tags: ["halal"] }),
  m("b3", "Veg Biryani", "Veg Biryani", "Gekruide rijst met groenten.", "Spiced rice with vegetables.", 12.5, "biryani", { tags: ["veg"] }),
  m("b4", "Prawn Biryani", "Prawn Biryani", "Saffraan rijst met garnalen.", "Saffron rice with prawns.", 17.5, "biryani", { spice: 1 }),
  m("b5", "Biryani Delight (sharing)", "Biryani Delight (sharing)", "Royale schotel om te delen.", "Royal sharing platter.", 28.0, "biryani", { image: buffet, tags: ["chef"] }),

  // Breads
  m("br1", "Butter Naan", "Butter Naan", "Klassieke tandoori naan met boter.", "Classic tandoori naan with butter.", 3.5, "breads", { tags: ["veg"] }),
  m("br2", "Garlic Naan", "Garlic Naan", "Naan met verse knoflook en koriander.", "Naan with fresh garlic and cilantro.", 4.0, "breads", { image: naan, tags: ["veg", "chef"] }),
  m("br3", "Cheese Naan", "Cheese Naan", "Gevuld met gesmolten kaas.", "Filled with melted cheese.", 4.5, "breads", { tags: ["veg"] }),
  m("br4", "Cheese Garlic Naan", "Cheese Garlic Naan", "Knoflook én kaas — het beste van twee.", "Garlic and cheese — best of both.", 5.0, "breads", { tags: ["veg"] }),
  m("br5", "Aloo Parantha", "Aloo Parantha", "Brood gevuld met aardappel.", "Bread filled with spiced potato.", 4.5, "breads", { tags: ["veg"] }),
  m("br6", "Cheese Parantha", "Cheese Parantha", "Brood gevuld met kaas.", "Bread filled with cheese.", 4.5, "breads", { tags: ["veg"] }),
  m("br7", "Tandoori Roti", "Tandoori Roti", "Volkoren brood uit de tandoor.", "Whole-wheat bread from the tandoor.", 3.0, "breads", { tags: ["vegan", "veg"] }),

  // Extras
  m("ex1", "Raita", "Raita", "Yoghurt met komkommer en kruiden.", "Yoghurt with cucumber and herbs.", 3.5, "extras", { tags: ["veg"] }),
  m("ex2", "Papadam", "Papadam", "Krokante linzen-chips met chutneys.", "Crispy lentil chips with chutneys.", 3.0, "extras", { tags: ["vegan", "veg"] }),
  m("ex3", "Pickle", "Pickle", "Huisgemaakte Indiase pickle.", "House-made Indian pickle.", 2.5, "extras", { spice: 2, tags: ["vegan", "veg"] }),
  m("ex4", "Sauces", "Sauces", "Mint, tamarinde of yoghurt.", "Mint, tamarind or yoghurt.", 2.0, "extras", { tags: ["veg"] }),
  m("ex5", "Salad", "Salad", "Verse Indiase salade.", "Fresh Indian salad.", 4.5, "extras", { tags: ["vegan", "veg"] }),
  m("ex6", "Saffron Rice", "Saffron Rice", "Basmati met saffraan.", "Basmati with saffron.", 4.5, "extras", { tags: ["veg"] }),
  m("ex7", "Chana Pulao", "Chana Pulao", "Rijst met kikkererwten.", "Rice with chickpeas.", 5.0, "extras", { tags: ["vegan", "veg"] }),

  // Desserts
  m("d1", "Gulab Jamun", "Gulab Jamun", "Warme melkballetjes in rozenstroop.", "Warm milk dumplings in rose syrup.", 5.0, "desserts", { image: gulabJamun, tags: ["veg", "chef"] }),
  m("d2", "Kheer", "Kheer", "Romige rijstpudding met kardemom.", "Creamy rice pudding with cardamom.", 5.0, "desserts", { tags: ["veg"] }),
  m("d3", "Baklawa", "Baklawa", "Honing-noten gebak.", "Honey-nut pastry.", 5.5, "desserts", { tags: ["veg"] }),

  // Drinks
  m("dr1", "Mango Lassi", "Mango Lassi", "Romige mango yoghurt drank.", "Creamy mango yoghurt drink.", 4.5, "drinks", { tags: ["veg", "chef"] }),
  m("dr2", "Soft Drinks", "Soft Drinks", "Cola, Fanta, Sprite, water.", "Coke, Fanta, Sprite, water.", 2.8, "drinks"),
  m("dr3", "Masala Chai", "Masala Chai", "Indiase gekruide thee.", "Indian spiced tea.", 3.5, "drinks", { tags: ["veg"] }),
  m("dr4", "Coffee", "Coffee", "Espresso, cappuccino of latte.", "Espresso, cappuccino or latte.", 3.2, "drinks", { tags: ["veg"] }),
  m("dr5", "Indian beverages", "Indian beverages", "Limca, Thums Up, Rooh Afza.", "Limca, Thums Up, Rooh Afza.", 3.8, "drinks"),
];

export const signatures: { id: string; image: string }[] = [
  { id: "mn1", image: butterChicken },
  { id: "b1",  image: biryani },
  { id: "mn4", image: lambBhuna },
  { id: "mv5", image: paneerTikka },
  { id: "t5",  image: tandoori },
  { id: "mn8", image: fishCurry },
  { id: "br2", image: naan },
  { id: "d1",  image: gulabJamun },
];
