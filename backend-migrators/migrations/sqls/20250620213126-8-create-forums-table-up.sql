CREATE TABLE Forums (
    id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    titulo NVARCHAR(255) NOT NULL,
    descripcion NVARCHAR(500) NULL,
    fecha_creacion DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);