var mysql = require("mysql");
var inquirer = require("inquirer");


var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "", 
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  afterConnection();
  

});


// id = 4
// product name = 13
//dept = 15
// price = 10
function afterConnection() {
  

  connection.query('SELECT * FROM products', function(err, res) {
    if (err) throw err;
    console.log("--------------------------------------------------------------------");
    console.log("|ID  |Product            |Department         |Price     |Quantity  |");
    console.log("--------------------------------------------------------------------");

    var colSep = "|"
    var rSep = "--------------------------------------------------------------------"

    for (var i = 0; i < res.length; i++ ){
       
        var idSpace =  spacer("id", res[i].item_id);  
      var productSpace =  spacer("product", res[i].product_name);
      var deptSpace =  spacer("department", res[i].department_name);
      var priceSpace =  spacer("price", res[i].price);
      var quantitySpace =  spacer("quantity", res[i].stock_quantity);
       

        console.log(colSep + 
            res[i].item_id + idSpace + colSep +
            res[i].product_name+ productSpace + colSep + 
            res[i].department_name+ deptSpace + colSep + 
            res[i].price+ priceSpace + colSep + 
            res[i].stock_quantity+ quantitySpace + colSep 
             );
        console.log(rSep)           
    };
    
  

    inquirer.prompt([

        {
          name: "customerChoice",
          type: "input",
          message: "what would you like to buy? (Enter Product ID)",

        },
        {
          name: "itemAmount",
          type: "input",
          message: "How many units of this you would like to order? " 

        },
        ]).then(function(user) {

          connection.query('SELECT stock_quantity - ? as amount FROM products where item_id = ? ',  [user.itemAmount,user.customerChoice] , function(err, res) {
            if (err) throw err
           console.log("the nymber us " + res[0].amount + "  " + user.itemAmount)
           if(res[0].amount < 0){console.log("Insufficient Quantity!"); afterConnection()} 
           else{


          connection.query('SELECT price * ? as Price FROM products where item_id = ? ',  [user.itemAmount,user.customerChoice] , function(err, res) {
            if (err) throw err

            console.log("Price will be $" + res[0].Price)
            
          

          connection.query('update products set stock_quantity = stock_quantity - ' + user.itemAmount  + ' where item_id =' + user.customerChoice, function(err, res) {
            if (err) throw err;
          
               
                inquirer.prompt([
                  {
                  name: "answer",
                  type: "input",
                  message: "Would you like to buy another item?",
                  }
                ])    
                    .then(function(user) {
                      if(user.answer === "yes") 
                        afterConnection()

                        else{
                          connection.end( ); 
                        }
                      })
                  })
              })
                }

              })      

        }) //first inquirer
}) //display
} //Afterconnection




function spacer(type, value) {
    
var numSpaces = 0 
var number = 0
    if(type === "product" || type === "department" ) {
        numSpaces = 19
        number = (numSpaces - value.length)
    }
    else if(type === "price" || type === "quantity") {
   
        if(value < 10){number = 9}
        else if(value < 100){number = 8}
        else if(value < 1000){number = 7}
        else {number = 6}
    }
    else if(type === "id" ) {
        if(value < 10){number = 3}
        else if(value < 100 && value>9 ){number = 2}
        else if(value < 1000 && value>99){number = 1}
        else {number = 0}
    }
    else{
        number = 10
    }

    return  " ".repeat(number)   
}



