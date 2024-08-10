import "https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";

import config from "./firebase.js";
import app from "./F7App.js";
import { loadCarList } from "./carsshop.js";

firebase.initializeApp(config);
const $$ = Dom7;

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function displayFormErrors(formId, errors) {
  const errorElement = $$(`#${formId}Error`);
  errorElement.html(errors.join("<br>")).css("color", "red");
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in with UID:", user.uid);
    app.tab.show("#tab2", true);
    loadCarList(user.uid);
    $$("#welcomeContent").hide();
    $$("#logout").show();
  } else {
    console.log("User is signed out");
    app.tab.show("#tab1", true);
    $$("#welcomeContent").show();
    $$("#logout").hide();
  }
});

$$("#loginForm").on("submit", (evt) => {
  evt.preventDefault();
  var formData = app.form.convertToData("#loginForm");
  const errors = [];

  if (!formData.username) errors.push("Email is required");
  else if (!validateEmail(formData.username))
    errors.push("Invalid email format");
  if (!formData.password) errors.push("Password is required");

  if (errors.length > 0) {
    displayFormErrors("signIn", errors);
    return;
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(formData.username, formData.password)
    .then(() => {
      app.loginScreen.close(".loginYes", true);
    })
    .catch(function (error) {
      var errorMessage = "An error occurred during sign in. Please try again.";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        errorMessage = "Incorrect email or password. Please try again.";
      }
      $$("#signInError").html(errorMessage).css("color", "red");
      console.log(error.code + " error " + error.message);
    });
});

$$("#signUpForm").on("submit", (evt) => {
  evt.preventDefault();
  var formData = app.form.convertToData("#signUpForm");
  const errors = [];

  if (!formData.username) errors.push("Email is required");
  else if (!validateEmail(formData.username))
    errors.push("Invalid email format");
  if (!formData.password) errors.push("Password is required");

  if (errors.length > 0) {
    displayFormErrors("signUp", errors);
    return;
  }

  firebase
    .auth()
    .createUserWithEmailAndPassword(formData.username, formData.password)
    .then(() => {
      app.loginScreen.close(".signupYes", true);
    })
    .catch((error) => {
      var errorMessage = "An error occurred during sign up. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already in use. Please use a different email or sign in.";
      }
      $$("#signUpError").html(errorMessage).css("color", "red");
      console.log(error.code + " error " + error.message);
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
      var errorMessage =
        "An error occurred during Google sign in. Please try again.";
      if (errorCode === "auth/popup-closed-by-user") {
        console.log("Sign-in popup closed by user.");
        errorMessage =
          "Sign-in cancelled. Please try again if you want to sign in.";
      }
      $$("#signInError").html(errorMessage).css("color", "red");
      console.error("Google sign in error: ", errorCode, error.message);
    });
}

$$(".googleSignIn").on("click", googleSignIn);
