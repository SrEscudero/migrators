-- PASO 1: AÑADIR RESTRICCIÓN A LA TABLA Clientes
-- Esto asegura que solo se puedan insertar valores predefinidos en la columna estatus_documentos.
ALTER TABLE Clientes ADD CONSTRAINT CK_Clientes_EstatusDocumentos
CHECK (estatus_documentos IN ('Registro Inicial', 'Registro por Admin', 'En revisión', 'Aprobado', 'Rechazado', 'Documentos solicitados'));
GO

-- PASO 2: REFACTORIZAR LA TABLA Noticias PARA USAR autor_id EN LUGAR DE UN NOMBRE DE TEXTO
-- Añadimos la nueva columna que contendrá el ID del usuario
ALTER TABLE Noticias ADD autor_id INT NULL;
GO

-- Intentamos rellenar la nueva columna 'autor_id' basándonos en los nombres de los usuarios existentes.
-- NOTA: Esto solo funcionará si los nombres en 'Noticias.autor' coinciden exactamente con 'Usuarios.Nombre'.
UPDATE N
SET N.autor_id = U.id
FROM Noticias N
JOIN Usuarios U ON N.autor = U.Nombre;
GO

-- Una vez que los datos han sido migrados, podemos eliminar la columna de texto antigua.
ALTER TABLE Noticias DROP COLUMN autor;
GO

-- Finalmente, añadimos la clave foránea (Foreign Key) para crear la relación oficial
-- entre la tabla Noticias y la tabla Usuarios.
ALTER TABLE Noticias ADD CONSTRAINT FK_Noticias_Usuarios
FOREIGN KEY (autor_id) REFERENCES Usuarios(id);
GO