# Microservices-Final-Project
12/1/25
Tyge Plater

This is the Final Project repository for the CSC5201 Microservices Final Project

## F1 Service
This is the first sports service within the application, more could be added in the future, but for now this is the main starting service for serving sports content like Event Calendars, News, Standings, etc. 

## Stats Service
This is the main statistics service for the whole application.  Kafka will be utilized to send data from the Sports Services back to the Stats Service, which will be recieved and logged to a database.  

This will allow logs to be stored, and displayed on a simple frontend that visualizes the database data.  
