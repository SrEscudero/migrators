-- PASO 1: REVERTIR LOS CAMBIOS EN LA TABLA Noticias
-- Primero eliminamos la relación (Foreign Key)
ALTER TABLE Noticias DROP CONSTRAINT FK_Noticias_Usuarios;
GO

-- Volvemos a añadir la columna de texto 'autor'
ALTER TABLE Noticias ADD autor NVARCHAR(100) NULL;
GO

-- Intentamos rellenar la columna de texto 'autor' basándonos en los IDs de los usuarios
UPDATE N
SET N.autor = U.Nombre
FROM Noticias N
JOIN Usuarios U ON N.autor_id = U.id;
GO

-- Eliminamos la columna de ID que ya no necesitamos
ALTER TABLE Noticias DROP COLUMN autor_id;
GO

-- PASO 2: REVERTIR LOS CAMBIOS EN LA TABLA Clientes
-- Eliminamos la restricción de valores
ALTER TABLE Clientes DROP CONSTRAINT CK_Clientes_EstatusDocumentos;
GO