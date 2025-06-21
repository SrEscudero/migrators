CREATE TABLE Posts (
    id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    contenido NTEXT NOT NULL,
    autor_id INT NOT NULL,
    thread_id INT NOT NULL,
    fecha_creacion DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT fk_posts_autor_id FOREIGN KEY (autor_id) REFERENCES Usuarios(id),
    CONSTRAINT fk_posts_thread_id FOREIGN KEY (thread_id) REFERENCES Threads(id) ON DELETE CASCADE
);