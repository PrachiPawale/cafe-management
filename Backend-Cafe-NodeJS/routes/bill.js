const express = require('express');
const connection = require('../connection');
const router = express.Router();
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/authentication');

router.post('/generateReport', auth.authenticateToken, (req, res) => {
    try {
        console.log("Incoming body:", req.body);

        const generatedUuid = uuid.v1();
        const orderDetails = req.body;

        if (!orderDetails.productDetails) {
            return res.status(400).json({ error: "productDetails is missing from request body" });
        }

        let productDetailsReport;
        try {
            productDetailsReport = typeof orderDetails.productDetails === "string"
                ? JSON.parse(orderDetails.productDetails)
                : orderDetails.productDetails;
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr);
            return res.status(400).json({ error: "Invalid productDetails JSON" });
        }

        var query = `
            INSERT INTO bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(
            query,
            [
                orderDetails.name,
                generatedUuid,
                orderDetails.email,
                orderDetails.contactNumber,
                orderDetails.paymentMethod,
                orderDetails.totalAmount,
                JSON.stringify(productDetailsReport), 
                res.locals.email
            ],
            (err, results) => {
                if (err) {
                    console.error("SQL error:", err);
                    return res.status(500).json(err);
                }

                ejs.renderFile(
                    path.join(__dirname, 'report.ejs'),
                    {
                        ProductDetails: productDetailsReport,
                        name: orderDetails.name,
                        email: orderDetails.email,
                        contactNumber: orderDetails.contactNumber,
                        paymentMethod: orderDetails.paymentMethod,
                        totalAmount: orderDetails.totalAmount
                    },
                    (err, html) => {
                        if (err) {
                            console.error("EJS render error:", err);
                            return res.status(500).json(err);
                        }

                        pdf.create(html).toFile(`./generated_pdf/${generatedUuid}.pdf`, (err, data) => {
                            if (err) {
                                console.error("PDF creation error:", err);
                                return res.status(500).json(err);
                            }
                            return res.status(200).json({ uuid: generatedUuid });
                        });
                    }
                );
            }
        );
    } catch (outerErr) {
        console.error("Unexpected error:", outerErr);
        return res.status(500).json(outerErr);
    }
});

router.post('/getPdf', auth.authenticateToken, (req, res) => {
    const orderDetails = req.body;
    const pdfPath = `./generated_pdf/${orderDetails.uuid}.pdf`;

    if (fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        return fs.createReadStream(pdfPath).pipe(res);
    }

    let productDetailsReport = typeof orderDetails.productDetails === 'string'
        ? JSON.parse(orderDetails.productDetails)
        : orderDetails.productDetails;

    ejs.renderFile(
        path.join(__dirname, 'report.ejs'),
        {
            productDetails: productDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            contactNumber: orderDetails.contactNumber,
            paymentMethod: orderDetails.paymentMethod,
            totalAmount: orderDetails.totalAmount
        },
        (err, html) => {
            if (err) return res.status(500).json(err);

            pdf.create(html).toFile(pdfPath, (err) => {
                if (err) return res.status(500).json(err);
                res.contentType("application/pdf");
                fs.createReadStream(pdfPath).pipe(res);
            });
        }
    );
});

router.get('/getBills', auth.authenticateToken, (req, res) => {
    var query = "SELECT * FROM bill ORDER BY id DESC";
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }

        results.forEach(row => {
            if (row.productDetails) {
                try {
                    row.productDetails = JSON.parse(row.productDetails);
                } catch (parseErr) {
                    console.error(`JSON parse error for bill id ${row.id}:`, parseErr);
                }
            }
        });

        return res.status(200).json(results);
    });
});


router.delete('/delete/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    var query = "delete from bill where id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Bill id not found" });
            }
            return res.status(200).json({ message: "Bill deleted successfully" });
        } else {
            return res.status(500).json(err);
        }
    });
});

router.get('/bill/:id', auth.authenticateToken, (req, res) => {
    const billId = req.params.id;
    var query = "SELECT * FROM bill WHERE id=?";
    connection.query(query, [billId], (err, results) => {
        if (err) return res.status(500).json(err);
        if (!results.length) return res.status(404).json({ message: "Bill not found" });

        let bill = results[0];
        if (bill.productDetails) {
            try {
                bill.productDetails = JSON.parse(bill.productDetails);
            } catch (e) {
                console.error("JSON parse error:", e);
            }
        }
        return res.status(200).json(bill);
    });
});


module.exports = router;