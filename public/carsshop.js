import app from "./F7App.js";

const $$ = Dom7;

export function loadCarList(userId) {
  console.log("Loading car list for user:", userId);
  firebase
    .database()
    .ref("cars/" + userId)
    .once("value")
    .then((snapshot) => {
      const oItems = snapshot.val();
      console.log("Cars data received:", oItems);
      const aKeys = oItems ? Object.keys(oItems) : [];
      console.log("Number of cars:", aKeys.length);

      if (aKeys.length === 0) {
        $$("#carList").html(
          '<div class="no-cars-message">Welcome to Car Shop XL, please add your first dream car</div>'
        );
        return;
      }

      $$("#carList").html('<div class="row"></div>');
      for (let n = 0; n < aKeys.length; n++) {
        const car = oItems[aKeys[n]];
        const carId = aKeys[n];
        console.log("Rendering car:", car);
        const isPurchased = car.datePurchased ? true : false;
        const sCard = `
          <div class="col-33 tablet-50 mobile-100">
            <div class="card ${
              isPurchased ? "purchased" : ""
            }" data-car-id="${carId}">
              <div class="card-content card-content-padding">
                ${
                  isPurchased
                    ? `<div class="purchase-date">Date Purchased: ${new Date(
                        car.datePurchased
                      ).toLocaleDateString()}</div>`
                    : ""
                }
                <div class="card-image-container">
                  <img src="${car.imageUrl}" alt="${
          car.item
        }" class="card-image">
                </div>
                <div class="card-details">
                  <div>Model: ${car.item}</div>
                  <div>Manufacturer: ${car.store}</div>
                  <div>Year: ${car.year}</div>
                  <div>Price: $${car.price}</div>
                </div>
                <div class="card-buttons">
                  <button class="button button-fill color-green bought-button" ${
                    isPurchased ? "disabled" : ""
                  }>I bought this</button>
                  <button class="button button-fill color-red delete-button">I don't need this</button>
                </div>
              </div>
            </div>
          </div>
        `;
        $$("#carList .row").append(sCard);
      }
      console.log("Finished rendering cars");
    })
    .catch((error) => {
      console.error("Error loading cars:", error);
    });
}

$$("#carList").on("click", ".bought-button", function () {
  const carId = $$(this).closest(".card").data("car-id");
  markCarAsPurchased(carId);
});

$$("#carList").on("click", ".delete-button", function () {
  const carId = $$(this).closest(".card").data("car-id");
  deleteCar(carId);
});

function markCarAsPurchased(carId) {
  const userId = firebase.auth().currentUser.uid;
  const carRef = firebase.database().ref(`cars/${userId}/${carId}`);

  carRef
    .update({ datePurchased: firebase.database.ServerValue.TIMESTAMP })
    .then(() => {
      console.log("Car marked as purchased");
      loadCarList(userId);
    })
    .catch((error) => console.error("Error updating car:", error));
}

function deleteCar(carId) {
  const userId = firebase.auth().currentUser.uid;
  const carRef = firebase.database().ref(`cars/${userId}/${carId}`);

  carRef
    .remove()
    .then(() => {
      console.log("Car deleted");
      loadCarList(userId);
    })
    .catch((error) => console.error("Error deleting car:", error));
}

function validateUrl(url) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(url);
}

function displayFieldError(fieldName, errorMessage) {
  const errorElement = $$(`#addItem [name="${fieldName}"]`).siblings(
    ".item-input-error-message"
  );
  errorElement.text(errorMessage).css("display", "block");
  $$(`#addItem [name="${fieldName}"]`)
    .parents(".item-content")
    .addClass("item-input-with-error-message");
}

function clearFieldErrors() {
  $$("#addItem .item-input-error-message").text("").css("display", "none");
  $$("#addItem .item-input-with-error-message").removeClass(
    "item-input-with-error-message"
  );
}

$$(".my-sheet").on("submit", (e) => {
  e.preventDefault();
  if (firebase.auth().currentUser) {
    const oData = app.form.convertToData("#addItem");
    console.log("Form Data: ", oData);

    clearFieldErrors();

    let hasErrors = false;

    if (!oData.item) {
      displayFieldError("item", "Car model is required");
      hasErrors = true;
    }
    if (!oData.store) {
      displayFieldError("store", "Manufacturer is required");
      hasErrors = true;
    }
    if (!oData.year) {
      displayFieldError("year", "Year is required");
      hasErrors = true;
    } else if (isNaN(oData.year) || Number(oData.year) <= 0) {
      displayFieldError("year", "Year must be a positive number");
      hasErrors = true;
    }
    if (!oData.price) {
      displayFieldError("price", "Price is required");
      hasErrors = true;
    } else if (isNaN(oData.price) || Number(oData.price) <= 0) {
      displayFieldError("price", "Price must be a positive number");
      hasErrors = true;
    }
    if (oData.imageUrl && !validateUrl(oData.imageUrl)) {
      displayFieldError("imageUrl", "Invalid image URL format");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    if (!oData.imageUrl) {
      oData.imageUrl =
        "https://images.pexels.com/photos/63294/autos-technology-vw-multi-storey-car-park-63294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
    }

    const sUser = firebase.auth().currentUser.uid;
    const sId = new Date().toISOString().replace(/[.]/g, "_");
    firebase
      .database()
      .ref(`cars/${sUser}/${sId}`)
      .set(oData)
      .then(() => {
        console.log("Car added successfully!");
        app.sheet.close(".my-sheet", true);
        loadCarList(sUser);
      })
      .catch((error) => {
        console.error("Error adding car: ", error.code, error.message);
        displayFieldError(
          "item",
          "An error occurred while adding the car. Please try again."
        );
      });
  } else {
    console.log("User not authenticated");
    displayFieldError(
      "item",
      "User not authenticated. Please sign in to add a car."
    );
  }
});
