ALTER TABLE Clientes ADD CONSTRAINT fk_clientes_usuario_id FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE;
