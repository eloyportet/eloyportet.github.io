# eloy.portet.org

Page « link-in-bio » d'**Eloy Portet**, batteur du groupe **Stoneheart**.
Site statique d'une seule page, hébergé sur **GitHub Pages** (domaine perso via `CNAME`), installable en **PWA** et consultable **hors ligne**.

Ce document sert de passation : un humain ou une IA doit pouvoir reprendre le projet sans contexte préalable.

---

## Objectifs

1. **Carte de visite numérique** : liens vers les réseaux d'Eloy et de Stoneheart, contact email.
2. **Partage en face à face** : un QR code (contact vCard ou URL du site) affichable en un geste depuis le téléphone, y compris sans réseau (en concert, en cave…).
3. **Installable** : proposer l'ajout à l'écran d'accueil (bouton « Installer l'appli » en pied de page ; consigne manuelle sur iOS).
4. **Bon référencement** sur la requête « Eloy Portet » / « batteur Stoneheart », et de beaux aperçus quand le lien est partagé (Facebook, WhatsApp, Instagram…).
5. **Identité visuelle** : chrome/métal sur fond noir, monochrome, une seule touche de rouge (`--color-accent`). Mode sombre par défaut, mode clair « acier brossé » en option.

## Contraintes

- **Zéro build, zéro dépendance** : HTML/CSS/JS à la main, servis tels quels par GitHub Pages. Pas de framework, pas de bundler, pas de `package.json`. Le site doit rester modifiable directement depuis l'interface GitHub.
- **Coût nul** : pas de service tiers payant, pas de backend. Seule ressource externe : les polices Fontshare (Clash Display, General Sans).
- **Léger et rapide** : images dimensionnées pour leur taille d'affichage (×2 pour les écrans Retina), pas de JS bloquant (`defer`).
- **Accessible** : `alt` sur les images, `aria-label` sur les boutons icônes, focus visible, `prefers-reduced-motion` respecté (animations coupées).
- **Langue** : contenu en français (`lang="fr"`), ton décalé (« mi-homme, mi-canard »).
- **Vie privée** : seule mesure d'audience autorisée : **GoatCounter** (sans cookie, sans donnée personnelle, donc pas de bandeau de consentement), compte `eportet` → https://eportet.goatcounter.com. Script présent dans `index.html` et `404.html` (la 404 permet de repérer les liens cassés). Pas d'autre tracker.

## Arborescence

| Fichier | Rôle |
|---|---|
| `index.html` | La page unique : contenu, balises SEO/Open Graph, JSON-LD, fenêtre QR (`<dialog>`) |
| `css/style.css` | Tous les styles ; jetons de couleur/espacement en variables CSS (`:root`, `[data-theme]`) |
| `js/main.js` | Bascule de thème, effet d'inclinaison des boutons, enregistrement du service worker, bouton d'installation, fenêtre QR |
| `sw.js` | Service worker : cache hors ligne (**voir « Versionner le cache »**) |
| `manifest.webmanifest` | Manifest PWA (nom, couleurs, icônes) |
| `favicon.svg` | Logo « E » vectoriel |
| `assets/eloy-photo.jpg` | Photo originale (1536 px) : source de l'avatar et de l'image de partage, référencée dans le JSON-LD |
| `assets/og-image.jpg` | Image d'aperçu de partage 1200×630 (`og:image`, `twitter:image`), générée depuis `tools/og-template.html` |
| `assets/eloy-avatar-336.jpg` | Avatar affiché sur la page (336 px = 168 px ×2) |
| `assets/icons/` | Icônes PNG générées depuis le logo (192, 512, 512 maskable, apple-touch 180, favicon 32) |
| `assets/qr-vcard.svg` | QR code de la fiche contact (contenu = `eloy-portet.vcf`) |
| `assets/qr-site.svg` | QR code de l'URL `https://eloy.portet.org/` |
| `eloy-portet.vcf` | Fiche contact téléchargeable (vCard 3.0) |
| `404.html` | Page d'erreur servie par GitHub Pages pour toute URL inconnue (chemins **absolus** obligatoires : `/css/style.css`) |
| `tools/og-template.html` | Gabarit HTML de l'image de partage (non indexé). Publié mais jamais lié |
| `robots.txt`, `sitemap.xml` | Indexation |
| `CNAME` | Domaine perso GitHub Pages — **ne pas supprimer** |

