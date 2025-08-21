# Estructura de Firestore - Mini-Sistema POS

## Colecciones principales

### usuarios
- uid (string, autogenerado)
- nombre (string)
- rol (string: "admin" | "vendedor")
- email (string)

### productos
- id (string, autogenerado)
- nombre (string)
- precio (number)
- stock (number)

### ventas
- id (string, autogenerado)
- vendedorId (string -> referencia a usuarios)
- productos (array de objetos { productoId, cantidad })
- fecha (timestamp)
- total (number)
