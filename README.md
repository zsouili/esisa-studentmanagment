# 🎓 ESISA Student Management System

Application full-stack de gestion des étudiants développée avec **Next.js 14**, **Prisma ORM**, **SQLite** et **NextAuth.js**.

> Projet réalisé par **Zayd Swy** — ESISA 1ère année Ingénierie Logiciel

---

## ✨ Fonctionnalités

- **Authentification** — Login sécurisé avec NextAuth.js (Credentials Provider + JWT)
- **Gestion des étudiants** — CRUD complet (ajout, modification, suppression)
- **Gestion des modules** — Modules par année, semestre et filière
- **Saisie des notes** — Notes normales + rattrapages, calcul automatique de la note effective
- **Suivi des absences** — Enregistrement et résumé par module
- **Délibération académique** — Calcul automatique : Admis / Rattrapage / Ajourné
- **Export CSV** — Export des étudiants, modules et notes
- **Interface premium** — Glassmorphism, animations, thème nuit/jour, étoiles animées

## 🛠️ Stack Technique

| Technologie | Rôle |
|---|---|
| Next.js 14 (App Router) | Framework React full-stack |
| Prisma ORM | Accès base de données |
| SQLite | Base de données locale |
| NextAuth.js | Authentification |
| React 18 | Interface utilisateur |
| CSS Custom (Glassmorphism) | Design premium |

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/zsouili/esisa-studentmanagment.git
cd esisa-studentmanagment

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Modifier NEXTAUTH_SECRET dans .env.local

# Initialiser la base de données
npx prisma db push
npm run db:seed

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Identifiants démo

| Email | Mot de passe |
|---|---|
| esisa@ac.ma | esisa123 |

## 📁 Structure du Projet

```
├── app/
│   ├── api/              # Routes API (REST)
│   │   ├── auth/         # NextAuth
│   │   ├── students/     # CRUD étudiants + notes + absences
│   │   ├── modules/      # CRUD modules
│   │   ├── stats/        # Statistiques dashboard
│   │   └── filieres/     # Liste des filières
│   ├── components/       # Composants React réutilisables
│   ├── dashboard/        # Pages du tableau de bord
│   │   ├── students/     # Gestion étudiants
│   │   ├── modules/      # Gestion modules
│   │   ├── grades/       # Saisie des notes
│   │   ├── absences/     # Suivi absences
│   │   ├── decisions/    # Délibération
│   │   ├── export/       # Export CSV
│   │   └── settings/     # Paramètres
│   └── login/            # Page de connexion
├── lib/                  # Utilitaires (Prisma client, auth config)
├── prisma/               # Schéma & seed
├── public/               # Assets statiques
└── middleware.js          # Protection des routes
```

## 📡 API Endpoints

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/stats` | Statistiques globales |
| GET/POST | `/api/students` | Liste / Créer étudiant |
| GET/PUT/DELETE | `/api/students/:id` | Détail / Modifier / Supprimer |
| GET/POST | `/api/students/:id/notes` | Notes d'un étudiant |
| GET/POST | `/api/students/:id/attendance` | Absences d'un étudiant |
| GET | `/api/students/:id/academic-decision` | Délibération |
| GET/POST | `/api/modules` | Liste / Créer module |
| GET/PUT/DELETE | `/api/modules/:id` | Détail / Modifier / Supprimer |

## 🌐 Déploiement Vercel

```bash
npm run build
# ou
vercel --prod
```

## 📝 License

Projet académique — ESISA 2024/2025
