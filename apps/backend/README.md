Instruction to start project

1 cd apps/backend
2 npm install
3 npm start

API DOCS
baseUrl = http://localhost:443/

User Routes
login : /user/login
body : {
email : string,
password : string
}

signup : /user/signup
body : {
username : string,
password : string
}

Product Routes
get all products : /products
header : {
Authorization : token
}
get product by id : /products/:id
header : {
Authorization : token
}

delete product by id : /products/:id
header : {
Authorization : token
}

create product : /products
header : {
Authorization : token
}
body : {
name : string,
price : number,
description : string,
id
}

update product : /products/id
header : {
Authorization : token
}
body:{
name : string,
price : number,
description : string,
id
}
