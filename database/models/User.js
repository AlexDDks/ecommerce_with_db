module.exports = (sequelize, dataTypes) => {

    let alias= "Users"; //Se estila el nombre del modelo en plural 

    let cols={ //Agregamos el nombre de las columnas
        id:{ //Columna 1
            type: dataTypes.INTEGER, //A cada columna se le ponen ciertos datos en función de las necesidades
            primaryKey: true,
            autoIncrement: true
        },

        userName:{
            type: dataTypes.STRING
        },

        email:{
            type: dataTypes.STRING
        },

        password:{            
            type: dataTypes.STRING
        },
    };
    
    let config={ //Depende de cómo esté la DB, pero normalmente lleva estos elementos
        tableName: "Users", //Nombre de la tabla
        timeStamps: false //Sino tenemos las columnas de create y update en la tabla, esta línea es fundamental
    }

    const User = sequelize.define(alias, cols, config); //Esto es obligatorio

    return User
}

