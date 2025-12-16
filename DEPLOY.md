# Guide de Déploiement sur GitHub Pages


## Étape 4 : Déployer l'application
Le projet est déjà configuré pour un déploiement automatique via le package `gh-pages`.

Exécutez simplement ces deux commandes :

```bash
# 1. Installer les dépendances du projet
npm install

# 2. Lancer le script de déploiement
# (Cela va construire l'application et la pousser sur la branche 'gh-pages')
npm run deploy
```

Une fois la commande terminée avec succès (message "Published"), passez à l'étape suivante.

## Étape 5 : Configuration finale sur GitHub
1. Allez sur la page de votre dépôt sur GitHub.
2. Cliquez sur l'onglet **Settings** (Paramètres).
3. Dans le menu de gauche, cliquez sur **Pages**.
4. Sous la section **Build and deployment** :
   - Source : **Deploy from a branch**
   - Branch : Sélectionnez **gh-pages** et le dossier **/ (root)**.
5. Cliquez sur **Save** (si ce n'est pas automatique).

Attendez quelques instants (1 à 2 minutes). Une barre en haut de la page apparaîtra avec le lien de votre site :
`Your site is live at https://...`

C'est ce lien qu'il faudra utiliser sur vos téléphones/ordinateurs !
