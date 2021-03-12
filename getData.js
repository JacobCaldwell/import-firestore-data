require('dotenv').config()
const axios = require('axios');
fs = require('fs')

const testdata = require('./output/testdata.json')

const API_KEY = process.env.API_KEY;

const list = [169994, 170075, 170917, 170918, 170919, 170920, 170921, 170923, 170924, 170926, 170927, 170928, 170929, 170930, 170931, 170932, 170933, 170934, 170935, 170937, 170938, 171315, 171317, 171319, 171320, 171321, 171322, 171323, 171324, 171325, 171326, 171327, 171328, 171329, 171330, 171331, 171333, 172231, 172233, 173468, 173473]

const min_list = [169994, 170075]

const itemsToIgnore = ['4:0', '6:0', '8:0', '10:0', '12:0', '14:0', '16:0', '18:0', '16:1', '16:1', '18:1', '20:1', '22:1', '18:2', '18:3', '18:4', '20:4', '20:5 n-3 (EPA)', '22:5 n-3 (DPA)', '22:6 n-3 (DHA)', 'Thiamin', 'Riboflavin', 'Proximates', 'Ash', 'Minerals', 'Vitamins and Other Components', 'Niacin', 'Pantothenic acid', 'Folic acid', 'Folate, food', 'Folate, DFE', 'Retinol', 'Vitamin D (D2 + D3), International Units', 'Vitamin A, IU', 'Lipids', 'Amino acids', 'Tryptophan', 'Threonine', 'Isoleucine', 'Leucine', 'Lysine', 'Methionine', 'Phenylalanine', 'Tyrosine', 'Valine', 'Arginine', 'Histidine', 'Alanine', 'Aspartic acid', 'Glutamic acid', 'Glycine', 'Proline', 'Serine', 'Alcohol, ethyl', 'Carotene, beta', 'Carotene, alpha', 'Cryptoxanthin, beta', 'Lycopene', 'Lutein + zeaxanthin', 'Phytosterols', 'Theobromine', 'Choline, total', 'Carbohydrates']

const itemsToRename = ['Calcium, Ca', 'Iron, Fe', 'Magnesium, Mg', 'Phosphorus, P', 'Potassium, K', 'Sodium, Na', 'Zinc, Zn', 'Copper, Cu', 'Manganese, Mn', 'Selenium, Se', 'Folate, total', 'Vitamin C, total ascorbic acid', 'Fiber, total dietary', 'Vitamin D (D2 + D3)', 'Vitamin K (phylloquinone)', 'Sugars, total including NLEA', 'Vitamin A, RAE', 'Fatty acids, total saturated', 'Fatty acids, total monounsaturated', 'Fatty acids, total polyunsaturated', 'Fatty acids, total trans', 'Carbohydrate, by difference', 'Total lipid (fat)']

const itemsNewNames = ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc', 'copper', 'manganese', 'selenium', 'folate', 'vitamin c', 'fiber', 'vitamin d', 'Vitamin K', 'sugars', 'vitamin a', 'saturated fat', 'monounsaturated fat', 'polyunsaturated fat', 'trans fat', 'carbohydrates', 'total fat']


const filter = (data, filters) => {
    return Object.keys(data)
        .filter(key => filters.includes(key))
        .reduce((obj, key) => {
            return { ...obj, [key]: data[key] }
        }, {});
}


const populateTestData = async (list) => {
    let results = await Promise.all(list.map(async (element) => {
        const url = `https://api.nal.usda.gov/fdc/v1/food/${element}?api_key=${API_KEY}`
        const data = await axios.get(url).then((res) => res.data)
        return data
    }))
    // console.log(results)
    fs.writeFile('output/testdata.json', JSON.stringify(results), function (err, results) {
        if (err) console.log('error', err);
    })
}




const getIntance = async (element) => {
    const url = `https://api.nal.usda.gov/fdc/v1/food/${element}?api_key=${API_KEY}`
    const data = await axios.get(url).then((res) => res.data)



    const fdcId = data.fdcId
    const description = data.description
    const nutrients = data.foodNutrients
        .map(data => {
            let filtered = filterObject(data.nutrient, ['name', 'unitName'])
            if (itemsToRename.includes(filtered.name)) {
                const idx = itemsToRename.indexOf(filtered.name)
                filtered.name = itemsNewNames[idx]
            }
            return { ...filtered, 'amount': data.amount }
        })
        .filter(data => {
            return !itemsToIgnore.includes(data.name)
        })


    // const nutrients2 = Object.assign(...data.foodNutrients
    //     .filter(data => {
    //         return !itemsToIgnore.includes(data.name)
    //     })
    //     .map(key => {
    //         return { [key.name]: { ...key } }
    //     })
    // )

    console.log({ nutrients2 });


    const object = Object.assign(...nutrients.map(key => {
        return { [key.name]: { ...key } }
    }))
    console.log(nutrients)

    const portions = data.foodPortions.map(portions => {
        return filterObject(portions, ['gramWeight', 'amount', 'modifier'])
    })

    const results = { fdcId, description, nutrients, portions }

    return results
}


const getData = async (list) => {
    let results = await Promise.all(list.map(async (element) => {
        return await getIntance(element)
    }))
    let stringify = JSON.stringify(results)

    if (!fs.existsSync('./output',
        function (err) {
            if (err) console.log('error', err);
        })) {
        fs.mkdir('output', function (err) {
            if (err) console.log('error', err);
        })
    }
    fs.writeFile('output/data.json', stringify, function (err, results) {
        if (err) console.log('error', err);
    })
}

// getData(min_list)
// populateTestData(min_list)




const testDataTesting = () => {

}


