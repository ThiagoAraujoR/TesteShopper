const express = require('express');
const upload = require('express-fileupload');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');

const measureController = require('./controllers/measureController');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload());
app.use(express.json());

app.get('/:customer_code/list', measureController.getInfo);

app.post('/adicionarMedida',
    [
        body('image')
        .exists()
        .isBase64(),

        body('customer_code')
        .exists()
        .isAlphanumeric()
        .notEmpty()
        .trim(),

        body('datetime')
        .exists()
        .isDate()
        .notEmpty(),

        body('measure_type')
        .exists()
        .custom(value => {
            if (!['water', 'gas'].includes(value.toLowerCase())) {
                throw new Error('O tipo de medida deve ser "water" ou "gas".');
            }
            return true;
        })
    ],
    measureController.insertInfo);

app.patch('/confirm',
    [
        body('customer_code')
            .exists()
            .isAlphanumeric()
            .notEmpty()
            .trim(),
        body('value')
            .exists()
            .isNumeric()
            .notEmpty(),
    ],
    measureController.confirmInfo);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
