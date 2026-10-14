# Chess Study

A personal chess study app for **ellesonchess**, available as a responsive web app and Android APK. It ships with 362 completed Chess.com games retrieved on 14 October 2026. No Chess.com password is required.

## Features

- Stockfish **19**, official Stockfish.js **19.0.1**, lite single-threaded WASM build. The engine is bundled, verified by SHA-256, and runs on-device without an engine API or subscription. Lite uses a smaller, weaker neural network than the full engine.
- Reddish-brown board with Cburnett pieces, tap or drag moves, legal destinations, promotion selection, board flipping, keyboard replay, move/capture sounds and mute.
- Move-by-move review: best moves, inaccuracies, mistakes, blunders and engine continuations. **Show best move** returns to the position before the move and draws a green arrow. **Next in line** plays the move and points to the next engine recommendation.
- Personal patterns count only the configured player's moves. Retry mistakes as exercises with the recommendation hidden until revealed.
- Completed Chess.com monthly archive imports, multi-game PGN upload, duplicate detection, and PGN export.
- IndexedDB game and analysis storage, bundled games on first launch, and a phone layout with bottom navigation and collapsible imports. Imported games remain on this device; the private repository contains the requested public game preload.

## Run locally

Node.js 22.12+ is required.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. `npm run build` produces `dist/` for any static HTTPS host; `npm run preview` serves the production build. The Android app bundles these assets and does not need the development server. System fonts work offline; optional web fonts load when connected.

## Use

1. Your preloaded games appear automatically. Select a game from the library.
2. Choose Quick, Balanced, or Deep and tap **Analyse game**. Quick spends about 0.15 seconds per position, Balanced 0.35, and Deep 1.5, plus engine startup. **Analyse all new** reviews unreviewed games sequentially and can be stopped.
3. Tap a move in the move list. Use **Show best move** for a visual arrow; step through the suggested line.
4. Open **My patterns** or **Practice room** to practise positions from your own games.
5. For newer games, expand **Import games** on a phone, use **Find my games**, select a month and import it. Internet is needed only for imports and optional fonts. PGN files must contain completed standard chess games.

## Android APK

The **Build Android APK** GitHub Actions workflow runs on pushes to `main` and can be started manually. It tests and builds the web app, creates a Capacitor 8 Android project, and uploads `Chess-Study-Android` containing `Chess-Study.apk` and its SHA-256 checksum. This is a signed **debug APK for personal sideloading**, not a Google Play release. New CI debug builds may use a different signing key; use a persistent release keystore before distributing updates. Export your PGNs before uninstalling, since app storage is removed on uninstall.

To build with an installed Android SDK and Java 21:

```sh
npm ci
npm run build
npx cap add android
node scripts/android-branding.mjs
npx cap sync android
cd android
./gradlew assembleDebug
```

On Windows, use `gradlew.bat assembleDebug`. The APK is in `android/app/build/outputs/apk/debug/`. The generated Android project is intentionally ignored; the pinned Capacitor version, config, and branding script reproduce it.

## Tests and model limitations

```sh
npm test
```

Tests cover PGN completion, White/Black evaluation signs, exact best moves, forced mate, castling, promotion, pattern ownership, archive URL validation, API failures and variant filtering. Browser testing should additionally verify real WASM execution, green-arrow replay, board moves, storage persistence, imports, cancellation and phone layouts. Physical Android device testing is separate from successfully compiling an APK.

Labels use centipawn-loss thresholds: 50 = inaccuracy, 100 = mistake, 200 = blunder. Scores are normalized to White. Search time and the lightweight network can change recommendations; the labels are study aids, not Chess.com accuracy scores. Pattern names such as “Missed captures” are simple heuristics based on the preferred move, not proof of an entire tactical motif. Long searches and bulk analysis consume battery; completed reviews are saved after each game. Repetition-history evaluations currently use each FEN independently, so repeated-position draw claims can differ from full game-history analysis.

## Refresh preloaded games

```sh
node scripts/preload-games.mjs ellesonchess
```

This intentionally updates the bundled public game archive. Saved reviews override bundled copies on startup. Use a private repository when keeping your personalised bundle.

## Licenses and corresponding source

This application is GPL-3.0-only; see `LICENSE` and `public/THIRD-PARTY-NOTICES.md`.

- Stockfish.js official [release v19.0.1](https://github.com/nmrugg/stockfish.js/releases/tag/v19.0.1), [exact corresponding source](https://github.com/nmrugg/stockfish.js/tree/v19.0.1), [source archive](https://github.com/nmrugg/stockfish.js/archive/refs/tags/v19.0.1.zip), and [build instructions](https://github.com/nmrugg/stockfish.js/tree/v19.0.1#how-do-i-compile-the-engine). The unmodified engine files are bundled with their GPLv3 license in `public/engine/`.
- Cburnett chess pieces: Colin M. L. Burnett, via [Lichess](https://github.com/lichess-org/lila/tree/master/public/piece/cburnett), GPL-2.0-or-later (used under GPLv3). SVG files are their editable source.
- Chess.com imports use the [Published Data API](https://www.chess.com/news/view/published-data-api). This project is not affiliated with Chess.com or the Stockfish team.
