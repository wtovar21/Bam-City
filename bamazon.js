
var mysql = require("mysql");
var inquirer = require("inquirer");
var console_table = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,

    user: "root",

    password: "root",
    database: "bamazon_DB"
});

connection.connect(function(err){
    if (err) throw err;
});

var display = function() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        console.table(results);
    })
};

var run = function() {
    // query the database for all products available for purchase
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        // once you have the products, prompt the user for which they'd like to purchase
        inquirer.prompt([
            {
                name: "product",
                type: "list",
                choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].product_name);
                    }
                    return choiceArray;
                },
                message: "What product would you like to purchase?"
            },
            {
                name: "amount",
                type: "input",
                message: "How many would you like to purchase?"
            }
        ]).then(function(answer) {
            console.log(answer, " ------------- Answers ----------------");
            var chosenProduct;
            for (var i = 0; i < results.length; i++) {
                if (results[i].product_name === answer.product) {
                    chosenProduct = results[i];
                }
            }

            if (chosenProduct.stock_quantity  >=  parseInt(answer.amount)) {
                connection.query("UPDATE products SET ? WHERE ?", [
                {
                    stock_quantity: chosenProduct.stock_quantity - parseInt(answer.amount)
                },
                {
                    item_id: chosenProduct.item_id
                }], function(error) {
                    if (error) throw err;
                    console.log("\n\n");
                    console.log("==============================================");
                    console.log("Product purchased successfully!");
                    console.log("==============================================");
                    console.log("Purchase Summary");
                    console.log("-----------------------------");
                    console.log("Item Name: " +  chosenProduct.product_name);
                    console.log("Item Count: " + parseInt(answer.amount));
                    console.log("-----------------------------");
                    console.log("Total: " + "$" + (chosenProduct.price * parseInt(answer.amount)));
                    console.log("==============================================");
                    console.log("\n\n");
                    inquirer.
                    prompt([
                        {
                            name: 'continue',
                            type: 'input',
                            message: 'Would you like to continue shopping? '
                        }
                    ]).then(answer => {
                        console.log(answer);
                        if(answer.continue === 'yes' || answer.continue === 'y') {
                            run();
                        }else {
                            connection.end();
                        }
                    })
                     
                    // connection.end();
                })
            } else {
                console.log("==============================================");
                console.log("Insufficient stock.");
                console.log("==============================================");
                inquirer.prompt([{
                    name: "action",
                    type: 'input',
                    message: 'Do you want to pick another products for purchase '
                }
                ]).then(answer =>{
                    if(answer.action === 'yes' || answer.action === 'y'){
                        run();
                    }else {
                        connection.end();
                    }
                })
                 
                
                 
            }
        });
    });
    
};


 display();
run();
// connection.end();