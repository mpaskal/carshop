import "https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";

import config from "./firebase.js";
import app from "./F7App.js";
import "./grocery.js";

firebase.initializeApp(config);
const $$ = Dom7;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    app.tab.show("#tab2", true);
    console.log("User signed in: ", user.displayName);
    // You can update UI elements here to show user info
  } else {
    app.tab.show("#tab1", true);
    console.log("User signed out");
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

// Google Sign-In function
function googleSignIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // You might want to close the login screen here
      app.loginScreen.close(".loginYes", true);
      app.loginScreen.close(".signupYes", true);
    })
    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;

      if (errorCode === "auth/popup-closed-by-user") {
        console.log("Sign-in popup closed by user.");
        // You might want to show a message to the user
        $$("#signInError").html(
          "Sign-in cancelled. Please try again if you want to sign in."
        );
      } else {
        console.error("Google sign in error: ", errorCode, errorMessage);
        $$("#signInError").html(errorCode + " error " + errorMessage);
      }
    });
}

// Add event listeners for Google Sign-In buttons
$$(".googleSignIn").on("click", googleSignIn);
