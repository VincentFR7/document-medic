# Datapad - Corps Médical Omega (Netlify + Supabase)

Contenu du dossier :
- index.html (version auth, garde le style original, modals pour connexion/inscription/reset)
- netlify/functions/admin_reset.js (Netlify Function pour réinitialisation admin)

## Installation rapide
1. Crée un projet Supabase si tu ne l'as pas déjà.
   - L'utilisateur a fourni un projet: https://supabase.com/dashboard/project/lshfzzwkcxasvzfcaixg
   - Récupère l'URL publique du projet (ex: https://<ref>.supabase.co) et la clé ANON.
2. Remplace les variables dans `index.html` :
   - SUPABASE_URL (ligne en haut du script)
   - SUPABASE_ANON_KEY
3. Crée la table `profiles` dans Supabase (SQL) :

```sql
create table public.profiles (
  id uuid primary key,
  full_name text,
  grade text,
  regiment text,
  fonction text,
  matricule text,
  nickname text,
  created_at timestamptz default now()
);
```

4. Configure les templates d'email dans Supabase (confirmation / reset) si tu veux des messages propres.
5. Sur Netlify :
   - Ajoute les variables d'environnement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` (pour la function admin_reset).
   - Déploie le site (le dossier racine contient `index.html`).

## Notes importantes
- **Ne pas** mettre la `SERVICE_ROLE_KEY` dans le client (index.html). Elle est **strictement** côté serveur (Netlify env).
- La Netlify Function fournie met à jour le mot de passe via l'API admin Supabase. Il te faudra peut-être adapter selon la version actuelle de l'API.
- Pour envoyer réellement le mot de passe temporaire par email, configure un envoi (SendGrid / Mailgun) ou adapte les templates Supabase.

Si tu veux que j'intègre les clés et que je zippe encore une fois avec les valeurs exactes, fournis ta ANON KEY (à éviter en public) — mieux : configure-toi seul sur Netlify.
