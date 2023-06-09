//Defining model
module.exports = (sequelize, dataTypes) => {

    let alias= "Product"; //Normally, the name of the model/tables in SQL goes in plural. The name of the alias, is gonna be the first atribute in the definition of model (at the end), and in convention, goes in PLURAL.

    let cols={
        //The name of the objetc, in this case "id" is gonna be the name of the column.  id is the Colum #1
        id:{
            // Each row gonna have some features in dependence of its values
            type: dataTypes.INTEGER, //Type of data
            primaryKey: true, //This is the primary key
            autoIncrement: true, // Gonna be autoincremental
            allowNull: false // Null values of id are not allowed
        },

        productName:{
            type: dataTypes.STRING,
            allowNull: false
        }, 

        price:{
            type: dataTypes.FLOAT,
            allowNull: false
        },

        discount:{            
            type: dataTypes.INTEGER
        },

        type:{
            type: dataTypes.STRING,
            // allowNull: false
        },

        mif:{
            type: dataTypes.INTEGER,
            // allowNull: false
        },

        image:{
            type: dataTypes.STRING,
            allowNull: false
        },

        description:{
            type: dataTypes.STRING,
            // allowNull: false
        },

        createdAt:{ //Date of creation
            type: dataTypes.DATE,
            field:"created_at", // Name of the column
            defaultValie:dataTypes.NOW,
            allowNull: false
        },

        updatedAt:{ //Date of updating
            type: dataTypes.DATE,
            field:"updated_at", // Name of the column
            defaultValie:dataTypes.NOW,
            allowNull: false
        },
        
        deletedAt:{ //Date of deleting
            type: dataTypes.DATE,
            field:"deleted_at", // Name of the column
        }
    };
    
    let config={ //Depende de cómo esté la DB, pero normalmente lleva estos elementos
        // paranoid: true, //This config, doesn't delete a register physically, just logically
        tableName: "Product", //Nombre de la tabla
        timeStamps: false //Sino tenemos las columnas de create y update en la tabla, esta línea es fundamental
    }

    const Product = sequelize.define(alias, cols, config); //In order of defining this model, the documentation says that at least must have: sequelize.define(modelName, attributes, options). All of those are defined here. Most of the tutorial goes part in part defining from the begining, but in this case we define at the end.

    return Product
}

