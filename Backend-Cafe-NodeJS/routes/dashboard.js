const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');

router.get('/details', auth.authenticateToken, (req, res) => {

    const query1 = "select count(id) as categoryCount from category";
    const query2 = "select count(id) as productCount from product";
    const query3 = "select count(id) as billCount from bill";

    connection.query(query1, (err, results1) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        const categoryCount = results1[0].categoryCount;

        connection.query(query2, (err, results2) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            const productCount = results2[0].productCount;

            connection.query(query3, (err, results3) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }

                const billCount = results3[0].billCount;

                const data = {
                    category: categoryCount,
                    product: productCount,
                    bill: billCount
                };

                return res.status(200).json(data);

            });

        });

    });

});

module.exports = router;