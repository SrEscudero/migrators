CREATE TABLE Noticias_Acciones_Historico (
    id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    noticia_id INT NOT NULL,
    tipo_accion NVARCHAR(50) NOT NULL,
    detalles_accion NTEXT NULL,
    mes_referencia NVARCHAR(7) NULL,
    fecha_accion DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);