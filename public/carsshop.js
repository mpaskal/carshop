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

$$(".my-sheet").on("submit", (e) => {
  e.preventDefault();
  if (firebase.auth().currentUser) {
    const oData = app.form.convertToData("#addItem");
    console.log("Form Data: ", oData);

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
      });
  } else {
    console.log("User not authenticated");
  }
});
