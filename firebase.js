const firebase = require('firebase')

require('dotenv').config()
require('firebase/firestore')

const data = require('./output/data.json')

firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    appId: process.env.FIREBASE_APP_ID
})

const db = firebase.firestore()

data.forEach(obj => {
    const { fdcId, nutrients, portions, name } = obj
    db.collection('ingredients').doc(name).set({
        fdcId,
        nutrients,
        portions,
        name
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    })
})