## ⚠️ Versionner le cache (`sw.js`)

Le service worker garde une copie des fichiers dans le navigateur des visiteurs. **Après toute modification d'un fichier du site, incrémenter `VERSION` en haut de `sw.js`** :

```js
const VERSION = 'v1';   // → 'v2', 'v3', …
```

Pourquoi : la page HTML est servie « réseau d'abord », mais le CSS, le JS et les images sont servis « cache d'abord » (rafraîchis en arrière-plan). Sans changement de `VERSION`, un visiteur peut voir la nouvelle page avec l'ancien CSS/JS pendant une visite. Changer `VERSION` modifie `sw.js`, ce qui force le navigateur à installer le nouveau service worker, à retélécharger tous les fichiers et à supprimer l'ancien cache.

Autres règles :
- **Nouveau fichier nécessaire hors ligne** → l'ajouter à la liste `PRECACHE` de `sw.js`. Un chemin qui n'existe pas fait **échouer toute l'installation** du service worker : vérifier l'orthographe.
- **Fichier renommé ou supprimé** → le retirer de `PRECACHE`.
- Les liens externes (Instagram, Facebook, stoneheart.fr) ne sont pas mis en cache : c'est voulu.

## Recettes courantes

### Modifier un texte ou un lien
Éditer `index.html`, puis incrémenter `VERSION` dans `sw.js`.

### Changer l'email ou les infos de contact
Les infos sont présentes à **quatre** endroits, à garder synchronisés :
1. `index.html` : pied de page (`mailto:`) et JSON-LD (`"email"`, `sameAs`)
2. `eloy-portet.vcf`
3. `assets/qr-vcard.svg` : **à regénérer** (le QR encode le contenu du `.vcf`)
4. Si l'URL du site change : `assets/qr-site.svg`, `CNAME`, balises `canonical`/`og:*`, `sitemap.xml`, `robots.txt`, JSON-LD, et l'URL du bouton Partager dans `js/main.js`

Regénérer les QR (Node requis, hors du dépôt pour ne pas y laisser de `node_modules`) :

```bash
mkdir /tmp/qr && cd /tmp/qr && npm i qrcode@1.5.4
node -e "const Q=require('qrcode'),fs=require('fs'),o={type:'svg',margin:2,errorCorrectionLevel:'M',color:{dark:'#060606',light:'#ffffff'}};const R='CHEMIN/VERS/LE/DEPOT';Q.toString(fs.readFileSync(R+'/eloy-portet.vcf','utf8'),o).then(s=>fs.writeFileSync(R+'/assets/qr-vcard.svg',s));Q.toString('https://eloy.portet.org/',o).then(s=>fs.writeFileSync(R+'/assets/qr-site.svg',s))"
```

Garder la vCard courte : plus elle est longue, plus le QR est dense et difficile à scanner.

### Changer la photo
- Avatar : recadrer en carré **336×336**, JPEG qualité ~80, remplacer `assets/eloy-avatar-336.jpg`.
- Image de partage : regénérer `assets/og-image.jpg` (voir ci-dessous).
- Incrémenter `VERSION`.

### Regénérer l'image de partage (`og-image.jpg`)
Modifier `tools/og-template.html` (textes, mise en page), lancer le serveur local, puis faire une capture 1200×630 en mode headless (Edge ou Chrome) :

```bash
msedge --headless --hide-scrollbars --window-size=1200,630 --virtual-time-budget=8000 --screenshot=og.png http://localhost:8080/tools/og-template.html
```

Convertir `og.png` en JPEG (qualité ~85, < 100 Ko) vers `assets/og-image.jpg`, supprimer le PNG, incrémenter `VERSION`. Puis forcer Facebook à relire la page (Sharing Debugger), sinon il garde l'ancien aperçu.

