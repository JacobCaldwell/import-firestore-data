require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const prompt = require('prompt-sync')();
const data_list = require('./data')

const API_KEY = process.env.API_KEY;

const ignoreItems = ['4:0', '6:0', '8:0', '10:0', '12:0', '14:0', '16:0', '18:0', '16:1', '16:1', '18:1', '20:1', '22:1', '18:2', '18:3', '18:4', '20:4', '20:5 n-3 (EPA)', '22:5 n-3 (DPA)', '22:6 n-3 (DHA)', 'Thiamin', 'Riboflavin', 'Proximates', 'Ash', 'Minerals', 'Vitamins and Other Components', 'Niacin', 'Pantothenic acid', 'Folic acid', 'Folate, food', 'Folate, DFE', 'Retinol', 'Vitamin D (D2 + D3), International Units', 'Vitamin A, IU', 'Lipids', 'Amino acids', 'Tryptophan', 'Threonine', 'Isoleucine', 'Leucine', 'Lysine', 'Methionine', 'Phenylalanine', 'Tyrosine', 'Valine', 'Arginine', 'Histidine', 'Alanine', 'Aspartic acid', 'Glutamic acid', 'Glycine', 'Proline', 'Serine', 'Alcohol, ethyl', 'Carotene, beta', 'Carotene, alpha', 'Cryptoxanthin, beta', 'Lycopene', 'Lutein + zeaxanthin', 'Phytosterols', 'Theobromine', 'Choline, total', 'Carbohydrates']

const oldNames = ['Calcium, Ca', 'Iron, Fe', 'Magnesium, Mg', 'Phosphorus, P', 'Potassium, K', 'Sodium, Na', 'Zinc, Zn', 'Copper, Cu', 'Manganese, Mn', 'Selenium, Se', 'Folate, total', 'Vitamin C, total ascorbic acid', 'Fiber, total dietary', 'Vitamin D (D2 + D3)', 'Vitamin K (phylloquinone)', 'Sugars, total including NLEA', 'Vitamin A, RAE', 'Fatty acids, total saturated', 'Fatty acids, total monounsaturated', 'Fatty acids, total polyunsaturated', 'Fatty acids, total trans', 'Carbohydrate, by difference', 'Total lipid (fat)']

const newName = ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'sodium', 'zinc', 'copper', 'manganese', 'selenium', 'folate', 'vitamin c', 'fiber', 'vitamin d', 'Vitamin K', 'sugars', 'vitamin a', 'saturated fat', 'monounsaturated fat', 'polyunsaturated fat', 'trans fat', 'carbohydrates', 'total fat']

const filter = (data, filters) => {
    return Object.keys(data)
        .filter(key => filters.includes(key))
        .reduce((obj, key) => {
            return { ...obj, [key]: data[key] }
        }, {});
}

const getData = async (list) => {
    let results = await Promise.all(list.map(async (element) => {
        const url = `https://api.nal.usda.gov/fdc/v1/food/${element}?api_key=${API_KEY}`
        return await axios.get(url).then((res) => res.data)
    }))
    return results
}

const filterData = async (data) => {
    return data.map(data => {
        data.nutrients = Object.assign(...data.foodNutrients
            .filter(({ nutrient }) => {
                return !ignoreItems.includes(nutrient.name)
            })
            .map(({ nutrient, amount }) => {
                let { name, unitName: units } = nutrient

                if (oldNames.includes(name)) {
                    const idx = oldNames.indexOf(name)
                    name = newName[idx]
                }
                name = name.toLowerCase()
                return { [name]: { name, units, amount } }
            })
        )
        data.portions = Object.assign(...data.foodPortions.map(
            ({ gramWeight, amount, modifier }) => {
                return { [modifier]: { gramWeight, amount, modifier } }
            }
        ))
        data.name = renamePrompt(data.description)
        return filter(data, ['fdcId', 'name', 'nutrients', 'portions'])
    })
}

const writeFile = async (data) => {
    let stringify = JSON.stringify(data)
    if (!fs.existsSync('./output',
        function (err) {
            if (err) console.log('error', err);
        })) {
        fs.mkdir('output', function (err) {
            if (err) console.log('error', err);
        })
    }
    fs.writeFile('output/data.json', stringify, function (err) {
        if (err) console.log('error', err);
    })
}

const processData = async (list) => {
    const data = await getData(list)
    const filtered = await filterData(data)
    writeFile(filtered)
}

const renamePrompt = (current) => {
    const renamed = prompt(`${current}? `);
    return renamed ? renamed : current
}

processData([169994])