CREATE TABLE Clientes (
    id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    usuario_id INT NOT NULL,
    estatus_documentos NVARCHAR(100) NULL,
    Nacionalidad NVARCHAR(100) NULL,
    funcionario_asignado_id INT NULL,
    fecha_asignacion DATETIME NULL
);