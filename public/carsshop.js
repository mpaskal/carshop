import app from "./F7App.js";

const $$ = Dom7;

document.addEventListener("DOMContentLoaded", (event) => {
  $$(".my-sheet").on("submit", (e) => {
    e.preventDefault();
    console.log("Current user:", firebase.auth().currentUser);
    if (firebase.auth().currentUser) {
      const oData = app.form.convertToData("#addItem");
      console.log("Form Data: ", oData);

      const carData = {
        item: oData.item || "",
        store: oData.store || "",
        year: parseInt(oData.year) || 0,
        price: parseFloat(oData.price) || 0,
        imageUrl: oData.imageUrl || "https://example.com/placeholder.jpg",
      };

      const sUser = firebase.auth().currentUser.uid;
      console.log("User ID: ", sUser);
      const sId = new Date().toISOString().replace(/[.]/g, "_");
      firebase
        .database()
        .ref(`cars/${sUser}/${sId}`)
        .set(carData)
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

  $$("#tab2").on("tab:show", () => {
    if (firebase.auth().currentUser) {
      loadCarList(firebase.auth().currentUser.uid);
    } else {
      console.log("User not authenticated");
    }
  });
});

function loadCarList(userId) {
  firebase
    .database()
    .ref("cars/" + userId)
    .on("value", (snapshot) => {
      const oItems = snapshot.val();
      const aKeys = oItems ? Object.keys(oItems) : [];
      console.log("Cars from Firebase:", oItems);
      $$("#carsList").html("");
      for (let n = 0; n < aKeys.length; n++) {
        const car = oItems[aKeys[n]];
        const sCard = `
        <div class="card">
          <div class="card-content card-content-padding">
            <div>Model: ${car.item}</div>
            <div>Manufacturer: ${car.store}</div>
            <div>Year: ${car.year}</div>
            <div>Price: $${car.price}</div>
            <div><img src="${car.imageUrl}" alt="${car.item}" style="width:100%"></div>
          </div>
        </div>
      `;
        $$("#carsList").append(sCard);
      }
    });
}
