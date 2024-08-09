import "https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";

import config from "./firebase.js";
import app from "./F7App.js";
import "./carsshop.js";
//import { loadCarList } from "./carsshop.js";

firebase.initializeApp(config);
const $$ = Dom7;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in with UID:", user.uid);
    app.tab.show("#tab2", true);
    loadCarList(user.uid);
  } else {
    console.log("User is signed out");
    app.tab.show("#tab1", true);
  }
});

$$("#loginForm").on("submit", (evt) => {
  evt.preventDefault();
  var formData = app.form.convertToData("#loginForm");
  firebase
    .auth()
    .signInWithEmailAndPassword(formData.username, formData.password)
    .then(() => {
      // could save extra info in a profile here I think.
      app.loginScreen.close(".loginYes", true);
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      $$("#signInError").html(errorCode + " error " + errorMessage);
      console.log(errorCode + " error " + errorMessage);
      // ...
    });
});

$$("#signUpForm").on("submit", (evt) => {
  evt.preventDefault();
  var formData = app.form.convertToData("#signUpForm");
  //alert("clicked Sign Up: " + JSON.stringify(formData));
  firebase
    .auth()
    .createUserWithEmailAndPassword(formData.username, formData.password)
    .then(() => {
      // could save extra info in a profile here I think.
      app.loginScreen.close(".signupYes", true);
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      $$("#signUpError").html(errorCode + " error " + errorMessage);
      console.log(errorCode + " error " + errorMessage);
      // ...
    });
});

$$("#logout").on("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
    })
    .catch(() => {
      // An error happened.
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
