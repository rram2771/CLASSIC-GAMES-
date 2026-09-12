# Chess & Checkers

Chess, Checkers, Connect Four, Battleship, and Hangman for two players &mdash;
pass one device back and forth, or play online with someone on a different
device.

This is a static site (no server to run) plus a small Firebase-backed sync
layer for online play. Follow the steps below in order: Firebase first, then
GitHub, then GitHub Pages, then the APK.

## 1. Create a free Firebase project (needed for online play)

1. Go to <https://console.firebase.google.com/> and sign in with any Google
   account.
2. **Add project** &rarr; give it any name &rarr; you can decline Google
   Analytics (not needed) &rarr; **Create project**.
3. In the left sidebar: **Build &rarr; Realtime Database &rarr; Create
   Database**. Pick any region, and start in **test mode** (we'll set the
   real rules in a moment).
4. Once created, click the **Rules** tab and replace the contents with:

   ```json
   {
     "rules": {
       "games": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

   Click **Publish**. This makes every game room readable/writable by
   anyone who knows its 4-letter room code &mdash; the same trust model the
   game already used inside Claude. Don't reuse this Firebase project for
   anything sensitive.
5. Back in the project overview, click the **`</>`** (web) icon to register
   a new web app. Give it any nickname, skip Firebase Hosting (we're using
   GitHub Pages instead), and click **Register app**.
6. Firebase will show you a `firebaseConfig` object. Copy it.
7. Open `firebase-config.js` in this project and paste your values in,
   replacing the placeholder strings.

## 2. Push this project to GitHub

You said you already have a GitHub account, so:

1. Go to <https://github.com/new>, create a new **public** repository
   (public is required for free GitHub Pages), don't initialize it with a
   README (you already have one here).
2. In a terminal, from this project's folder:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## 3. Turn on GitHub Pages

1. On GitHub, go to your repo's **Settings &rarr; Pages**.
2. Under **Build and deployment &rarr; Source**, choose **GitHub Actions**.
3. Push any commit (or re-run the "Deploy to GitHub Pages" workflow from
   the **Actions** tab) to trigger the included workflow
   (`.github/workflows/deploy-pages.yml`). It publishes the whole repo as
   a static site.
4. After it finishes, your live site is at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

Open that URL on two different devices and try creating/joining an online
room to confirm Firebase is wired up correctly.

## 4. Package it as an Android APK

The easiest, most reliable way (no build tools to install) is
**PWABuilder**, Microsoft's free tool for turning a PWA into an installable
app:

1. Go to <https://www.pwabuilder.com/>.
2. Paste your GitHub Pages URL and click **Start**.
3. PWABuilder reads `manifest.json` and `service-worker.js` from this
   project and scores the PWA. You should see green checks across the
   board.
4. Click **Package for stores &rarr; Android**. Keep the defaults (it will
   generate a signing key for you automatically) and click **Generate**.
5. Download the resulting `.apk` (or `.aab` if you're planning to publish
   to the Play Store instead of sideloading).
6. To install it on an Android phone: transfer the `.apk` to the device
   (email, cloud drive, USB) and open it. You'll need to allow "install
   unknown apps" for whichever app you used to open the file, since it
   isn't from the Play Store.

### Advanced: fully scripted APK builds

Google's [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
can also generate the APK from the command line, and can be wired into a
GitHub Actions workflow so a new APK gets built automatically. It needs a
one-time interactive setup (Node + a JDK installed locally, plus a
signing keystore you generate once and keep safe), so it's not included
here as a ready-made workflow &mdash; PWABuilder above gets you a working
APK in a couple of minutes with none of that setup. Worth doing later if
you want the Play Store / fully hands-off rebuilds.

## Notes and limitations

- **Room codes are not secure.** Anyone who knows (or guesses) a 4-letter
  room code can read or write that game's state. Fine for casual play with
  someone you've shared the code with directly; don't use it for anything
  where that matters.
- **Offline play:** local pass-and-play (Chess, Checkers, Connect Four)
  works fully offline once the site has been loaded once, thanks to the
  service worker. Online multiplayer always needs a network connection to
  reach Firebase.
- **Google Fonts:** the app loads Fraunces and Inter from Google Fonts over
  the network. If you want a fully offline-first experience, you can
  self-host those fonts instead, but that's not required for anything to
  work.

## Project structure

```
index.html              the app (structure, styles, and game logic)
firebase-config.js       your Firebase project keys (edit this)
firebase-init.js         wires window.storage to Firebase Realtime Database
manifest.json            PWA manifest (name, icons, colors)
service-worker.js        offline caching for the app shell
icon-*.png / favicon.png app icons (flat files at repo root)
.github/workflows/       GitHub Pages deployment workflow
```
