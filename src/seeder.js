require('dotenv').config();
const connectDB = require('./config/db');
const Role = require('./models/Role');

const seedRoles = async () => {
    try {
        await connectDB();
        
        console.log('🔄 Nettoyage et initialisation des rôles...');
        
        const roles = [
            { nom_role: 'admin', description: 'Administrateur du système' },
            { nom_role: 'citoyen', description: 'Citoyen utilisateur' }
        ];

        for (const role of roles) {
            await Role.findOneAndUpdate(
                { nom_role: role.nom_role },
                role,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Rôles admin et citoyen créés/mis à jour.');
        process.exit();
    } catch (error) {
        console.error(`❌ Erreur seeder : ${error.message}`);
        process.exit(1);
    }
};

seedRoles();
