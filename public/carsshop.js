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

$$(".my-sheet").on("submit", (e) => {
  e.preventDefault();
  if (firebase.auth().currentUser) {
    const oData = app.form.convertToData("#addItem");
    console.log("Form Data: ", oData);

    const errors = [];
    if (!oData.item) errors.push("Car model is required");
    if (!oData.store) errors.push("Manufacturer is required");
    if (!oData.year) errors.push("Year is required");
    else if (isNaN(oData.year) || Number(oData.year) <= 0)
      errors.push("Year must be a positive number");
    if (!oData.price) errors.push("Price is required");
    else if (isNaN(oData.price) || Number(oData.price) <= 0)
      errors.push("Price must be a positive number");
    if (oData.imageUrl && !validateUrl(oData.imageUrl))
      errors.push("Invalid image URL format");

    if (errors.length > 0) {
      $$("#addItemError").html(errors.join("<br>")).css("color", "red");
      return;
    }

    $$("#addItemError").html("");

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
        $$("#addItemError")
          .html("An error occurred while adding the car. Please try again.")
          .css("color", "red");
      });
  } else {
    console.log("User not authenticated");
    $$("#addItemError")
      .html("User not authenticated. Please sign in to add a car.")
      .css("color", "red");
  }
});
