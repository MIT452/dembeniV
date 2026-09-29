const mongoose = require('mongoose');

const buttonSchema = new mongoose.Schema({
    text: { type: String, default: '' },
    link: { type: String, default: '' },
    style: { type: String, default: 'primary' } // primary, secondary, outline
});

const cardSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    link: { type: String, default: '' },
    icon: { type: String, default: '' }, // Name of the lucide icon
    badge: { type: String, default: '' }
});

const contentSectionSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., "home_hero", "home_services", "home_commune_info", "sante_page", "culture_page", "footer", "contact_page"
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    bgImage: { type: String, default: '' }, // Image URL or Base64 data string
    bgColor: { type: String, default: '' }, // hex color or css gradient
    textColor: { type: String, default: '' }, // default text color overriding
    primaryColor: { type: String, default: '' }, // accent green / white
    buttons: [buttonSchema],
    cards: [cardSchema],
    items: { type: mongoose.Schema.Types.Mixed, default: [] }, // Arbitrary arrays (e.g., accordion questions/answers, key numbers)
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('ContentSection', contentSectionSchema);
