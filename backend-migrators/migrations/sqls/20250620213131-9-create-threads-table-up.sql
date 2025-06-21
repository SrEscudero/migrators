CREATE TABLE Threads (
    id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    titulo NVARCHAR(255) NOT NULL,
    contenido NTEXT NULL,
    autor_id INT NOT NULL,
    forum_id INT NOT NULL,
    fecha_creacion DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT fk_threads_autor_id FOREIGN KEY (autor_id) REFERENCES Usuarios(id),
    CONSTRAINT fk_threads_forum_id FOREIGN KEY (forum_id) REFERENCES Forums(id) ON DELETE CASCADE
);