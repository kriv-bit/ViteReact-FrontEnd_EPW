Tendremos 3 roles,
un admin
un costumer y un provider

Resulta que el administrador puede tener acceso a todas las opciones que hayan definidas en la aplicación, puede gestionar customers, providers, usuarios, y etc

El Customer solo tiene acceso a la gestion de customer
Y el de Provider solo tiene acceso a la gestion de provider

NO se va a hacer un inicio sesion, lo que se va a hacer es un endpoint
en el que se envia id de rol y el responde:
    Listado de opciones del menu para ese rol, osea un arreglo 
    json{
        name:
        content:
    }
Todo esto atraves de un Hook, tal y como esta para consultar el listado de clientes, pero ahora para definir un rol sin INicio de Sesion, puede ser un estado estatico, que sirva como un hook para consultar las opciones del menu