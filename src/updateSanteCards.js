require('dotenv').config();
const connectDB = require('./config/db');

const ContentSection = require('./models/ContentSection'); // Let's use the defined model if available, or keep the on-the-fly model. Let's see: ContentSection is already defined in models/ContentSection.js. Let's just import mongoose and connectDB.
const mongoose = require('mongoose');

const ContentSection = mongoose.models.ContentSection || mongoose.model('ContentSection', new mongoose.Schema({}, { strict: false }));

connectDB().then(async () => {
  const result = await ContentSection.findOneAndUpdate(
    { key: 'sante_page' },
    {
      $set: {
        'cards.0.image': '/sante-pmi-vaccination.png',
        'cards.0.img': '/sante-pmi-vaccination.png',
        'cards.0.desc': 'Consultations préventives, suivi vaccinal des enfants et accompagnement des jeunes familles par nos infirmières puéricultrices.',
        'cards.0.category': 'Prévention',
        'cards.0.location': "Centre PMI d'Iloni, Dembéni",
        'cards.0.hours': 'Lundi au Vendredi : 8h00 - 16h00 | Permanences vaccins : Mercredi 8h30 - 16h00',
        'cards.0.phone': '02 69 63 22 18',
        'cards.0.email': 'pmi.vaccinations@dembeni.fr',
        'cards.1.image': '/sante-ccas-aide-sociale.png',
        'cards.1.img': '/sante-ccas-aide-sociale.png',
        'cards.1.desc': 'Nos agents du CCAS vous accueillent et vous accompagnent dans toutes vos démarches administratives et sociales.',
        'cards.1.category': 'Social',
        'cards.1.location': 'Pôle Social CCAS, Mairie de Dembéni',
        'cards.1.hours': 'Lundi au Jeudi : 8h00 - 15h30 | Vendredi : 8h00 - 11h30',
        'cards.1.phone': '02 69 63 11 12',
        'cards.1.email': 'ccas@dembeni.fr',
        'cards.2.image': '/sante-animations-seniors.png',
        'cards.2.img': '/sante-animations-seniors.png',
        'cards.2.desc': 'Des activités collectives, ateliers conviviaux et sorties culturelles organisés chaque mois pour les personnes âgées.',
        'cards.2.category': 'Aînés',
        'cards.2.location': 'Salle des Associations de Dembéni et villages annexes',
        'cards.2.hours': 'Activités les Mardis et Jeudis : 9h00 - 12h00',
        'cards.2.phone': '02 69 63 11 12',
        'cards.2.email': 'animations.seniors@dembeni.fr'
      }
    },
    { new: true }
  );

  if (result) {
    console.log('SUCCESS - CMS cards images updated:');
    console.log('  [0] PMI image:', result.cards[0].image);
    console.log('  [1] CCAS image:', result.cards[1].image);
    console.log('  [2] Seniors image:', result.cards[2].image);
  } else {
    console.log('ERROR - No document found with key: sante_page');
  }

  process.exit(0);
}).catch(e => {
  console.error('MongoDB error:', e.message);
  process.exit(1);
});
