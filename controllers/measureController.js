const Measure = require('../models/measure');
const llm = require('./llmController');
const moment = require('moment');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

exports.insertInfo = async (req, res) => {
    try {
        const error = validationResult(req)
        const uuid = uuidv4()
        if (!error.isEmpty()){
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: error['errors'][0]['msg'] + ' in ' +error['errors'][0]['path'] ,
            });
        }

        let value = await llm.uploadFile(req.body.image) || 0;

        const date = new Date(req.body.datetime);

        const startOfMonth = moment(date).startOf('month').toDate();
        const endOfMonth = moment(date).endOf('month').toDate();

        const existingMeasure = await Measure.findOne({
            where: {
                customer_code: req.body.customer_code.toString(),
                type: req.body.measure_type,
                datetime: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });
        
        if (existingMeasure) {
            return res.status(409).json({
                error_code: "DOUBLE_REPORT",
                error_description: "Leitura do mês já realizada"
            });
        }

        const measure = await Measure.create({
            customer_code: req.body.customer_code,
            measure_uuid: uuid,
            datetime: date,
            type: req.body.measure_type,
            image_url: "example.com",
            measure_value: value || "0"
        });

        console.log(measure)
        res.status(200).json({
            image_url: measure.image_url,
            measure_value: measure.measure_value,
            measure_uuid: measure.measure_uuid
        });
        
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: error.message
            });
        }

        console.error('Erro ao criar measure:', error);
        res.status(500).json({ error: 'Erro ao criar measure' });
    }
};


exports.getInfo = async (req, res) => {
    try {
        console.log(req);
        let type_measure = '';

        if (req.query.measure_type ){
            if(!['gas', 'water'].includes(req.query.measure_type.toLowerCase())) {
                return res.status(400).json({
                    error_code: "INVALID_TYPE",
                    error_description: "Tipo de medição não permitida"
                });
            }
            type_measure = req.query.measure_type.toLowerCase();
        }

        const whereConditions = {
            customer_code: req.params.customer_code
        };

        if (type_measure) {
            whereConditions.type = type_measure;
        }

        const measures = await Measure.findAll({ 
            where: whereConditions,
            attributes: ['measure_uuid', 'datetime', 'type', 'has_confirmed', 'image_url']
        });

        if (measures.length === 0){
            return res.status(404).json({
                error_code: "MEASURES_NOT_FOUND",
                error_description: "Nenhuma leitura encontrada"
            });
        }

        const measuresFormatted = measures.map(measure => ({
            measure_uuid: measure.measure_uuid,
            measure_datetime: measure.datetime, 
            measure_type: measure.type.toUpperCase(),
            has_confirmed: measure.has_confirmed,
            image_url: measure.image_url
        }));

        const results = {
            customer_code: req.params.customer_code,
            measures: measuresFormatted
        };

        res.status(200).json(results);

    } catch (error) {
        console.error('Erro ao obter medidas:', error);
        res.status(500).json({ error: 'Erro ao obter medidas' });
    }
};

exports.confirmInfo = async(req, res) =>{
    try{
        const error = validationResult(req)

        if (!error.isEmpty()){
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: error['errors'][0]['msg'] + ' in ' +error['errors'][0]['path'] ,
            });
        }
        const whereConditions = {
            customer_code: req.body.customer_code,
        };
        
        const measures = await Measure.findOne({ 
            where: whereConditions,
            attributes: [ 'has_confirmed', 'measure_value']
        });

        if (!measures){
            return res.status(404).json({
                "error_code":"MEASURE_NOT_FOUND",
                "error_description": "Leitura do mês já realizada"
            });
        }
        if (measures.has_confirmed === true){
            return res.status(409).json({
                "error_code": "CONFIRMATION_DUPLICATE",
                "error_description": "Leitura do mês já realizada",
            });
        }

        await Measure.update(
            { measure_value: req.body.value, has_confirmed:true},
            {
                where: {
                    customer_code: whereConditions.customer_code
                }
            }
        )

        return res.status(200).json({
            "success": true
        });
    } catch (error) {
        console.error('Erro ao obter medidas:', error);
        res.status(500).json({ error: 'Erro ao obter medidas' });
    }
}
