require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await connectDB();
        
        console.log('🔄 Initialisation du compte Administrateur...');
        
        // Remove old admins if any to avoid duplication
        const adminExists = await User.findOne({ email: 'judih@cael.com' });

        if (!adminExists) {
            await User.create({
                firstname: 'Judih',
                lastname: 'Cael',
                email: 'judih@cael.com',
                password: 'cael2305!',
                phone: '0338012708',
                address: 'Administration Centrale de Dembéni',
                quartier: 'Tsararano',
                role: 'admin',
                status: 'approved'
            });
            console.log('✅ Compte Administrateur (judih@cael.com / cael2305!) créé dans la collection User.');
        } else {
            // Update to ensure correct unified fields
            adminExists.role = 'admin';
            adminExists.status = 'approved';
            adminExists.firstname = 'Judih';
            adminExists.lastname = 'Cael';
            adminExists.password = 'cael2305!';
            await adminExists.save();
            console.log('✅ Le compte Administrateur existe déjà dans la collection User et son mot de passe a été réinitialisé à cael2305!.');
        }

        process.exit();
    } catch (error) {
        console.error(`❌ Erreur seeder admin : ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
