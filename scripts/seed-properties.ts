import { createClient } from "@supabase/supabase-js";

// Sample property data for testing
const sampleProperties = [
  {
    title: "Appartement 3 pièces - Vue sur Seine",
    description:
      "Magnifique appartement de 3 pièces avec vue imprenable sur la Seine. Récemment rénové, il dispose d'une cuisine équipée, d'un salon lumineux et de deux chambres. Idéal pour un couple ou une petite famille.",
    address: "15 Quai de la Tournelle, 75005 Paris",
    price: 750000,
    bedrooms: 2,
    bathrooms: 1,
    area_sqm: 68,
    property_type: "apartment",
    latitude: 48.8523,
    longitude: 2.3564,
    images: [],
  },
  {
    title: "Maison familiale avec jardin",
    description:
      "Belle maison familiale de 120m² avec jardin privatif de 200m². 4 chambres, 2 salles de bain, garage et cave. Quartier calme proche des écoles et commerces.",
    address: "23 Rue des Lilas, 94300 Vincennes",
    price: 890000,
    bedrooms: 4,
    bathrooms: 2,
    area_sqm: 120,
    property_type: "house",
    latitude: 48.8467,
    longitude: 2.4378,
    images: [],
  },
  {
    title: "Studio moderne - Quartier Latin",
    description:
      "Studio moderne et fonctionnel au cœur du Quartier Latin. Parfait pour un étudiant ou un jeune professionnel. Proche de toutes commodités et transports.",
    address: "8 Rue de la Huchette, 75005 Paris",
    price: 320000,
    bedrooms: 0,
    bathrooms: 1,
    area_sqm: 25,
    property_type: "apartment",
    latitude: 48.853,
    longitude: 2.3442,
    images: [],
  },
  {
    title: "Appartement avec terrasse - Montmartre",
    description:
      "Charmant appartement de 2 pièces avec une superbe terrasse de 15m². Vue dégagée, beaucoup de charme avec poutres apparentes. Quartier artistique et animé.",
    address: "12 Rue des Abbesses, 75018 Paris",
    price: 580000,
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 45,
    property_type: "apartment",
    latitude: 48.8844,
    longitude: 2.338,
    images: [],
  },
  {
    title: "Loft industriel - Belleville",
    description:
      "Magnifique loft de 90m² dans un ancien entrepôt rénové. Hauteur sous plafond exceptionnelle, grandes verrières, cuisine ouverte. Cadre unique et moderne.",
    address: "45 Rue de Belleville, 75020 Paris",
    price: 650000,
    bedrooms: 1,
    bathrooms: 1,
    area_sqm: 90,
    property_type: "apartment",
    latitude: 48.8724,
    longitude: 2.381,
    images: [],
  },
  {
    title: "Duplex familial - Boulogne",
    description:
      "Spacieux duplex de 5 pièces avec balcon. 3 chambres, bureau, séjour avec cheminée. Parking privé inclus. Proche du Bois de Boulogne.",
    address: "78 Avenue Victor Hugo, 92100 Boulogne-Billancourt",
    price: 1150000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 95,
    property_type: "apartment",
    latitude: 48.8365,
    longitude: 2.2442,
    images: [],
  },
];

async function seedProperties() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Seeding properties...");

  try {
    // First, get or create a test user
    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    if (users.length === 0) {
      console.log("No users found. Please create a user account first.");
      return;
    }

    const testUserId = users[0].id;
    console.log(`Using user ID: ${testUserId}`);

    // Add properties for the test user
    const propertiesWithUserId = sampleProperties.map((property) => ({
      ...property,
      user_id: testUserId,
    }));

    const { data, error } = await supabase
      .from("properties")
      .insert(propertiesWithUserId)
      .select();

    if (error) {
      console.error("Error seeding properties:", error);
      return;
    }

    console.log(`Successfully seeded ${data.length} properties!`);
    console.log("Sample properties added:");
    data.forEach((property, index) => {
      console.log(
        `${index + 1}. ${property.title} - ${property.price.toLocaleString()}€`
      );
    });
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the seeding function
seedProperties();
