# Ejemplos de documentos Firestore

## Colección: usuarios

```json
{
  "nombre": "Juan Pérez",
  "rol": "admin",
  "email": "juan.perez@email.com"
}
```

```json
{
  "nombre": "Ana Gómez",
  "rol": "usuario",
  "email": "ana.gomez@email.com"
}
```

```json
{
  "nombre": "Carlos Ruiz",
  "rol": "usuario",
  "email": "carlos.ruiz@email.com"
}
```

```json
{
  "nombre": "Lucía Torres",
  "rol": "admin",
  "email": "lucia.torres@email.com"
}
```

## Colección: productos

```json
{
  "id": "prod_001",
  "nombre": "Coca Cola 500ml",
  "precio": 1.5,
  "stock": 120
}
```

```json
{
  "id": "prod_002",
  "nombre": "Pan Bimbo",
  "precio": 2.0,
  "stock": 45
}
```

```json
{
  "id": "prod_003",
  "nombre": "Leche Alpura 1L",
  "precio": 1.8,
  "stock": 60
}
```

```json
{
  "id": "prod_004",
  "nombre": "Huevos 12pzas",
  "precio": 2.5,
  "stock": 30
}
```

## Colección: ventas

```json
{
  "id": "venta_001",
  "productos": [
    { "productoId": "prod_001", "cantidad": 2 },
    { "productoId": "prod_002", "cantidad": 1 }
  ],
  "fecha": "2024-06-01T10:30:00Z",
  "total": 5.0
}
```

```json
{
  "id": "venta_002",
  "productos": [
    { "productoId": "prod_002", "cantidad": 3 },
    { "productoId": "prod_003", "cantidad": 1 }
  ],
  "fecha": "2024-06-02T15:45:00Z",
  "total": 7.8
}
```

```json
{
  "id": "venta_003",
  "productos": [
    { "productoId": "prod_004", "cantidad": 2 }
  ],
  "fecha": "2024-06-03T12:10:00Z",
  "total": 5.0
}
```

```json
{
  "id": "venta_004",
  "productos": [
    { "productoId": "prod_001", "cantidad": 1 },
    { "productoId": "prod_003", "cantidad": 2 }
  ],
  "fecha": "2024-06-04T09:20:00Z",
  "total": 5.1
}
```
