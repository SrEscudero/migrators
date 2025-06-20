CREATE TABLE Noticias (
    id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    titulo NVARCHAR(200) NOT NULL,
    autor NVARCHAR(100) NOT NULL,
    contenido NTEXT NOT NULL,
    imagen_url NVARCHAR(500) NULL,
    link NVARCHAR(500) NOT NULL,
    fecha_publicacion DATETIME NULL,
    fecha_expiracion DATETIME NOT NULL,
    estado NVARCHAR(50) NOT NULL DEFAULT 'borrador',
    destacada BIT NOT NULL DEFAULT 0,
    fecha_registro DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);