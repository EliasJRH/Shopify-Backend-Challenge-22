# Shopify Backend Challenge 2022 - Inventory management system 🛒

Hi there 👋

My name is Elias and this is my stab at Shopify's Summer 2022 backend intern challenge

The project was completed using Node.js, Express.js and MongoDB (mongoose). Nodemon was also used primarily during the development of this project

## Before cloning

1. Ensure that you have [Node.js](https://nodejs.org/en/download/) installed. This project was made using Node v16.3.1 but any LTS version of Node should be sufficient
2. Ensure that you have [MongoDB](https://www.mongodb.com/) installed and setup
3. Ensure that you have [Git](https://git-scm.com/) installed and clone the repository using `git clone https://github.com/EliasJRH/Shopify-Backend-Challenge-22.git`
4. (Recommended) Ensure that you have some tool to send HTTP requests. I used [Postman](https://www.postman.com/) (Note: if you do end up using Postman, I've exported a collection of premade HTTP requests specifically for this project! It can be found [here](https://github.com/EliasJRH/Shopify-Backend-Challenge-22/blob/main/Shopify%20backend%20challenge%202022.postman_collection.json)!) 

## Running the project

Now that you have this project cloned, it's time to run it!

1. `cd` into the directory where you cloned this repository
2. Rename the file named `.env.example` to `.env`
3. Install all the dependencies with `npm install`
4. Start the development server with `npm run dev`
5. A message displaying the port number and `Connected to database` signifies that the project is ready to go!

## Using the inventory API

### Inventory

| Method | Route          | Description                                             |
| ------ | -------------- | ------------------------------------------------------- |
| POST   | /inventory     | Create inventory item <br/> Example request body: <br/> |
| GET    | /inventory     | Retrieve all inventory items                            |
| GET    | /inventory:id  | Retrieve inventory item by id                           |
| GET    | /inventory?upc | Retrieve inventory item by upc                          |
| PUT    | /inventory:id  | Update inventory items with id <id>                     |
| DELETE | /inventory     | Delete all inventory items                              |
| DELETE | /inventory:id  | Delete inventory item by id                             |

### Shipments

| Method | Route        | Description                  |
| ------ | ------------ | ---------------------------- |
| POST   | /shipment    | Create shipment              |
| GET    | /shipment    | Retrieve all shipments       |
| GET    | /shipment:id | Retrieve shipment by id      |
| PUT    | /shipment:id | Update shipment with id <id> |
| DELETE | /shipment    | Delete all shipments         |
| DELETE | /shipment:id | Delete shipment with by id   |

Examples for request bodies and specific routes can be found in the postman export

## Tests
To run some basic integration tests, run `npm run test` 
  
## Personal addendum

This challenge was neat to do as it brought me back to my days working at a grocery store. I'm glad I was finally able to submit a proper project this year.
