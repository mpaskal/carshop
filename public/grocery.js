import 'https://cdnjs.cloudflare.com/ajax/libs/framework7/5.7.10/js/framework7.bundle.js';
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-app.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.0/firebase-database.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/firebase/7.16.1/firebase-auth.min.js";
import app from "./F7App.js";

const $$ = Dom7;

$$("#tab2").on("tab:show", () => {
    const sUser = firebase.auth().currentUser.uid;
    firebase.database().ref("cars/" + sUser).on("value", (snapshot) => {
        const oItems = snapshot.val();
        const aKeys = oItems ? Object.keys(oItems) : [];
        console.log("Cars from Firebase:", oItems); // Debug log
        $$("#groceryList").html("");
        for (let n = 0; n < aKeys.length; n++) {
            let sCard = `
            <div class="card">
              <div class="card-content card-content-padding">
                <div>Model: ${oItems[aKeys[n]].item}</div>
                <div>Manufacturer: ${oItems[aKeys[n]].store}</div>
                <div>Year: ${oItems[aKeys[n]].year}</div>
                <div>Price: ${oItems[aKeys[n]].price}</div>
                <div><img src="${oItems[aKeys[n]].imageUrl}" alt="${oItems[aKeys[n]].item}" style="width:100%"></div>
              </div>
            </div>
            `;
            $$("#groceryList").append(sCard);
        }
    });
});

$$(".my-sheet").on("submit", e => {
    e.preventDefault();
    const oData = app.form.convertToData("#addItem");
    console.log("Form Data: ", oData); // Debug log
    const sUser = firebase.auth().currentUser.uid;
    const sId = new Date().toISOString().replace(".", "_");
    firebase.database().ref("cars/" + sUser + "/" + sId).set(oData, (error) => {
        if (error) {
            console.error("Error adding car: ", error);
        } else {
            console.log("Car added successfully!"); // Debug log
            app.sheet.close(".my-sheet", true);
        }
    });
});
