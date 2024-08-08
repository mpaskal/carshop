import "https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";

import config from "./firebase.js";
import app from "./F7App.js";

// Initialize Firebase
firebase.initializeApp(config);

// Make Firebase globally available
window.firebase = firebase;

console.log("Firebase initialized:", firebase.apps.length > 0);

const $$ = Dom7;

firebase.auth().onAuthStateChanged((user) => {
  console.log("User: ", user);
  if (user) {
    console.log("User is signed in with UID:", user.uid);
    app.tab.show("#tab2", true);
  } else {
    console.log("User is signed out");
    app.tab.show("#tab1", true);
  }
});

$$("#loginForm").on("submit", (evt) => {
  evt.preventDefault();
  const formData = app.form.convertToData("#loginForm");
  firebase
    .auth()
    .signInWithEmailAndPassword(formData.username, formData.password)
    .then(() => {
      app.loginScreen.close(".loginYes", true);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      $$("#signInError").html(errorCode + " error " + errorMessage);
      console.log(errorCode + " error " + errorMessage);
    });
});

$$("#signUpForm").on("submit", (evt) => {
  evt.preventDefault();
  const formData = app.form.convertToData("#signUpForm");
  firebase
    .auth()
    .createUserWithEmailAndPassword(formData.username, formData.password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({
        displayName: formData.username.split("@")[0],
      });
    })
    .then(() => {
      console.log("User profile updated");
      app.loginScreen.close(".signupYes", true);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      $$("#signUpError").html(errorCode + " error " + errorMessage);
      console.log(errorCode + " error " + errorMessage);
    });
});

$$("#logout").on("click", () => {
  firebase
    .auth()
    .signOut()
    .catch((error) => {
      console.error("Sign-out error: ", error);
    });
});

function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      app.loginScreen.close(".loginYes", true);
      app.loginScreen.close(".signupYes", true);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === "auth/popup-closed-by-user") {
        console.log("Sign-in popup closed by user.");
        $$("#signInError").html(
          "Sign-in cancelled. Please try again if you want to sign in."
        );
      } else {
        console.error("Google sign in error: ", errorCode, errorMessage);
        $$("#signInError").html(errorCode + " error " + errorMessage);
      }
    });
}

$$(".googleSignIn").on("click", googleSignIn);

// Import carsshop.js after Firebase initialization
import "./carsshop.js";