### Changer le logo / les icônes
`favicon.svg` est la source. Les PNG de `assets/icons/` en sont dérivés : l'icône `maskable` doit avoir un fond plein et le « E » dans les 80 % centraux (Android découpe les bords).

### Tenir à jour le JSON-LD (SEO)
Le bloc `<script type="application/ld+json">` de `index.html` est un `@graph` : la page (`ProfilePage`), Eloy (`Person`, `#eloy`), ses groupes (`MusicGroup` Stoneheart et Dad Jokes) et ses concerts passés (`MusicEvent`, chacun avec une vidéo YouTube de la chaîne de son père en `recordedIn`). Les nœuds se référencent par `@id`.
- **Nouveau concert** : copier un `MusicEvent`, changer `@id`, date, lieu, vidéo (date de mise en ligne et durée lisibles dans le code source de la page YouTube : `uploadDate`, `duration`), puis ajouter son `@id` dans `performerIn` de `#eloy`.
- **Nouveau profil d'Eloy** (Spotify, MusicBrainz…) → `sameAs` de `#eloy`. Profil du groupe → `sameAs` du `MusicGroup`. Ne jamais mettre dans `sameAs` un compte qui n'est pas le sien (ex. la chaîne YouTube de son père).
- Mettre à jour `dateModified` de la `ProfilePage`.
- **Eloy est mineur** : ne pas publier date de naissance, adresse, nom de l'établissement scolaire ni noms complets des autres musiciens. Localisation limitée au département.
- Vérifier ensuite avec le Rich Results Test de Google ou validator.schema.org.

### Ajouter une section de liens
Copier un bloc `<a class="link-btn link-btn--secondary">` existant (icône SVG en ligne, `target="_blank" rel="noopener noreferrer"`). Si c'est un profil de la même personne/du groupe, l'ajouter aussi au `sameAs` du JSON-LD.

## Tester en local

Le service worker exige `http://localhost` ou HTTPS : ouvrir `index.html` par double-clic (`file://`) ne suffit pas.

```bash
npx -y http-server@14.1.1 -p 8080 -c-1
```

Puis ouvrir http://localhost:8080. Le fichier `.claude/launch.json` contient la même commande pour Claude Code.

À vérifier avant de pousser :
- DevTools → **Application** → *Manifest* : pas d'erreur, icônes visibles ; *Service workers* : actif.
- DevTools → **Network** → cocher *Offline*, recharger : la page et la fenêtre QR doivent s'afficher.
- Le bouton « Installer l'appli » n'apparaît que si Chrome/Edge proposent l'installation (et jamais une fois l'appli installée).
- En local, le service worker de localhost peut servir une vieille version : DevTools → Application → *Clear site data*, ou cocher *Update on reload*.

## Déployer

Pousser sur `main` : GitHub Pages publie en une à deux minutes. Après une mise en ligne qui touche le SEO :
- Aperçus de partage : Sharing Debugger de Facebook (forcer un nouveau scraping).
- Données structurées : Rich Results Test de Google.
- Indexation : déclarer `https://eloy.portet.org/sitemap.xml` dans Google Search Console.

### Signaler une mise à jour aux moteurs
- **Bing, Yandex, Seznam, Naver** (protocole IndexNow) : la clé est le fichier `de6c517051ebe6dd132277704fc3fc0b.txt` à la racine (ne pas le supprimer). Après un déploiement :
  ```bash
  curl "https://api.indexnow.org/indexnow?url=https://eloy.portet.org/&key=de6c517051ebe6dd132277704fc3fc0b"
  ```
  Réponse 200 ou 202 = reçu.
- **Google** : ne propose plus de « ping ». Passer par Google Search Console → Inspection de l'URL → Demander l'indexation. Mettre à jour `<lastmod>` de `sitemap.xml`.

## Idées en attente

- Section « Dad Jokes » : actuellement « Coming soon ». Piste : une blague au hasard tirée d'un tableau dans `main.js` (fonctionne hors ligne, zéro dépendance).
