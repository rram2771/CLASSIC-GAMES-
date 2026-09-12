// Wires the game's online-play storage calls (window.storage.get/set) up to
// a Firebase Realtime Database, so multiplayer rooms sync across real
// devices instead of Claude's artifact storage.
//
// The game code was written against a simple key/value storage interface:
//   window.storage.get(key, shared) -> { key, value, shared } | null
//   window.storage.set(key, value, shared) -> { key, value, shared } | null
// where `value` is a JSON string. This file provides exactly that
// interface, backed by Firebase, so none of the game logic needed to
// change.
//
// IMPORTANT: each game state is stored as a single JSON STRING value at
// its path, not as a nested object/array tree. Realtime Database treats a
// `null` anywhere inside a written object as "delete this key" -- which
// silently turns dense arrays with empty (null) slots, like the chess and
// checkers board, into sparse objects on read-back and breaks the game.
// Storing one opaque string sidesteps that entirely.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, get as fbGet, set as fbSet } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

try {
  var app = initializeApp(firebaseConfig);
  var db = getDatabase(app);

  window.storage = {
    async get(key, shared){
      var snap = await fbGet(ref(db, "games/" + key));
      if(!snap.exists()) return null;
      return { key: key, value: snap.val(), shared: true };
    },
    async set(key, value, shared){
      await fbSet(ref(db, "games/" + key), value);
      return { key: key, value: value, shared: true };
    }
  };
} catch (e) {
  // If the config hasn't been filled in yet (or the project is
  // unreachable), leave window.storage undefined. The game already
  // shows "Online play isn't available right now." in that case instead
  // of crashing.
  console.warn("Firebase init failed \u2014 online play will be unavailable:", e);
}
