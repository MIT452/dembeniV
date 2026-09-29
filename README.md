# 🏛️ Portail Citoyen Dembéni (MERN Vercel Serverless)

Ce projet est un portail citoyen pour la commune de Dembéni, utilisant la stack MERN (MongoDB, Express, React, Node.js), entièrement optimisé et adapté pour être déployé sur **Vercel** sous une architecture **Serverless**.

---

## 🚀 Architecture & Adaptations Vercel

Pour permettre le déploiement sur Vercel, l'architecture a été transformée en Serverless :
1. **Express Serverless** : L'utilisation classique de `app.listen()` est conservée uniquement pour le développement local. L'application Express est exportée depuis `api/index.js` pour être traitée par les fonctions Serverless de Vercel.
2. **Cache de Connexion MongoDB** : Dans un environnement serverless, la connexion MongoDB est réutilisée d'une requête à l'autre grâce à un mécanisme de cache dans `src/config/db.js`. Cela évite la saturation des connexions MongoDB Atlas.
3. **Stockage Temporaire (Uploads)** : Le système de fichiers de Vercel étant en lecture seule, les middlewares d'upload de fichiers (via Multer) écrivent les fichiers téléversés dans le répertoire système `/tmp`. L'application Express sert automatiquement les fichiers de `/public` et `/tmp/public/uploads` de manière fluide et transparente.
4. **Vite Base URL dynamique** : Le frontend utilise la variable d'environnement `VITE_API_URL`. En local, elle pointe vers `http://localhost:4000`. En production sur Vercel, elle est laissée vide, forçant les appels API à s'effectuer de manière relative sur le même domaine.

---

## 🔒 Sécurité & Robustesse

Des middlewares et mécanismes clés ont été configurés au cœur de l'application :
- **Helmet** : Sécurisation des en-têtes HTTP contre les vulnérabilités courantes.
- **CORS** : Configuration stricte restreignant l'accès aux origines autorisées et aux sous-domaines Vercel.
- **Express Rate Limit** : Limitation des requêtes par IP pour éviter les attaques par déni de service (DDoS) et le brute force (notamment sur l'authentification et l'OTP).
- **Express Mongo Sanitize** : Nettoyage des entrées utilisateurs contre les injections NoSQL.
- **HPP (HTTP Parameter Pollution)** : Protection contre la pollution des paramètres HTTP.
- **Compression** : Compression Gzip des réponses HTTP pour de meilleures performances.
- **Cookie Parser** : Gestion sécurisée des cookies.
- **Validation automatique** : Utilisation de `express-validator` pour valider strictement les requêtes entrantes (`POST`, `PUT`, `DELETE`).

---

## 🛠️ Variables d'Environnement

### Backend (à configurer dans les variables d'environnement Vercel)
- `PORT` : Port du serveur local (ex: `4000`).
- `NODE_ENV` : Mode d'exécution (ex: `production` ou `development`).
- `MONGO_URI` : URI de connexion MongoDB Atlas.
- `JWT_SECRET` : Clé secrète de chiffrement des tokens JWT.
- `SMTP_USER` : Adresse Gmail pour Nodemailer.
- `SMTP_PASS` : Mot de passe d'application Gmail.

### Frontend
- `VITE_API_URL` : URL de l'API backend (ex: `http://localhost:4000` en développement local, laisser vide en production sur Vercel).

---

## 💻 Démarrage Local

1. Installez les dépendances à la racine (backend) et dans le dossier `frontend` :
   ```bash
   npm install
   npm install --prefix frontend
   ```
2. Configurez les fichiers `.env` pour le backend et le frontend.
3. Démarrez le backend en mode développement :
   ```bash
   npm run dev
   ```
4. Démarrez le frontend :
   ```bash
   npm run dev --prefix frontend
   ```

---

## ☁️ Instructions de Déploiement Vercel

1. Installez le CLI Vercel :
   ```bash
   npm install -g vercel
   ```
2. Liez et déployez votre application :
   ```bash
   vercel
   ```
3. Configurez les variables d'environnement sur le tableau de bord Vercel.
4. Déployez en production :
   ```bash
   vercel --prod
   ```
